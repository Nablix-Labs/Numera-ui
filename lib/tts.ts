'use client';

/**
 * Tutor text-to-speech — two engines behind one `speakTutor()` entry point:
 *
 *   • Browser (Web Speech API)   — the browser voices the reply itself. Zero
 *     latency, no backend, but robotic. This is the default and the fallback.
 *   • Streaming (MediaSource)    — plays OpenAI TTS audio pushed over the voice
 *     WebSocket in chunks (tts_start / tts_chunk / tts_end), so the tutor starts
 *     speaking before the whole clip is generated. Needs Aditya's :8004 server
 *     to emit the contract below.
 *
 * Which one runs is chosen by NEXT_PUBLIC_TTS_MODE:
 *   'browser' (default) → Web Speech only.
 *   'stream'            → play streamed audio; fall back to Web Speech if no
 *                         audio arrives in time, the codec is unsupported, or
 *                         the stream errors.
 *
 * WebSocket message contract (inbound, fed in by useWebSocket):
 *   { type: 'tts_start', utteranceId, mime }            // e.g. 'audio/mpeg'
 *   { type: 'tts_chunk', utteranceId, seq, data }       // base64 audio bytes
 *   { type: 'tts_end',   utteranceId }
 *
 * Both engines drive the 3D avatar's mouth via useMicLevel (setAiSpeaking +
 * markBoundary), so the face animates the same way regardless of engine.
 */

import { useMicLevel } from '@/store/useMicLevel';

export type TtsMode = 'browser' | 'stream';

export function ttsMode(): TtsMode {
  return process.env.NEXT_PUBLIC_TTS_MODE === 'stream' ? 'stream' : 'browser';
}

/** If streamed audio hasn't started this soon after a reply, speak in-browser so
 *  the tutor is never silently mute waiting on a backend that didn't deliver. */
const FALLBACK_MS = 1800;
/** Mouth-flutter pace while streamed audio plays (no real word boundaries in mp3). */
const MOUTH_PULSE_MS = 180;

// ── Browser engine (Web Speech API) ──────────────────────────────────────────
export function speakBrowser(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onstart = () => useMicLevel.getState().setAiSpeaking(true);
  utterance.onboundary = () => useMicLevel.getState().markBoundary();
  utterance.onend = () => useMicLevel.getState().setAiSpeaking(false);
  utterance.onerror = () => useMicLevel.getState().setAiSpeaking(false);
  window.speechSynthesis.cancel();
  useMicLevel.getState().setAiSpeaking(false); // reset before the new utterance starts
  window.speechSynthesis.speak(utterance);
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// ── Streaming engine (MediaSource) ───────────────────────────────────────────
class TutorAudioStream {
  private audio: HTMLAudioElement | null = null;
  private media: MediaSource | null = null;
  private buffer: SourceBuffer | null = null;
  private objectUrl: string | null = null;

  private activeId: string | null = null;
  private nextSeq = 0;
  private pending = new Map<number, Uint8Array<ArrayBuffer>>(); // chunks held until their turn
  private ended = false;

  private pendingText: string | null = null; // reply text, for the browser fallback
  private fallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private mouthTimer: ReturnType<typeof setInterval> | null = null;

  /** A reply was produced. Arm the browser fallback in case no audio streams in. */
  expect(text: string): void {
    this.pendingText = text;
    this.clearFallback();
    this.fallbackTimer = setTimeout(() => {
      const text = this.pendingText;
      this.pendingText = null;
      if (text) speakBrowser(text);
    }, FALLBACK_MS);
  }

  start(utteranceId: string, mime: string): void {
    this.clearFallback();
    window.speechSynthesis?.cancel(); // streamed audio supersedes any browser voice
    this.teardown();

    const supported =
      typeof window !== 'undefined' &&
      typeof MediaSource !== 'undefined' &&
      MediaSource.isTypeSupported(mime);
    if (!supported) {
      // Can't play this stream here — let the reply text fall back to the browser.
      const text = this.pendingText;
      this.pendingText = null;
      if (text) speakBrowser(text);
      return;
    }

    // Keep pendingText until playback actually begins (cleared in onplaying), so a
    // failure before any audio plays can still fall back to the browser voice.
    this.activeId = utteranceId;
    this.nextSeq = 0;
    this.ended = false;
    this.pending.clear();

    const media = new MediaSource();
    this.media = media;
    this.objectUrl = URL.createObjectURL(media);
    const audio = new Audio();
    audio.src = this.objectUrl;
    this.audio = audio;

    media.addEventListener('sourceopen', () => {
      if (this.media !== media) return; // superseded before it opened
      try {
        const buffer = media.addSourceBuffer(mime);
        this.buffer = buffer;
        buffer.addEventListener('updateend', () => this.pump());
        this.pump();
      } catch {
        this.fail();
      }
    });

    audio.onplaying = () => {
      this.pendingText = null; // real audio is playing — no browser fallback needed
      useMicLevel.getState().setAiSpeaking(true);
      this.startMouth();
    };
    audio.onended = () => this.finish();
    audio.onerror = () => this.fail();
    void audio.play().catch(() => { /* may defer until buffered data lands */ });
  }

  chunk(utteranceId: string, seq: number, base64: string): void {
    if (utteranceId !== this.activeId) return;
    this.pending.set(seq, base64ToBytes(base64));
    this.pump();
  }

  end(utteranceId: string): void {
    if (utteranceId !== this.activeId) return;
    this.ended = true;
    this.pump();
  }

  /** Stop any playback/fallback immediately (e.g. student barge-in). */
  stop(): void {
    this.clearFallback();
    this.pendingText = null;
    window.speechSynthesis?.cancel();
    this.teardown();
    useMicLevel.getState().setAiSpeaking(false);
  }

  // Append in-order chunks as they arrive; close the stream once fully drained.
  private pump(): void {
    const buffer = this.buffer;
    const media = this.media;
    if (!buffer || !media || buffer.updating) return;
    const next = this.pending.get(this.nextSeq);
    if (next) {
      this.pending.delete(this.nextSeq);
      this.nextSeq++;
      try {
        buffer.appendBuffer(next);
      } catch {
        this.fail();
      }
      return;
    }
    if (this.ended && this.pending.size === 0 && media.readyState === 'open') {
      try {
        media.endOfStream();
      } catch { /* already ended */ }
    }
  }

  private startMouth(): void {
    if (this.mouthTimer) return;
    this.mouthTimer = setInterval(() => useMicLevel.getState().markBoundary(), MOUTH_PULSE_MS);
  }

  private finish(): void {
    this.stopMouth();
    useMicLevel.getState().setAiSpeaking(false);
    this.teardown();
  }

  // Playback/codec failure → fall back to the browser voice if we still have text.
  private fail(): void {
    const text = this.pendingText;
    this.pendingText = null;
    this.finish();
    if (text) speakBrowser(text);
  }

  private stopMouth(): void {
    if (this.mouthTimer) clearInterval(this.mouthTimer);
    this.mouthTimer = null;
  }

  private clearFallback(): void {
    if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
    this.fallbackTimer = null;
  }

  private teardown(): void {
    this.stopMouth();
    if (this.audio) {
      this.audio.onplaying = this.audio.onended = this.audio.onerror = null;
      try { this.audio.pause(); } catch { /* noop */ }
      this.audio.removeAttribute('src');
      this.audio = null;
    }
    this.buffer = null;
    this.media = null;
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.activeId = null;
    this.pending.clear();
  }
}

export const tutorAudioStream = new TutorAudioStream();

// ── Unified entry point ──────────────────────────────────────────────────────
/** Voice the tutor's reply. In 'stream' mode this arms the streamed player (with
 *  a browser fallback); in 'browser' mode it speaks immediately via Web Speech.
 *  Pass the exact text shown in chat so the audio matches the words on screen. */
export function speakTutor(text: string): void {
  if (!text) return;
  if (ttsMode() === 'stream') {
    tutorAudioStream.expect(text);
  } else {
    speakBrowser(text);
  }
}

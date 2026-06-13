/**
 * Numera — Global Zustand store
 *
 * The frontend is a DISPLAY + INTERACTION layer only.
 * All tutoring logic and session decisions live in the backend.
 * This store holds only UI-relevant state derived from backend events.
 */
import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SessionState =
  | 'idle'
  | 'state_1'   // Warm-up
  | 'state_2'   // Explanation
  | 'state_3'   // Step-by-step
  | 'state_4'   // Student work
  | 'state_5';  // Review

export type DrawingTool = 'pen' | 'eraser' | 'shape' | 'ruler';

export type InputMode = 'voice' | 'text' | 'canvas';

export interface TranscriptMessage {
  id: string;
  role: 'ai' | 'student';
  text: string;
  partial?: boolean; // true while still transcribing
  timestamp: number;
}

export interface NumeraState {
  // Session
  sessionId: string | null;
  sessionState: SessionState;
  activeSlide: number;
  totalSlides: number;

  // Question displayed on canvas (backend-controlled)
  questionText: string;
  questionNumber: number;

  // Voice
  micMuted: boolean;
  voiceStatus: 'idle' | 'listening' | 'speaking' | 'processing';

  // Transcript
  transcript: TranscriptMessage[];

  // Canvas / drawing
  activeTool: DrawingTool;
  strokeColor: string;
  strokeWidth: number;

  // Input mode (voice | text | canvas)
  inputMode: InputMode;
  textInput: string;

  // Actions
  setSessionId: (id: string) => void;
  setSessionState: (s: SessionState) => void;
  setActiveSlide: (n: number) => void;
  setTotalSlides: (n: number) => void;
  setQuestionText: (q: string) => void;
  setQuestionNumber: (n: number) => void;
  toggleMic: () => void;
  setVoiceStatus: (s: NumeraState['voiceStatus']) => void;
  addTranscriptMessage: (msg: Omit<TranscriptMessage, 'id' | 'timestamp'>) => void;
  updatePartialTranscript: (text: string) => void;
  setActiveTool: (t: DrawingTool) => void;
  setStrokeColor: (c: string) => void;
  setStrokeWidth: (w: number) => void;
  setInputMode: (m: InputMode) => void;
  setTextInput: (v: string) => void;
  reset: () => void;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initial: Omit<
  NumeraState,
  | 'setSessionId' | 'setSessionState' | 'setActiveSlide' | 'setTotalSlides'
  | 'setQuestionText' | 'setQuestionNumber' | 'toggleMic' | 'setVoiceStatus'
  | 'addTranscriptMessage' | 'updatePartialTranscript' | 'setActiveTool'
  | 'setStrokeColor' | 'setStrokeWidth' | 'setInputMode' | 'setTextInput' | 'reset'
> = {
  sessionId: null,
  sessionState: 'idle',
  activeSlide: 2,
  totalSlides: 9,
  questionText: '2x + 5 = 13',
  questionNumber: 3,
  micMuted: false,
  voiceStatus: 'listening',
  transcript: [
    {
      id: '1',
      role: 'ai',
      text: 'What do we do first to get the x term on its own?',
      timestamp: Date.now() - 30_000,
    },
    {
      id: '2',
      role: 'student',
      text: 'Subtract 5 from both sides?',
      timestamp: Date.now() - 20_000,
    },
    {
      id: '3',
      role: 'ai',
      text: 'Exactly. So what does the left side become?',
      timestamp: Date.now() - 10_000,
    },
  ],
  activeTool: 'pen',
  strokeColor: '#1a1a1a',
  strokeWidth: 3,
  inputMode: 'voice',
  textInput: '',
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNumeraStore = create<NumeraState>((set) => ({
  ...initial,

  setSessionId: (id) => set({ sessionId: id }),
  setSessionState: (sessionState) => set({ sessionState }),
  setActiveSlide: (activeSlide) => set({ activeSlide }),
  setTotalSlides: (totalSlides) => set({ totalSlides }),
  setQuestionText: (questionText) => set({ questionText }),
  setQuestionNumber: (questionNumber) => set({ questionNumber }),

  toggleMic: () =>
    set((s) => ({
      micMuted: !s.micMuted,
      voiceStatus: s.micMuted ? 'listening' : 'idle',
    })),

  setVoiceStatus: (voiceStatus) => set({ voiceStatus }),

  addTranscriptMessage: (msg) =>
    set((s) => ({
      transcript: [
        ...s.transcript,
        { ...msg, id: crypto.randomUUID(), timestamp: Date.now() },
      ],
    })),

  updatePartialTranscript: (text) =>
    set((s) => {
      const last = s.transcript[s.transcript.length - 1];
      if (last?.partial) {
        return {
          transcript: [
            ...s.transcript.slice(0, -1),
            { ...last, text },
          ],
        };
      }
      return {
        transcript: [
          ...s.transcript,
          {
            id: crypto.randomUUID(),
            role: 'student',
            text,
            partial: true,
            timestamp: Date.now(),
          },
        ],
      };
    }),

  setActiveTool: (activeTool) => set({ activeTool }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setInputMode: (inputMode) => set({ inputMode }),
  setTextInput: (textInput) => set({ textInput }),

  reset: () => set({ ...initial }),
}));

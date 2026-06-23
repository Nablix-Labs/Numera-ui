'use client';

/**
 * Review & Feedback — tutor correction flow.
 *
 * After Independent Practice, each submitted worksheet is reviewed one by one,
 * like a teacher checking a notebook. Two layers:
 *   • Student layer  — the original work, never edited.
 *   • Tutor layer    — an overlay of marks (ticks, a circle on the slip, a
 *                      short label, and the corrected steps in red "ink").
 * The tutor mainly explains by voice; the canvas only marks the key points.
 * A final spoken summary closes the session.
 */

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Check, X, ChevronLeft, ChevronRight, Volume2, Square, Eye, EyeOff, BookOpen,
} from 'lucide-react';
import PageShell, { Chip } from '@/components/PageShell';
import PhaseGate from '@/components/PhaseGate';
import { useNumeraStore } from '@/store/useNumeraStore';
import { cn } from '@/lib/cn';

/** A line of the student's working, with any tutor mark attached. */
interface Line {
  text: string;
  mark?: 'tick' | 'cross';
  circle?: boolean;     // tutor circled this line (the slip)
  label?: string;       // small note beside the circle, e.g. "sign error"
}

interface Worksheet {
  question: string;
  correct: boolean;
  student: Line[];
  corrections?: string[]; // corrected steps the tutor writes in red
  voice: string;          // what the tutor says aloud
}

const WORKSHEETS: Worksheet[] = [
  {
    question: '2x + 5 = 13',
    correct: true,
    student: [
      { text: '2x + 5 = 13', mark: 'tick' },
      { text: '2x = 13 − 5', mark: 'tick' },
      { text: '2x = 8', mark: 'tick' },
      { text: 'x = 4', mark: 'tick' },
    ],
    voice: 'Clean working here. You subtracted five from both sides, then divided by two. The answer x equals four is correct.',
  },
  {
    question: '3(x − 2) = 9',
    correct: false,
    student: [
      { text: '3(x − 2) = 9', mark: 'tick' },
      { text: '3x − 2 = 9', mark: 'cross', circle: true, label: 'expand error' },
      { text: '3x = 11', mark: 'cross' },
      { text: 'x = 11/3', mark: 'cross' },
    ],
    corrections: ['3x − 6 = 9', '3x = 15', 'x = 5'],
    voice: 'Your method is right, but look at this step. When you expand three times the bracket, the minus two becomes minus six, not minus two. So it should be three x minus six. That gives x equals five.',
  },
  {
    question: '4x − 3 = 17',
    correct: true,
    student: [
      { text: '4x − 3 = 17', mark: 'tick' },
      { text: '4x = 17 + 3', mark: 'tick' },
      { text: '4x = 20', mark: 'tick' },
      { text: 'x = 5', mark: 'tick' },
    ],
    voice: 'Good work. You added three to both sides first, then divided by four. x equals five is correct.',
  },
  {
    question: '5(x + 1) = 20',
    correct: false,
    student: [
      { text: '5(x + 1) = 20', mark: 'tick' },
      { text: '5x + 1 = 20', mark: 'cross', circle: true, label: 'expand' },
      { text: '5x = 19', mark: 'cross' },
      { text: 'x = 19/5', mark: 'cross' },
    ],
    corrections: ['5x + 5 = 20', '5x = 15', 'x = 3'],
    voice: 'Here you forgot to expand the bracket. Five times x plus one is five x plus five, not five x plus one. Once you fix that, x equals three.',
  },
  {
    question: '2x − 7 = 9',
    correct: true,
    student: [
      { text: '2x − 7 = 9', mark: 'tick' },
      { text: '2x = 9 + 7', mark: 'tick' },
      { text: '2x = 16', mark: 'tick' },
      { text: 'x = 8', mark: 'tick' },
    ],
    voice: 'Solved confidently. You moved the seven across correctly and divided by two. x equals eight is right.',
  },
];

const SUMMARY =
  'You completed five questions. Three were correct and two need improvement. You understand the method well — just be more careful when expanding brackets before solving.';

/** Tutor's red pen — the only colour outside the grayscale system, by design. */
const INK = '#b42318';

// ── Speech ────────────────────────────────────────────────────────────────
function speak(text: string, onEnd: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) { onEnd(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.98;
  u.onend = onEnd;
  u.onerror = onEnd;
  window.speechSynthesis.speak(u);
}
function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

export default function ReviewPage() {
  const [i, setI] = useState(0);
  const [showMarks, setShowMarks] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const completePhase = useNumeraStore((s) => s.completePhase);

  const total = WORKSHEETS.length;
  const done = i >= total;                 // past the last sheet → final summary
  const ws = WORKSHEETS[Math.min(i, total - 1)];
  const score = WORKSHEETS.filter((w) => w.correct).length;

  // Reaching the final summary clears the review phase.
  useEffect(() => {
    if (done) completePhase('review');
  }, [done, completePhase]);

  const stop = useCallback(() => { stopSpeaking(); setSpeakingId(null); }, []);

  const play = useCallback((id: string, text: string) => {
    if (speakingId === id) { stop(); return; }
    if (id !== 'summary') setShowMarks(true);
    setSpeakingId(id);
    speak(text, () => setSpeakingId(null));
  }, [speakingId, stop]);

  const goto = (next: number) => { stop(); setShowMarks(false); setI(next); };

  return (
    <PhaseGate phase="review">
    <PageShell
      title="Review & feedback"
      subtitle="Linear equations · today"
      action={<Chip tone="solid">{score} / {total}</Chip>}
    >
      <div className="flex flex-col gap-6 max-w-3xl">
        {/* Worksheet progress */}
        <div className="flex items-center gap-1.5">
          {WORKSHEETS.map((w, idx) => (
            <button
              key={idx}
              onClick={() => goto(idx)}
              title={`Worksheet ${idx + 1}`}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                idx === i ? 'bg-[#1a1a1a]' : idx < i ? 'bg-[#9a9a9a]' : 'bg-[#eaeaea]'
              )}
            />
          ))}
          <button
            onClick={() => goto(total)}
            title="Summary"
            className={cn('h-1.5 w-1.5 rounded-full transition-colors', done ? 'bg-[#1a1a1a]' : 'bg-[#eaeaea]')}
          />
        </div>

        {!done ? (
          <>
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold tracking-widest uppercase text-[#9a9a9a]">
                Worksheet {i + 1} of {total}
              </div>
              <button
                onClick={() => setShowMarks((v) => !v)}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#7a7a7a] hover:text-[#1a1a1a] transition-colors"
              >
                {showMarks ? <><EyeOff size={14} strokeWidth={1.8} /> Hide tutor marks</> : <><Eye size={14} strokeWidth={1.8} /> Show tutor marks</>}
              </button>
            </div>

            {/* Paper — student layer with tutor overlay */}
            <div
              className="relative rounded-lg border border-[#c8c8c8] bg-white px-6 py-6 overflow-hidden"
              style={{
                backgroundImage:
                  'linear-gradient(#eef0f2 1px, transparent 1px), linear-gradient(90deg, #eef0f2 1px, transparent 1px)',
                backgroundSize: '26px 26px',
              }}
            >
              <div className="mb-4 inline-flex items-center gap-2">
                <Chip tone="outline">Question {i + 1}</Chip>
                <span className="text-[17px] text-[#1a1a1a] font-[Cambria_Math,Georgia,serif]">{ws.question}</span>
              </div>

              {/* Student working */}
              <div className="flex flex-col gap-2">
                {ws.student.map((ln, idx) => (
                  <div key={idx} className="flex items-center gap-3 min-h-[30px]">
                    {/* tutor tick / cross gutter */}
                    <span className="w-5 flex-shrink-0 flex items-center justify-center">
                      {showMarks && ln.mark === 'tick' && <Check size={16} strokeWidth={2.6} style={{ color: INK }} />}
                      {showMarks && ln.mark === 'cross' && <X size={16} strokeWidth={2.6} style={{ color: INK }} />}
                    </span>
                    {/* student ink (unchanged) — optionally circled by tutor */}
                    <span
                      className="text-[17px] text-[#1a1a1a] font-[Cambria_Math,Georgia,serif] px-1.5 py-0.5 transition-all"
                      style={showMarks && ln.circle ? { boxShadow: `0 0 0 2px ${INK}`, borderRadius: '45% 48% 46% 50%' } : undefined}
                    >
                      {ln.text}
                    </span>
                    {/* tutor label in red */}
                    {showMarks && ln.label && (
                      <span className="text-[12px] font-semibold italic" style={{ color: INK }}>
                        ← {ln.label}
                      </span>
                    )}
                  </div>
                ))}

                {/* tutor corrected steps, written in red below the slip */}
                {showMarks && ws.corrections && (
                  <div className="mt-1 ml-8 pl-3 flex flex-col gap-1" style={{ borderLeft: `2px solid ${INK}` }}>
                    {ws.corrections.map((c, idx) => (
                      <span key={idx} className="text-[16px] font-[Cambria_Math,Georgia,serif]" style={{ color: INK }}>
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tutor voice */}
            <div className="rounded-lg border border-[#c8c8c8] bg-[#f9f9f9] px-5 py-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[10px] tracking-widest uppercase text-[#9a9a9a]">Tutor</span>
                <button
                  onClick={() => play(`ws-${i}`, ws.voice)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#1a1a1a] px-3 py-1.5 text-[12px] font-semibold text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors"
                >
                  {speakingId === `ws-${i}` ? <><Square size={13} strokeWidth={2.2} /> Stop</> : <><Volume2 size={14} strokeWidth={1.9} /> Read out loud</>}
                </button>
              </div>
              <p className="text-[13.5px] text-[#1a1a1a] leading-relaxed">{ws.voice}</p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => goto(Math.max(0, i - 1))}
                disabled={i === 0}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#7a7a7a] hover:text-[#1a1a1a] disabled:opacity-30 disabled:hover:text-[#7a7a7a] transition-colors"
              >
                <ChevronLeft size={15} strokeWidth={1.8} /> Previous
              </button>
              <button
                onClick={() => goto(i + 1)}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] text-white px-5 py-2.5 text-[13px] font-semibold hover:opacity-80 transition-opacity"
              >
                {i + 1 < total ? <>Next worksheet <ChevronRight size={15} strokeWidth={1.8} /></> : <>Finish & summary <ChevronRight size={15} strokeWidth={1.8} /></>}
              </button>
            </div>
          </>
        ) : (
          /* Final spoken summary */
          <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-[#1a1a1a] bg-[#f4f4f4] px-6 py-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="text-[10px] tracking-widest uppercase text-[#9a9a9a]">Final feedback · {score} of {total} correct</div>
                <button
                  onClick={() => play('summary', SUMMARY)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#1a1a1a] px-3 py-1.5 text-[12px] font-semibold text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors"
                >
                  {speakingId === 'summary' ? <><Square size={13} strokeWidth={2.2} /> Stop</> : <><Volume2 size={14} strokeWidth={1.9} /> Read out loud</>}
                </button>
              </div>
              <p className="text-[14px] text-[#1a1a1a] leading-relaxed">{SUMMARY}</p>
            </div>

            {/* Per-worksheet recap */}
            <div className="rounded-lg border border-[#c8c8c8] divide-y divide-[#eaeaea] overflow-hidden">
              {WORKSHEETS.map((w, idx) => (
                <button
                  key={idx}
                  onClick={() => goto(idx)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-[#f9f9f9] transition-colors"
                >
                  <span className={cn('flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center', w.correct ? 'bg-[#1a1a1a] text-white' : 'border border-[#9a9a9a] text-[#7a7a7a]')}>
                    {w.correct ? <Check size={13} strokeWidth={2.4} /> : <X size={13} strokeWidth={2.4} />}
                  </span>
                  <span className="text-[15px] text-[#1a1a1a] font-[Cambria_Math,Georgia,serif] flex-1">{w.question}</span>
                  <ChevronRight size={15} strokeWidth={1.8} className="text-[#9a9a9a]" />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => goto(total - 1)}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#7a7a7a] hover:text-[#1a1a1a] transition-colors"
              >
                <ChevronLeft size={15} strokeWidth={1.8} /> Back to worksheets
              </button>
              <Link
                href="/keynotes"
                className="inline-flex items-center gap-2 rounded-md bg-[#1a1a1a] text-white px-5 py-2.5 text-[13px] font-semibold hover:opacity-80 transition-opacity"
              >
                <BookOpen size={15} strokeWidth={1.9} /> Key Notes at a glance
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageShell>
    </PhaseGate>
  );
}

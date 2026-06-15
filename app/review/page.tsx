'use client';

/**
 * Feedback & review — after a session, the AI reviews each question, flags
 * where the student is lagging, and lets them schedule a follow-up guided
 * session (which would be followed by practice). Mock data; backend supplies
 * the real per-question marking and scheduling.
 */

import { useState } from 'react';
import { Check, X, CalendarClock } from 'lucide-react';
import PageShell, { Chip } from '@/components/PageShell';
import { cn } from '@/lib/cn';

interface Result {
  question: string;
  correct: boolean;
  note: string;
}

const RESULTS: Result[] = [
  { question: '2x + 5 = 13', correct: true, note: 'Clean working — subtracted then divided correctly.' },
  { question: '3(x − 2) = 9', correct: false, note: 'Expanded to 3x − 2 instead of 3x − 6.' },
  { question: '4x − 3 = 17', correct: true, note: 'Good — added 3 to both sides first.' },
  { question: '5(x + 1) = 20', correct: false, note: 'Forgot to expand the bracket before solving.' },
  { question: '2x − 7 = 9', correct: true, note: 'Solved confidently.' },
];

const SLOTS = ['Today 5:00 PM', 'Tomorrow 4:00 PM', 'Sat 11:00 AM'];

export default function ReviewPage() {
  const [booked, setBooked] = useState<string | null>(null);
  const score = RESULTS.filter((r) => r.correct).length;

  return (
    <PageShell
      title="Session review"
      subtitle="Linear equations · today"
      action={<Chip tone="solid">{score} / {RESULTS.length}</Chip>}
    >
      <div className="flex flex-col gap-7 max-w-3xl">
        {/* Lagging callout */}
        <div className="rounded-lg border border-[#1a1a1a] bg-[#f4f4f4] px-5 py-4">
          <div className="text-[10px] tracking-widest uppercase text-[#9a9a9a] mb-1">Where to focus</div>
          <p className="text-[13.5px] text-[#1a1a1a] leading-snug">
            You&apos;re losing marks on <b>expanding brackets</b> — the slips were inside the bracket, not the solving.
            A short guided session on that would help before more practice.
          </p>
        </div>

        {/* Per-question results */}
        <section>
          <div className="text-[11px] font-semibold tracking-widest uppercase text-[#9a9a9a] mb-2.5">Your answers</div>
          <div className="rounded-lg border border-[#c8c8c8] divide-y divide-[#eaeaea] overflow-hidden">
            {RESULTS.map((r) => (
              <div key={r.question} className="flex items-start gap-4 px-5 py-3.5">
                <span className={cn('flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center', r.correct ? 'bg-[#1a1a1a] text-white' : 'border border-[#9a9a9a] text-[#7a7a7a]')}>
                  {r.correct ? <Check size={13} strokeWidth={2.4} /> : <X size={13} strokeWidth={2.4} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] text-[#1a1a1a] font-[Cambria_Math,Georgia,serif]">{r.question}</div>
                  <div className="text-[12px] text-[#7a7a7a] mt-0.5">{r.note}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Scheduler */}
        <section>
          <div className="flex items-center gap-2 mb-2.5">
            <CalendarClock size={15} strokeWidth={1.8} className="text-[#1a1a1a]" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#9a9a9a]">Schedule a follow-up</span>
          </div>
          {booked ? (
            <div className="rounded-lg border border-[#1a1a1a] bg-white px-5 py-4 text-[13px] text-[#1a1a1a]">
              Booked a guided session on <b>{booked}</b> — practice will follow it. See you then.
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              {SLOTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setBooked(s)}
                  className="rounded-md border border-[#9a9a9a] bg-white px-4 py-2.5 text-[12.5px] font-semibold text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}

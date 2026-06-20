'use client';

/**
 * Concept Orientation — the micro-learning screen that opens a topic before
 * Guided Practice. A few short, swipeable concept cards: what it is, why it
 * matters, and one tiny worked example — then into the guided lesson.
 */

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, ArrowRight, Compass } from 'lucide-react';
import { getTopic } from '@/lib/curriculum';
import { cn } from '@/lib/cn';

interface Card { kicker: string; title: string; body: string; example?: string }

// Short concept intro per topic; a generic intro covers anything unmapped.
const ORIENTATION: Record<string, Card[]> = {
  algebra: [
    { kicker: 'The idea', title: 'Letters stand for numbers', body: 'In algebra a letter like x is just an unknown number. Solving means finding the value that makes the equation true.' },
    { kicker: 'Why it matters', title: 'Keep both sides balanced', body: 'An equation is a balance. Whatever you do to one side, do to the other, and it stays true.' },
    { kicker: 'Tiny example', title: 'Undo to find x', body: 'To get x alone, undo what is around it — one careful step at a time.', example: 'x + 3 = 7  →  x = 7 − 3  →  x = 4' },
  ],
  number: [
    { kicker: 'The idea', title: 'Fractions are parts of a whole', body: 'The bottom number says how many equal parts; the top says how many you have.' },
    { kicker: 'Why it matters', title: 'Same bottom to add', body: 'You can only add or subtract fractions once the denominators match.' },
    { kicker: 'Tiny example', title: 'Make denominators equal', body: 'Find a common denominator, then add the tops.', example: '1/2 + 1/4  →  2/4 + 1/4  →  3/4' },
  ],
  geometry: [
    { kicker: 'The idea', title: 'Angles measure turn', body: 'An angle is how much you rotate between two lines, measured in degrees.' },
    { kicker: 'Why it matters', title: 'Angle rules are shortcuts', body: 'Knowing that a straight line is 180° lets you find missing angles fast.' },
    { kicker: 'Tiny example', title: 'Fill the gap to 180°', body: 'Angles on a straight line add to 180°.', example: '120° + ?  = 180°  →  ? = 60°' },
  ],
  statistics: [
    { kicker: 'The idea', title: 'Averages summarise data', body: 'An average is one number that stands in for a whole set of values.' },
    { kicker: 'Why it matters', title: 'Pick the right average', body: 'Mean, median and mode each describe the data differently.' },
    { kicker: 'Tiny example', title: 'Mean = total ÷ count', body: 'Add the values, divide by how many there are.', example: '(4 + 6 + 8) ÷ 3  =  6' },
  ],
};

const GENERIC: Card[] = [
  { kicker: 'The idea', title: 'A quick look first', body: 'Before practising, here is the core idea of this topic in plain language.' },
  { kicker: 'Why it matters', title: 'Build the foundation', body: 'Getting the concept first makes the guided practice click much faster.' },
];

export default function OrientationClient({ topicId }: { topicId: string }) {
  const topic = getTopic(topicId);
  const cards = ORIENTATION[topicId] ?? GENERIC;
  const [i, setI] = useState(0);

  if (!topic) notFound();

  const card = cards[i];
  const last = i === cards.length - 1;

  return (
    <main className="flex-1 min-w-0 flex flex-col bg-white" aria-label="Concept orientation">
      <header className="flex items-center justify-between gap-4 px-8 py-6 border-b border-[#c8c8c8] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg bg-[#1a1a1a] text-white flex items-center justify-center">
            <Compass size={17} strokeWidth={1.8} />
          </span>
          <div>
            <div className="text-[10px] tracking-widest uppercase text-[#9a9a9a]">Orientation · micro-learning</div>
            <h1 className="text-[16px] font-semibold text-[#1a1a1a] leading-tight">{topic.title}</h1>
          </div>
        </div>
        <Link href={`/workbook/${topic.id}`} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#7a7a7a] hover:text-[#1a1a1a] transition-colors">
          <ChevronLeft size={15} strokeWidth={1.8} /> Topic
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
        <div className="w-[520px] max-w-full">
          {/* progress dots */}
          <div className="flex items-center gap-1.5 mb-6 justify-center">
            {cards.map((_, idx) => (
              <span key={idx} className={cn('h-1.5 rounded-full transition-all', idx === i ? 'w-6 bg-[#1a1a1a]' : 'w-1.5 bg-[#dadada]')} />
            ))}
          </div>

          <div className="rounded-xl border border-[#c8c8c8] bg-white p-7">
            <div className="text-[10px] tracking-widest uppercase text-[#9a9a9a] mb-2">{card.kicker}</div>
            <h2 className="text-[20px] font-semibold text-[#1a1a1a] leading-snug">{card.title}</h2>
            <p className="text-[14px] text-[#5a5a5a] leading-relaxed mt-2.5">{card.body}</p>
            {card.example && (
              <div className="mt-4 rounded-lg border border-[#9a9a9a] bg-[#f4f4f4] px-4 py-3 text-[15px] text-[#1a1a1a] font-[Cambria_Math,Georgia,serif]">
                {card.example}
              </div>
            )}
          </div>

          {/* nav */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setI((n) => Math.max(0, n - 1))}
              disabled={i === 0}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#7a7a7a] hover:text-[#1a1a1a] disabled:opacity-30 disabled:hover:text-[#7a7a7a] transition-colors"
            >
              <ChevronLeft size={15} strokeWidth={1.8} /> Back
            </button>

            {last ? (
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1a1a1a] text-white px-5 py-2.5 text-[13px] font-semibold hover:opacity-80 transition-opacity"
              >
                Start guided practice <ArrowRight size={16} strokeWidth={2} />
              </Link>
            ) : (
              <button
                onClick={() => setI((n) => Math.min(cards.length - 1, n + 1))}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#1a1a1a] text-[#1a1a1a] px-4 py-2.5 text-[12.5px] font-semibold hover:bg-[#1a1a1a] hover:text-white transition-colors"
              >
                Next <ChevronRight size={15} strokeWidth={1.8} />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

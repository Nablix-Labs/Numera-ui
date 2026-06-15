'use client';

/**
 * Revise at a glance — a last-minute revision view pulling together what to
 * look at now: in-progress lessons, flagged problems, and key topics.
 */

import Link from 'next/link';
import { Clock, Flag, Star } from 'lucide-react';
import PageShell, { Chip } from '@/components/PageShell';
import { useNumeraStore } from '@/store/useNumeraStore';
import { CURRICULUM, effectiveStatus } from '@/lib/curriculum';

const FLAGGED = [
  { equation: '3(x − 2) = 9', topic: 'Expanding Brackets' },
  { equation: '7/8 − 1/3', topic: 'Fractions' },
  { equation: 'x² − 5x + 6 = 0', topic: 'Quadratics' },
];

const KEY_TOPICS = [
  { title: 'Linear equations', why: 'Foundation for everything in algebra.' },
  { title: 'Fractions', why: 'Shows up across number and ratio.' },
  { title: 'Angle rules', why: 'Frequently tested in geometry.' },
];

export default function RevisePage() {
  const completed = useNumeraStore((s) => s.completedLessons);

  const inProgress = CURRICULUM.flatMap((t) =>
    t.subtopics.flatMap((s) =>
      s.lessons
        .filter((l) => effectiveStatus(l, completed) === 'in-progress')
        .map((l) => ({ topic: t.title, sub: s.title, lesson: l.title }))
    )
  );

  return (
    <PageShell
      title="Revise at a glance"
      subtitle="A quick view of what's worth a look right now."
    >
      <div className="flex flex-col gap-7 max-w-3xl">
        {/* Pick up where you left off */}
        <Section icon={<Clock size={15} strokeWidth={1.8} />} title="Pick up where you left off">
          {inProgress.length === 0 ? (
            <Empty text="Nothing in progress — start a new lesson from the Workbook." />
          ) : (
            <List>
              {inProgress.map((x) => (
                <Row key={x.lesson} primary={x.lesson} secondary={`${x.topic} · ${x.sub}`} action="Resume" />
              ))}
            </List>
          )}
        </Section>

        {/* Flagged */}
        <Section icon={<Flag size={15} strokeWidth={1.8} />} title="Flagged for review" right={<Chip>{FLAGGED.length}</Chip>}>
          <List>
            {FLAGGED.map((f) => (
              <Row
                key={f.equation}
                primary={<span className="font-[Cambria_Math,Georgia,serif]">{f.equation}</span>}
                secondary={f.topic}
                action="Open"
              />
            ))}
          </List>
        </Section>

        {/* Key topics */}
        <Section icon={<Star size={15} strokeWidth={1.8} />} title="Key topics">
          <List>
            {KEY_TOPICS.map((t) => (
              <Row key={t.title} primary={t.title} secondary={t.why} action="Revise" />
            ))}
          </List>
        </Section>
      </div>
    </PageShell>
  );
}

function Section({ icon, title, right, children }: { icon: React.ReactNode; title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[#1a1a1a]">{icon}</span>
        <span className="text-[11px] font-semibold tracking-widest uppercase text-[#9a9a9a]">{title}</span>
        {right}
      </div>
      {children}
    </section>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-[#c8c8c8] divide-y divide-[#eaeaea] overflow-hidden">{children}</div>;
}

function Row({ primary, secondary, action }: { primary: React.ReactNode; secondary: string; action: string }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f9f9f9] transition-colors">
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] text-[#1a1a1a]">{primary}</div>
        <div className="text-[11.5px] text-[#9a9a9a] mt-0.5">{secondary}</div>
      </div>
      <Link href="/" className="flex-shrink-0 text-[12px] font-semibold text-[#1a1a1a] underline-offset-4 hover:underline">
        {action}
      </Link>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-[12.5px] text-[#9a9a9a]">{text}</p>;
}

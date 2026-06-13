import Link from 'next/link';
import PageShell, { Chip, ProgressBar } from '@/components/PageShell';

interface Unit {
  title: string;
  topic: string;
  done: number;
  total: number;
  status: 'mastered' | 'in-progress' | 'not-started' | 'locked';
}

const UNITS: Unit[] = [
  { title: 'Linear Equations', topic: 'Algebra', done: 8, total: 8, status: 'mastered' },
  { title: 'Solving for x', topic: 'Algebra', done: 3, total: 6, status: 'in-progress' },
  { title: 'Fractions & Ratios', topic: 'Number', done: 5, total: 9, status: 'in-progress' },
  { title: 'Expanding Brackets', topic: 'Algebra', done: 0, total: 7, status: 'not-started' },
  { title: 'Angles & Polygons', topic: 'Geometry', done: 0, total: 10, status: 'not-started' },
  { title: 'Quadratic Equations', topic: 'Algebra', done: 0, total: 12, status: 'locked' },
];

const STATUS_LABEL: Record<Unit['status'], string> = {
  mastered: 'Mastered',
  'in-progress': 'In progress',
  'not-started': 'Not started',
  locked: 'Locked',
};

export default function WorkbookPage() {
  return (
    <PageShell
      title="Workbook"
      subtitle="Your maths units — pick up where you left off."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {UNITS.map((u) => {
          const locked = u.status === 'locked';
          const pct = u.total ? Math.round((u.done / u.total) * 100) : 0;
          return (
            <div
              key={u.title}
              className={cardClass(locked)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] tracking-[1px] uppercase text-[#9a9a9a]">{u.topic}</div>
                  <h2 className="text-[15px] font-semibold text-[#1a1a1a] mt-0.5">{u.title}</h2>
                </div>
                <Chip tone={u.status === 'mastered' ? 'solid' : 'muted'}>
                  {STATUS_LABEL[u.status]}
                </Chip>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-[11px] text-[#7a7a7a] mb-1.5">
                  <span>{u.done} / {u.total} exercises</span>
                  <span>{pct}%</span>
                </div>
                <ProgressBar value={pct} />
              </div>

              {locked ? (
                <p className="mt-5 text-[11.5px] text-[#9a9a9a]">
                  Complete earlier units to unlock.
                </p>
              ) : (
                <Link
                  href="/"
                  className="mt-5 inline-flex items-center justify-center rounded-md bg-[#1a1a1a] text-white text-[12px] font-semibold px-3.5 py-2 hover:opacity-80 transition-opacity"
                >
                  {u.done === 0 ? 'Start' : u.done === u.total ? 'Review' : 'Continue'}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

function cardClass(locked: boolean) {
  return [
    'flex flex-col rounded-lg border border-[#c8c8c8] bg-white p-5 transition-colors',
    locked ? 'opacity-55' : 'hover:border-[#9a9a9a]',
  ].join(' ');
}

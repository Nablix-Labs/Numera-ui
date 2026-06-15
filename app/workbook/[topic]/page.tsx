import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Check } from 'lucide-react';
import PageShell, { Chip } from '@/components/PageShell';
import { CURRICULUM, getTopic, type LessonStatus } from '@/lib/curriculum';

// Pre-render a page per topic
export function generateStaticParams() {
  return CURRICULUM.map((t) => ({ topic: t.id }));
}

const ACTION: Record<LessonStatus, string> = {
  mastered: 'Learn again',
  'in-progress': 'Continue',
  'not-started': 'Start',
};

export default function TopicPage({ params }: { params: { topic: string } }) {
  const topic = getTopic(params.topic);
  if (!topic) notFound();

  return (
    <PageShell
      title={topic.title}
      subtitle={topic.blurb}
      action={
        <Link
          href="/workbook"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#7a7a7a] hover:text-[#1a1a1a] transition-colors"
        >
          <ChevronLeft size={15} strokeWidth={1.8} /> Workbook
        </Link>
      }
    >
      <div className="flex flex-col gap-7 max-w-3xl">
        {topic.subtopics.map((sub) => (
          <section key={sub.id}>
            <div className="text-[11px] font-semibold tracking-widest uppercase text-[#9a9a9a] mb-2.5">
              {sub.title}
            </div>
            <div className="rounded-lg border border-[#c8c8c8] divide-y divide-[#eaeaea] overflow-hidden">
              {sub.lessons.map((l) => {
                const done = l.status === 'mastered';
                return (
                  <div key={l.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f9f9f9] transition-colors">
                    {/* status circle */}
                    <span
                      className={
                        'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border ' +
                        (done ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white' : 'border-[#9a9a9a] text-transparent')
                      }
                    >
                      {done && <Check size={13} strokeWidth={2.4} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className={'text-[13.5px] ' + (done ? 'text-[#7a7a7a]' : 'text-[#1a1a1a] font-medium')}>
                        {l.title}
                      </div>
                    </div>
                    {l.status === 'in-progress' && <Chip>In progress</Chip>}
                    <Link
                      href="/"
                      className="flex-shrink-0 inline-flex items-center justify-center rounded-md border border-[#1a1a1a] text-[#1a1a1a] text-[12px] font-semibold px-3.5 py-1.5 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                    >
                      {ACTION[l.status]}
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

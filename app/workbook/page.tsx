'use client';

import Link from 'next/link';
import { Folder } from 'lucide-react';
import PageShell, { ProgressBar } from '@/components/PageShell';
import { useNumeraStore } from '@/store/useNumeraStore';
import { CURRICULUM, topicLessons, topicProgressWith } from '@/lib/curriculum';

export default function WorkbookPage() {
  const completed = useNumeraStore((s) => s.completedLessons);

  return (
    <PageShell
      title="Workbook"
      subtitle="Your topics and subtopics — open a folder to learn or revise."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CURRICULUM.map((t) => {
          const lessons = topicLessons(t);
          const pct = topicProgressWith(t, completed);
          return (
            <Link
              key={t.id}
              href={`/workbook/${t.id}`}
              className="flex flex-col rounded-lg border border-[#c8c8c8] bg-white p-5 hover:border-[#9a9a9a] transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-10 h-10 rounded-lg border border-[#c8c8c8] bg-[#f4f4f4] flex items-center justify-center">
                  <Folder size={18} strokeWidth={1.6} />
                </span>
                <div>
                  <h2 className="text-[15px] font-semibold text-[#1a1a1a]">{t.title}</h2>
                  <p className="text-[11.5px] text-[#7a7a7a] mt-0.5">{t.blurb}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-[11px] text-[#7a7a7a] mb-1.5">
                  <span>{t.subtopics.length} subtopics · {lessons.length} lessons</span>
                  <span>{pct}%</span>
                </div>
                <ProgressBar value={pct} />
              </div>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}

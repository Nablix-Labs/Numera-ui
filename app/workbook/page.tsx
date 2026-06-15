'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Folder, ClipboardCheck } from 'lucide-react';
import PageShell, { ProgressBar, Chip } from '@/components/PageShell';
import { useNumeraStore } from '@/store/useNumeraStore';
import {
  CURRICULUM, KEY_STAGES, topicLessons, topicProgressWith, topicKeyStages,
  type KeyStage,
} from '@/lib/curriculum';
import { cn } from '@/lib/cn';

export default function WorkbookPage() {
  const completed = useNumeraStore((s) => s.completedLessons);
  const [ks, setKs] = useState<KeyStage | 'all'>('all');

  const topics = CURRICULUM.filter(
    (t) => ks === 'all' || topicKeyStages(t).includes(ks)
  );

  return (
    <PageShell
      title="Workbook"
      subtitle="Your topics and subtopics — UK curriculum, A-Level aligned."
      action={
        <Link href="/diagnostic" className="inline-flex items-center gap-1.5 rounded-md border border-[#9a9a9a] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#1a1a1a] hover:bg-[#f4f4f4] transition-colors">
          <ClipboardCheck size={15} strokeWidth={1.8} /> Take diagnostic
        </Link>
      }
    >
      {/* Key Stage filter */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setKs('all')}
          className={chip(ks === 'all')}
        >
          All
        </button>
        {KEY_STAGES.map((k) => (
          <button key={k.id} onClick={() => setKs(k.id)} title={k.ages} className={chip(ks === k.id)}>
            {k.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {topics.map((t) => {
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
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold text-[#1a1a1a]">{t.title}</h2>
                  <p className="text-[11.5px] text-[#7a7a7a] mt-0.5">{t.blurb}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {topicKeyStages(t).map((k) => <Chip key={k}>{k}</Chip>)}
              </div>

              <div className="mt-4">
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

function chip(active: boolean) {
  return cn(
    'rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors',
    active ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-[#7a7a7a] border-[#c8c8c8] hover:border-[#9a9a9a]'
  );
}

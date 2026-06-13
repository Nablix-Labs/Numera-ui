'use client';

import { useNumeraStore } from '@/store/useNumeraStore';
import TutorTile from './TutorTile';
import VoiceBar from './VoiceBar';
import Transcript from './Transcript';

/** Student camera placeholder tile */
function StudentTile() {
  return (
    <div
      className="relative border border-[#9a9a9a] rounded-md overflow-hidden"
      style={{ aspectRatio: '4/3' }}
      aria-label="Student camera"
    >
      {/* Striped placeholder */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg,#ededed,#ededed 9px,#f7f7f7 9px,#f7f7f7 18px)',
        }}
      >
        <span className="font-mono text-[10px] text-[#9a9a9a] tracking-tight">
          [ student camera ]
        </span>
      </div>
      {/* Name tag */}
      <div className="absolute left-2 bottom-2 bg-[rgba(26,26,26,0.82)] text-white text-[9.5px] px-2 py-0.5 rounded">
        You
      </div>
    </div>
  );
}

export default function MediaPanel() {
  const sessionState = useNumeraStore((s) => s.sessionState);

  const stateLabel: Record<string, string> = {
    idle:    'Idle',
    state_1: 'Warm-up',
    state_2: 'Explanation',
    state_3: 'Step-by-step',
    state_4: 'Guided Practice',
    state_5: 'Review',
  };

  return (
    <aside
      className="flex flex-col flex-shrink-0 border-r border-[#c8c8c8] min-h-0"
      style={{ width: 234 }}
      aria-label="Tutor and student panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-3.5 border-b border-[#c8c8c8] flex-shrink-0">
        <div>
          <div className="text-sm font-semibold tracking-[0.4px]">Numera</div>
          <div className="text-[8.5px] font-normal text-[#9a9a9a] tracking-[1.5px] uppercase">by Nablix</div>
        </div>
        <div className="border border-[#9a9a9a] rounded-full px-2.5 py-1 text-[10px] tracking-[0.4px] flex items-center gap-1.5 text-[#7a7a7a]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] inline-block" />
          {stateLabel[sessionState] ?? 'Guided'}
        </div>
      </div>

      {/* Video tiles */}
      <div className="px-3.5 pt-3.5 pb-1.5 flex flex-col gap-3 flex-shrink-0">
        <TutorTile />
        <StudentTile />
      </div>

      {/* Voice controls */}
      <VoiceBar />

      {/* Transcript */}
      <Transcript />
    </aside>
  );
}

'use client';

/**
 * PresenceBar — top-right cluster showing who's in the live session plus an
 * invite/manage entry point. Sits above the canvas.
 */

import { UserPlus, Users } from 'lucide-react';
import { useNumeraStore } from '@/store/useNumeraStore';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function PresenceBar({ onInvite }: { onInvite: () => void }) {
  const { sessionMode, participants } = useNumeraStore();
  const inGroup = sessionMode === 'group';

  return (
    <div className="absolute top-[22px] right-[34px] z-20 flex items-center gap-2">
      {inGroup && (
        <div className="flex items-center -space-x-2 mr-1">
          {participants.map((p) => (
            <span
              key={p.id}
              title={p.name}
              className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-semibold text-white"
              style={{ background: p.color }}
            >
              {initials(p.name)}
            </span>
          ))}
          {participants.length === 0 && (
            <span className="text-[11px] text-[#9a9a9a]">Waiting for others…</span>
          )}
        </div>
      )}

      <button
        onClick={onInvite}
        className="flex items-center gap-1.5 rounded-full border border-[#9a9a9a] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1a1a1a] hover:bg-[#f4f4f4] transition-colors"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        {inGroup
          ? <><Users size={15} strokeWidth={1.8} /> {participants.length + 1} in session</>
          : <><UserPlus size={15} strokeWidth={1.8} /> Invite</>}
      </button>
    </div>
  );
}

'use client';

/**
 * SharedBoard — the AI-controlled board everyone sees in Group Challenge Mode.
 * Shows the AI's live commentary and the currently spotlighted work (good work
 * named, mistakes anonymous), per the privacy rules.
 */

import { Check, AlertCircle, Sparkles, Radio } from 'lucide-react';
import { useNumeraStore } from '@/store/useNumeraStore';
import { cn } from '@/lib/cn';

export default function SharedBoard() {
  const commentary = useNumeraStore((s) => s.commentary);
  const spotlight = useNumeraStore((s) => s.spotlight);

  return (
    <aside
      className="flex-shrink-0 w-[320px] border-l border-[#c8c8c8] bg-white flex flex-col min-h-0"
      aria-label="Shared board"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#c8c8c8] flex-shrink-0">
        <Radio size={16} strokeWidth={1.8} className="text-[#1a1a1a]" />
        <span className="text-[13px] font-semibold text-[#1a1a1a]">Shared board</span>
        <span className="ml-auto text-[10px] tracking-widest uppercase text-[#9a9a9a]">AI-led</span>
      </div>

      {/* Spotlight */}
      {spotlight && (
        <div className="px-5 py-4 border-b border-[#eaeaea]">
          <div className="text-[10px] tracking-widest uppercase text-[#9a9a9a] mb-2">On the board</div>
          <div
            className={cn(
              'rounded-lg border p-3.5',
              spotlight.kind === 'good' && 'border-[#1a1a1a] bg-[#f4f4f4]',
              spotlight.kind === 'mistake' && 'border-dashed border-[#9a9a9a] bg-white',
              spotlight.kind === 'solution' && 'border-[#1a1a1a] bg-white'
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {spotlight.kind === 'good' && <Check size={15} strokeWidth={2} className="text-[#1a1a1a]" />}
              {spotlight.kind === 'mistake' && <AlertCircle size={15} strokeWidth={1.8} className="text-[#7a7a7a]" />}
              {spotlight.kind === 'solution' && <Sparkles size={15} strokeWidth={1.8} className="text-[#1a1a1a]" />}
              <span className="text-[11px] font-semibold tracking-wide uppercase text-[#7a7a7a]">
                {spotlight.kind === 'good' ? 'Good work' : spotlight.kind === 'mistake' ? 'Learning moment' : 'Solution step'}
                {spotlight.studentName ? ` · ${spotlight.studentName}` : spotlight.kind === 'mistake' ? ' · anonymous' : ''}
              </span>
            </div>
            <p className="text-[12.5px] text-[#1a1a1a] leading-snug">{spotlight.caption}</p>
          </div>
        </div>
      )}

      {/* Commentary feed */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        <div className="text-[10px] tracking-widest uppercase text-[#9a9a9a] mb-3">Live commentary</div>
        {commentary.length === 0 ? (
          <p className="text-[12px] text-[#9a9a9a]">The tutor will comment as the group works…</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {commentary.map((c) => (
              <div key={c.id} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
                <p className="text-[12.5px] text-[#1a1a1a] leading-snug">
                  {c.text}
                  {c.tone === 'hint' && <span className="ml-1 text-[10px] tracking-wide uppercase text-[#9a9a9a]">hint</span>}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

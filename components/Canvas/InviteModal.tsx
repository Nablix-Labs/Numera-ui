'use client';

/**
 * InviteModal — start/manage a group live session: shareable join link,
 * participant list, and start/leave. Backed by the mock collab layer for now.
 */

import { useMemo, useState } from 'react';
import { X, Copy, Check, LogOut, Users } from 'lucide-react';
import { useNumeraStore } from '@/store/useNumeraStore';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sessionMode, participants, startGroupSession, endGroupSession } = useNumeraStore();
  const [copied, setCopied] = useState(false);

  // Stable mock join code for this view
  const code = useMemo(() => Math.random().toString(36).slice(2, 8).toUpperCase(), []);
  const link = `numera.app/join/${code}`;

  if (!open) return null;
  const inGroup = sessionMode === 'group';

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/20"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Group session"
    >
      <div className="w-[380px] max-w-[90%] bg-white border border-[#9a9a9a] rounded-xl overflow-hidden" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.22)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eaeaea]">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[#1a1a1a]">
            <Users size={17} strokeWidth={1.8} /> Group session
          </div>
          <button onClick={onClose} aria-label="Close" className="w-7 h-7 rounded-md flex items-center justify-center text-[#7a7a7a] hover:bg-[#f4f4f4]">
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <p className="text-[12.5px] text-[#7a7a7a] leading-snug">
            Invite friends to learn together on this canvas with one shared AI tutor.
          </p>

          {/* Share link */}
          <div className="flex items-center gap-2">
            <div className="flex-1 truncate rounded-md border border-[#c8c8c8] bg-[#f4f4f4] px-3 py-2 text-[12px] text-[#1a1a1a] font-mono">
              {link}
            </div>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 rounded-md bg-[#1a1a1a] text-white px-3 py-2 text-[12px] font-semibold hover:opacity-80 transition-opacity"
            >
              {copied ? <><Check size={14} strokeWidth={2} /> Copied</> : <><Copy size={14} strokeWidth={1.8} /> Copy</>}
            </button>
          </div>

          {/* Participants */}
          {inGroup && (
            <div>
              <div className="text-[10px] tracking-widest uppercase text-[#9a9a9a] mb-2">In this session</div>
              <div className="flex flex-col gap-1.5">
                <Row name="You" color="#1a1a1a" you />
                {participants.map((p) => <Row key={p.id} name={p.name} color={p.color} />)}
                {participants.length === 0 && (
                  <span className="text-[12px] text-[#9a9a9a]">Waiting for others to join…</span>
                )}
              </div>
            </div>
          )}

          {/* Action */}
          {inGroup ? (
            <button
              onClick={() => { endGroupSession(); onClose(); }}
              className="mt-1 flex items-center justify-center gap-2 rounded-md border border-[#9a9a9a] text-[#1a1a1a] px-4 py-2.5 text-[13px] font-semibold hover:bg-[#f4f4f4] transition-colors"
            >
              <LogOut size={15} strokeWidth={1.8} /> Leave session
            </button>
          ) : (
            <button
              onClick={() => startGroupSession()}
              className="mt-1 rounded-md bg-[#1a1a1a] text-white px-4 py-2.5 text-[13px] font-semibold hover:opacity-80 transition-opacity"
            >
              Start group session
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ name, color, you }: { name: string; color: string; you?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white" style={{ background: color }}>
        {initials(name)}
      </span>
      <span className="text-[13px] text-[#1a1a1a]">{name}{you && <span className="text-[#9a9a9a]"> (you)</span>}</span>
    </div>
  );
}

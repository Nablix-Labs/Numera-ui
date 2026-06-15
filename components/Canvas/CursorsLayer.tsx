'use client';

/**
 * CursorsLayer — renders remote participants' live cursors over the canvas.
 * Cursor positions are normalised 0–1 and scaled to the layer size here.
 * Non-interactive (pointer-events-none) so it never blocks drawing.
 */

import { useEffect, useRef, useState } from 'react';
import { useNumeraStore } from '@/store/useNumeraStore';

export default function CursorsLayer() {
  const participants = useNumeraStore((s) => s.participants);
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 z-[15] pointer-events-none overflow-hidden" aria-hidden="true">
      {participants.map((p) =>
        p.cursor ? (
          <div
            key={p.id}
            className="absolute transition-[left,top] duration-300 ease-out"
            style={{ left: p.cursor.x * size.w, top: p.cursor.y * size.h }}
          >
            {/* pointer */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill={p.color} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round">
              <path d="M5 3 l0 16 l4 -4 l3 7 l3 -1 l-3 -7 l6 0 z" />
            </svg>
            {/* name tag */}
            <span
              className="absolute left-4 top-3 whitespace-nowrap text-[10px] font-semibold text-white px-1.5 py-0.5 rounded"
              style={{ background: p.color }}
            >
              {p.name}
            </span>
          </div>
        ) : null
      )}
    </div>
  );
}

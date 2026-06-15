'use client';

import { useEffect, useRef, useState } from 'react';
import { GripVertical, ChevronDown } from 'lucide-react';
import { useNumeraStore, type DrawingTool } from '@/store/useNumeraStore';
import { cn } from '@/lib/cn';

interface ToolbarProps {
  onCheckWork: () => void;
}

const SELECTABLE: DrawingTool[] = ['pen', 'eraser', 'shape', 'ruler'];

// Strictly grayscale to honour the wireframe's black-and-white design language.
const COLORS = ['#1a1a1a', '#7a7a7a', '#b0b0b0'];
const WIDTHS = [2, 4, 7];

function ToolIcon({ id }: { id: string }) {
  const icons: Record<string, JSX.Element> = {
    pen: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19 l1 -4 l9 -9 l3 3 l-9 9 l-4 1 z"/><line x1="13.5" y1="6.5" x2="16.5" y2="9.5"/>
      </svg>
    ),
    eraser: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18 h9"/><path d="M5.5 14.5 l6 -6 l5 5 l-4.5 4.5 h-2.5 z"/>
      </svg>
    ),
    shape: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="5" width="14" height="14" rx="1.5"/>
      </svg>
    ),
    ruler: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="9" width="16" height="6" rx="1"/><line x1="8" y1="9" x2="8" y2="12"/><line x1="12" y1="9" x2="12" y2="12"/><line x1="16" y1="9" x2="16" y2="12"/>
      </svg>
    ),
    undo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 13 l-4 -4 l4 -4"/><path d="M5 9 h9 a5 5 0 0 1 0 10 h-5"/>
      </svg>
    ),
    redo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 13 l4 -4 l-4 -4"/><path d="M19 9 h-9 a5 5 0 0 0 0 10 h5"/>
      </svg>
    ),
    check: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><path d="M8 12 l3 3 l5 -6"/>
      </svg>
    ),
  };
  return icons[id] ?? null;
}

export default function Toolbar({ onCheckWork }: ToolbarProps) {
  const {
    activeTool, strokeColor, strokeWidth, items, undone,
    setActiveTool, setStrokeColor, setStrokeWidth, undo, redo,
    toolbarPos, setToolbarPos, toolbarCollapsed, toggleToolbarCollapsed,
  } = useNumeraStore();

  const [colorOpen, setColorOpen] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ dx: number; dy: number } | null>(null);

  // Close the colour popover on outside click / Escape
  useEffect(() => {
    if (!colorOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setColorOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setColorOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [colorOpen]);

  // ── Drag (Apple-Notes style) — move the whole palette around the canvas ──────
  const onHandleDown = (e: React.PointerEvent) => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    dragOffset.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    el.setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragOffset.current) return;
    const el = rootRef.current;
    const parent = el?.offsetParent as HTMLElement | null;
    if (!el || !parent) return;
    const pr = parent.getBoundingClientRect();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const x = Math.max(8, Math.min(e.clientX - pr.left - dragOffset.current.dx, pr.width - w - 8));
    const y = Math.max(8, Math.min(e.clientY - pr.top - dragOffset.current.dy, pr.height - h - 8));
    setToolbarPos({ x, y });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragOffset.current = null;
    try { rootRef.current?.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  };

  const positioned = toolbarPos != null;
  const canUndo = items.length > 0;
  const canRedo = undone.length > 0;

  const handle = (
    <button
      onPointerDown={onHandleDown}
      title="Drag to move"
      aria-label="Move toolbar"
      className="flex items-center justify-center w-5 h-9 -ml-1 text-[#9a9a9a] hover:text-[#1a1a1a] cursor-grab active:cursor-grabbing touch-none"
    >
      <GripVertical size={16} strokeWidth={1.6} />
    </button>
  );

  return (
    <div
      ref={rootRef}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={cn(
        'absolute z-20 flex items-center gap-[5px] bg-white border border-[#9a9a9a] rounded-[30px] px-[9px] py-[6px] select-none',
        !positioned && 'bottom-5 left-1/2 -translate-x-1/2'
      )}
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
        ...(positioned ? { left: toolbarPos!.x, top: toolbarPos!.y } : {}),
      }}
      role="toolbar"
      aria-label="Drawing tools"
    >
      {handle}

      {toolbarCollapsed ? (
        // ── Collapsed bubble: active tool + expand ──
        <button
          onClick={toggleToolbarCollapsed}
          title="Expand toolbar"
          aria-label="Expand toolbar"
          aria-expanded={false}
          className="w-9 h-9 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center"
        >
          <ToolIcon id={activeTool} />
        </button>
      ) : (
        <>
          {/* Selectable tools */}
          {SELECTABLE.map((tool) => (
            <button
              key={tool}
              title={tool.charAt(0).toUpperCase() + tool.slice(1)}
              aria-label={tool}
              aria-pressed={activeTool === tool}
              onClick={() => setActiveTool(tool)}
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
                activeTool === tool ? 'bg-[#1a1a1a] text-white' : 'bg-transparent text-[#1a1a1a] hover:bg-[#f4f4f4]'
              )}
            >
              <ToolIcon id={tool} />
            </button>
          ))}

          <div className="w-[1.5px] h-[22px] bg-[#c8c8c8] mx-0.5" />

          <button
            onClick={undo} disabled={!canUndo} title="Undo (Cmd/Ctrl+Z)" aria-label="Undo"
            className={cn('w-9 h-9 rounded-full flex items-center justify-center text-[#1a1a1a] transition-colors', canUndo ? 'hover:bg-[#f4f4f4]' : 'opacity-30 cursor-not-allowed')}
          >
            <ToolIcon id="undo" />
          </button>
          <button
            onClick={redo} disabled={!canRedo} title="Redo (Cmd/Ctrl+Shift+Z)" aria-label="Redo"
            className={cn('w-9 h-9 rounded-full flex items-center justify-center text-[#1a1a1a] transition-colors', canRedo ? 'hover:bg-[#f4f4f4]' : 'opacity-30 cursor-not-allowed')}
          >
            <ToolIcon id="redo" />
          </button>

          <div className="w-[1.5px] h-[22px] bg-[#c8c8c8] mx-0.5" />

          {/* Colour + stroke width popover */}
          <div className="relative" ref={colorRef}>
            <button
              onClick={() => setColorOpen((o) => !o)} title="Colour & thickness"
              aria-label="Colour and thickness" aria-expanded={colorOpen}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f4f4f4] transition-colors"
            >
              <span className="w-[18px] h-[18px] rounded-full" style={{ background: strokeColor, border: '2px solid #fff', boxShadow: '0 0 0 1.5px #9a9a9a' }} />
            </button>
            {colorOpen && (
              <div
                className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-white border border-[#9a9a9a] rounded-xl p-3 flex flex-col gap-3"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.14)' }} role="menu"
              >
                <div className="flex items-center gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c} onClick={() => setStrokeColor(c)} aria-label={`Colour ${c}`} aria-pressed={strokeColor === c}
                      className={cn('w-6 h-6 rounded-full transition-transform', strokeColor === c ? 'scale-110 ring-2 ring-offset-2 ring-[#1a1a1a]' : 'hover:scale-105')}
                      style={{ background: c, boxShadow: '0 0 0 1.5px #9a9a9a' }}
                    />
                  ))}
                </div>
                <div className="h-[1px] bg-[#eaeaea]" />
                <div className="flex items-center gap-3 justify-center">
                  {WIDTHS.map((w) => (
                    <button
                      key={w} onClick={() => setStrokeWidth(w)} aria-label={`Thickness ${w}`} aria-pressed={strokeWidth === w}
                      className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-colors', strokeWidth === w ? 'bg-[#1a1a1a]' : 'bg-[#f4f4f4] hover:bg-[#eaeaea]')}
                    >
                      <span className="rounded-full" style={{ width: w + 2, height: w + 2, background: strokeWidth === w ? '#fff' : '#1a1a1a' }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Check My Work */}
          <button
            onClick={onCheckWork} aria-label="Check my work"
            className="ml-1 bg-[#1a1a1a] text-white border-none rounded-[22px] px-4 py-[9px] text-xs font-semibold flex items-center gap-[7px] hover:opacity-80 transition-opacity"
          >
            <ToolIcon id="check" />
            Check
          </button>

          {/* Collapse */}
          <button
            onClick={toggleToolbarCollapsed} title="Collapse toolbar" aria-label="Collapse toolbar"
            className="w-7 h-9 ml-0.5 flex items-center justify-center text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors"
          >
            <ChevronDown size={16} strokeWidth={1.8} />
          </button>
        </>
      )}
    </div>
  );
}

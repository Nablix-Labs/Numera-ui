'use client';

/**
 * Canvas stage — the main student workspace.
 *
 * Layout (matches wireframe):
 *   • Question pinned top-left
 *   • Bar model visual centred (backend-controlled in production)
 *   • react-konva drawing surface fills the canvas area
 *   • Floating pill toolbar at bottom-centre
 *   • Pen FAB bottom-left, Help FAB bottom-right
 */

import { useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useNumeraStore } from '@/store/useNumeraStore';
import BarModel from './BarModel';
import Toolbar from './Toolbar';

// react-konva requires client-only rendering (no SSR)
const DrawingCanvas = dynamic(() => import('./DrawingCanvas'), { ssr: false });

export default function CanvasStage() {
  const { questionText, questionNumber, setActiveTool } = useNumeraStore();

  const exportRef = useRef<(() => string | null) | null>(null);

  const handleExportReady = useCallback((fn: () => string | null) => {
    exportRef.current = fn;
  }, []);

  const handleCheckWork = useCallback(() => {
    const png = exportRef.current?.();
    if (!png) return;
    // In production: sendCanvasSubmission(png) via useWebSocket
    console.log('[Numera] Canvas submitted, PNG length:', png.length);
    // TODO: wire to sendCanvasSubmission from useWebSocket when backend is live
  }, []);

  return (
    <main
      className="flex-1 relative min-w-0 bg-white overflow-hidden"
      aria-label="Canvas workspace"
      style={{
        backgroundImage:
          'linear-gradient(#eaeaea 1px, transparent 1px), linear-gradient(90deg, #eaeaea 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* Question header */}
      <div className="absolute top-[26px] left-[34px] right-[34px] flex items-center gap-3 z-10">
        <div className="w-[30px] h-[30px] rounded-md border border-[#9a9a9a] bg-[#f4f4f4] flex items-center justify-center text-xs font-semibold text-[#7a7a7a] flex-shrink-0">
          {questionNumber}
        </div>
        <div className="text-[22px] font-semibold text-[#1a1a1a]">
          Solve for{' '}
          <span className="italic font-[Cambria_Math,Georgia,serif]">x</span>:{' '}
          <span className="font-[Cambria_Math,Georgia,serif]">{questionText}</span>
        </div>
      </div>

      {/* Bar model visual (sits behind drawing layer) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <BarModel />
      </div>

      {/* Drawing canvas (fills entire stage, above visuals) */}
      <div className="absolute inset-0 z-[1]">
        <DrawingCanvas onExportReady={handleExportReady} />
      </div>

      {/* Corner FABs */}
      <button
        onClick={() => setActiveTool('pen')}
        title="Pen"
        aria-label="Switch to pen"
        className="absolute bottom-[22px] left-6 w-12 h-12 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center z-20"
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.22)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 19 l1 -4 l9 -9 l3 3 l-9 9 l-4 1 z"/><line x1="13.5" y1="6.5" x2="16.5" y2="9.5"/>
        </svg>
      </button>

      <button
        title="Help"
        aria-label="Help"
        className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-[#eaeaea] text-[#7a7a7a] border border-[#c8c8c8] flex items-center justify-center z-20 hover:bg-[#dadada] transition-colors"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/><path d="M9.4 9.3 a2.6 2.6 0 1 1 3.3 2.5 c-0.8 0.3 -0.8 1 -0.8 1.7"/><circle cx="12" cy="16.6" r="0.7" fill="currentColor" stroke="none"/>
        </svg>
      </button>

      {/* Floating toolbar */}
      <div className="z-20 absolute bottom-0 left-0 right-0">
        <Toolbar onCheckWork={handleCheckWork} />
      </div>
    </main>
  );
}

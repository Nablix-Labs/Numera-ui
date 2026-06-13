'use client';

/**
 * DrawingCanvas — react-konva powered drawing surface
 *
 * Tools:
 *   - pen:    freehand drawing
 *   - eraser: freehand erase (destination-out)
 *   - ruler:  straight line (drag from start to end)
 *   - shape:  rectangle (drag to size)
 *
 * Committed items + undo/redo history live in the Zustand store, so the
 * floating toolbar's Undo/Redo buttons and Cmd/Ctrl+Z share one source of
 * truth. exportPNG() is exposed via ref for "Check My Work" submissions.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import type Konva from 'konva';
import { useNumeraStore, type DrawnItem } from '@/store/useNumeraStore';
import TutorLayer from './TutorLayer';

interface DrawingCanvasProps {
  onExportReady?: (exportFn: () => string | null) => void;
}

export default function DrawingCanvas({ onExportReady }: DrawingCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const isDrawing = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const { activeTool, strokeColor, strokeWidth, items, addItem, undo, redo } =
    useNumeraStore();

  // `draftRef` is the source of truth for the in-progress item; `draft` state
  // exists only to trigger re-renders. Committing reads the ref in handleUp,
  // never inside a state updater (which React invokes twice in StrictMode).
  const [draft, setDraft] = useState<DrawnItem | null>(null);
  const draftRef = useRef<DrawnItem | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  const setDraftItem = useCallback((item: DrawnItem | null) => {
    draftRef.current = item;
    setDraft(item);
  }, []);

  // ── Resize observer ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setContainerSize({ width: e.contentRect.width, height: e.contentRect.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Expose exportPNG to parent ───────────────────────────────────────────────
  useEffect(() => {
    onExportReady?.(() => {
      if (!stageRef.current) return null;
      return stageRef.current.toDataURL({ mimeType: 'image/png', pixelRatio: 2 });
    });
  }, [onExportReady]);

  // ── Pointer handlers ─────────────────────────────────────────────────────────
  const handleDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;
      isDrawing.current = true;
      startPos.current = { x: pos.x, y: pos.y };
      const id = crypto.randomUUID();

      if (activeTool === 'pen' || activeTool === 'eraser') {
        setDraftItem({
          id,
          kind: 'stroke',
          tool: activeTool,
          points: [pos.x, pos.y],
          color: activeTool === 'eraser' ? '#ffffff' : strokeColor,
          size: activeTool === 'eraser' ? strokeWidth * 6 : strokeWidth,
        });
      } else if (activeTool === 'ruler') {
        setDraftItem({ id, kind: 'line', points: [pos.x, pos.y, pos.x, pos.y], color: strokeColor, size: strokeWidth });
      } else if (activeTool === 'shape') {
        setDraftItem({ id, kind: 'rect', x: pos.x, y: pos.y, w: 0, h: 0, color: strokeColor, size: strokeWidth });
      }
    },
    [activeTool, strokeColor, strokeWidth, setDraftItem]
  );

  const handleMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!isDrawing.current) return;
      const pos = e.target.getStage()?.getPointerPosition();
      const start = startPos.current;
      const prev = draftRef.current;
      if (!pos || !start || !prev) return;

      if (prev.kind === 'stroke') {
        setDraftItem({ ...prev, points: [...prev.points, pos.x, pos.y] });
      } else if (prev.kind === 'line') {
        setDraftItem({ ...prev, points: [start.x, start.y, pos.x, pos.y] });
      } else {
        setDraftItem({
          ...prev,
          x: Math.min(start.x, pos.x),
          y: Math.min(start.y, pos.y),
          w: Math.abs(pos.x - start.x),
          h: Math.abs(pos.y - start.y),
        });
      }
    },
    [setDraftItem]
  );

  const handleUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    startPos.current = null;
    const item = draftRef.current;
    if (item) {
      // Discard zero-size shapes / single-point taps so undo isn't cluttered
      const meaningful =
        (item.kind === 'stroke' && item.points.length > 2) ||
        (item.kind === 'line' && (item.points[0] !== item.points[2] || item.points[1] !== item.points[3])) ||
        (item.kind === 'rect' && item.w > 2 && item.h > 2);
      if (meaningful) addItem(item);
    }
    setDraftItem(null);
  }, [addItem, setDraftItem]);

  // ── Dev-only hook to exercise the tutor layer before the backend exists ──────
  // Usage in console: numeraTutor.draw({ mode:'replace', elements:[...] })
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    (window as unknown as Record<string, unknown>).numeraTutor = {
      draw: (p: Parameters<ReturnType<typeof useNumeraStore.getState>['applyCanvasDraw']>[0]) =>
        useNumeraStore.getState().applyCanvasDraw(p),
      clear: () => useNumeraStore.getState().clearTutorMarks(),
    };
  }, []);

  // ── Undo / Redo via keyboard (shares store history with toolbar) ─────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const renderItem = (item: DrawnItem) => {
    if (item.kind === 'rect') {
      return (
        <Rect
          key={item.id}
          x={item.x}
          y={item.y}
          width={item.w}
          height={item.h}
          stroke={item.color}
          strokeWidth={item.size}
          cornerRadius={3}
        />
      );
    }
    return (
      <Line
        key={item.id}
        points={item.points}
        stroke={item.color}
        strokeWidth={item.size}
        tension={item.kind === 'stroke' ? 0.5 : 0}
        lineCap="round"
        lineJoin="round"
        globalCompositeOperation={
          item.kind === 'stroke' && item.tool === 'eraser'
            ? 'destination-out'
            : 'source-over'
        }
      />
    );
  };

  const cursor =
    activeTool === 'eraser' ? 'cell' : activeTool === 'pen' ? 'crosshair' : 'copy';

  return (
    <div ref={containerRef} className="w-full h-full" aria-label="Drawing canvas">
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onTouchStart={handleDown}
        onTouchMove={handleMove}
        onTouchEnd={handleUp}
        style={{ cursor }}
      >
        <Layer>
          {items.map(renderItem)}
          {draft && renderItem(draft)}
        </Layer>
        {/* AI-tutor marks — separate, non-erasable layer above the student's */}
        <TutorLayer width={containerSize.width} height={containerSize.height} />
      </Stage>
    </div>
  );
}

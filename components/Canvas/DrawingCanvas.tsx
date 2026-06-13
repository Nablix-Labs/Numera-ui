'use client';

/**
 * DrawingCanvas — react-konva powered drawing surface
 *
 * - Pen tool: freehand drawing
 * - Eraser tool: local erasing (line removal on click)
 * - Undo / Redo via history stack in Zustand store
 * - exportPNG() exposed via ref for "Check My Work" submissions
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import type Konva from 'konva';
import { useNumeraStore } from '@/store/useNumeraStore';

interface DrawnLine {
  id: string;
  tool: 'pen' | 'eraser';
  points: number[];
  color: string;
  width: number;
}

interface DrawingCanvasProps {
  onExportReady?: (exportFn: () => string | null) => void;
}

export default function DrawingCanvas({ onExportReady }: DrawingCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const isDrawing = useRef(false);

  const { activeTool, strokeColor, strokeWidth } = useNumeraStore();

  const [lines, setLines] = useState<DrawnLine[]>([]);
  const [history, setHistory] = useState<DrawnLine[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  // ── Drawing handlers ─────────────────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (activeTool !== 'pen' && activeTool !== 'eraser') return;
      isDrawing.current = true;
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;

      const newLine: DrawnLine = {
        id: crypto.randomUUID(),
        tool: activeTool,
        points: [pos.x, pos.y],
        color: activeTool === 'eraser' ? '#ffffff' : strokeColor,
        width: activeTool === 'eraser' ? strokeWidth * 5 : strokeWidth,
      };

      setLines((prev) => [...prev, newLine]);
    },
    [activeTool, strokeColor, strokeWidth]
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!isDrawing.current) return;
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;

      setLines((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (!last) return prev;
        updated[updated.length - 1] = {
          ...last,
          points: [...last.points, pos.x, pos.y],
        };
        return updated;
      });
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    setLines((current) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...current]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return current;
    });
  }, [history, historyIndex]);

  // ── Undo / Redo via keyboard ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        setHistoryIndex((hi) => {
          const next = Math.max(0, hi - 1);
          setLines(history[next] ?? []);
          return next;
        });
      }
      if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        setHistoryIndex((hi) => {
          const next = Math.min(history.length - 1, hi + 1);
          setLines(history[next] ?? []);
          return next;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [history]);

  return (
    <div ref={containerRef} className="w-full h-full" aria-label="Drawing canvas">
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        style={{ cursor: activeTool === 'eraser' ? 'cell' : 'crosshair' }}
      >
        <Layer>
          {lines.map((line) => (
            <Line
              key={line.id}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.width}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

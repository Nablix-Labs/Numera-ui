'use client';

/**
 * Numera — Lesson (the live tutoring session).
 *
 * The tool rail + media panel live in the root layout (persistent across
 * routes). This page contributes the lesson-specific surfaces: the slide
 * navigation strip and the drawing canvas.
 */

import SlideDots from '@/components/SlideDots';
import CanvasStage from '@/components/Canvas';
import ContinuityCheck from '@/components/ContinuityCheck';
import { useFlowNav } from '@/lib/useFlowNav';

export default function LessonPage() {
  const { goStage, currentTopicId } = useFlowNav();
  return (
    <>
      <SlideDots />
      <CanvasStage />
      <ContinuityCheck />
      {/* Guided lesson → independent practice for this topic */}
      <button
        onClick={() => goStage('practice', currentTopicId)}
        className="fixed top-4 right-4 z-40 rounded-md bg-[#1a1a1a] text-white px-4 py-2 text-[12px] font-semibold hover:opacity-80 transition-opacity"
      >
        Finish lesson → Practice
      </button>
    </>
  );
}

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

export default function LessonPage() {
  return (
    <>
      <SlideDots />
      <CanvasStage />
    </>
  );
}

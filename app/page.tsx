'use client';

/**
 * Numera — main session page
 *
 * 4-column layout (matches Numera Wireframe.html):
 *   [Tool Rail 56px] [Media Panel 234px] [Slide Dots 38px] [Canvas flex-1]
 */

import ToolRail from '@/components/ToolRail';
import MediaPanel from '@/components/MediaPanel';
import SlideDots from '@/components/SlideDots';
import CanvasStage from '@/components/Canvas';

export default function NumeraPage() {
  return (
    <div
      className="h-screen flex bg-white max-w-[1500px] mx-auto border-x border-[#c8c8c8]"
      aria-label="Numera AI Math Tutor"
    >
      {/* Far-left dark tool rail */}
      <ToolRail />

      {/* Media column: tutor + student tiles, voice, transcript */}
      <MediaPanel />

      {/* Slide dot navigation strip */}
      <SlideDots />

      {/* Main canvas workspace */}
      <CanvasStage />
    </div>
  );
}

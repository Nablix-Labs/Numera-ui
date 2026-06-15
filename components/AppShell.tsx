'use client';

/**
 * AppShell — arranges the assistant (media) panel and the routed page content
 * either side of each other based on the `panelSide` preference. The tool rail
 * stays pinned far-left in the root layout; this only swaps panel ↔ canvas.
 */

import { useEffect, type ReactNode } from 'react';
import MediaPanel from './MediaPanel';
import { useNumeraStore } from '@/store/useNumeraStore';

export default function AppShell({ children }: { children: ReactNode }) {
  const panelSide = useNumeraStore((s) => s.panelSide);

  // Load persisted UI prefs + progress once, on the client only.
  useEffect(() => {
    void useNumeraStore.persist.rehydrate();
  }, []);

  return (
    <div className="flex-1 flex min-w-0">
      {panelSide === 'left' ? (
        <>
          <MediaPanel />
          {children}
        </>
      ) : (
        <>
          {children}
          <MediaPanel />
        </>
      )}
    </div>
  );
}

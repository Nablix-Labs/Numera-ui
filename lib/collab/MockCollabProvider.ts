/**
 * MockCollabProvider — a local stand-in for a real realtime backend.
 *
 * It simulates two peers joining the room, drifts their cursors around the
 * canvas, and has one peer draw a stroke shortly after joining so the shared
 * canvas is visibly "live". sendCursor/sendItem are no-ops here (a real
 * provider would broadcast them). Swap this class for a Liveblocks/Yjs
 * implementation of CollabProvider with no UI changes.
 */
import type { CollabHandlers, CollabProvider } from './types';
import { PEER_COLORS } from './types';

const PEERS = [
  { id: 'peer-aisha', name: 'Aïsha', color: PEER_COLORS[0] },
  { id: 'peer-liam', name: 'Liam', color: PEER_COLORS[1] },
];

export class MockCollabProvider implements CollabProvider {
  private timers: ReturnType<typeof setInterval>[] = [];
  private timeouts: ReturnType<typeof setTimeout>[] = [];
  private handlers: CollabHandlers | null = null;

  connect(_roomId: string, handlers: CollabHandlers): void {
    this.handlers = handlers;

    PEERS.forEach((peer, i) => {
      // Stagger joins so it feels live
      this.timeouts.push(
        setTimeout(() => {
          const cursor = { x: 0.35 + i * 0.2, y: 0.4 };
          handlers.onParticipantJoin({ ...peer, cursor });

          // Drift the cursor with a gentle random walk
          let { x, y } = cursor;
          this.timers.push(
            setInterval(() => {
              x = clamp(x + (Math.random() - 0.5) * 0.06);
              y = clamp(y + (Math.random() - 0.5) * 0.06);
              handlers.onCursor(peer.id, { x, y });
            }, 700 + i * 130)
          );
        }, 600 + i * 900)
      );
    });

    // One peer contributes a stroke so shared drawing is visibly live.
    // (Pixel coords like local strokes; placed in a region that's on-canvas.)
    this.timeouts.push(
      setTimeout(() => {
        handlers.onRemoteItem({
          id: 'remote-' + Math.random().toString(36).slice(2),
          kind: 'stroke',
          tool: 'pen',
          points: [380, 540, 420, 520, 470, 545, 520, 520, 560, 540],
          color: PEERS[0].color,
          size: 3,
        });
      }, 3200)
    );
  }

  disconnect(): void {
    this.timers.forEach(clearInterval);
    this.timeouts.forEach(clearTimeout);
    this.timers = [];
    this.timeouts = [];
    if (this.handlers) {
      PEERS.forEach((p) => this.handlers!.onParticipantLeave(p.id));
    }
    this.handlers = null;
  }

  // No-ops for the mock; a real provider broadcasts these to peers.
  sendCursor(_cursor: { x: number; y: number }): void { /* noop */ }
  sendItem(_item: import('@/store/useNumeraStore').DrawnItem): void { /* noop */ }
}

function clamp(v: number): number {
  return Math.max(0.04, Math.min(0.96, v));
}

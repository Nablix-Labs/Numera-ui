/**
 * Collaboration abstraction. The UI talks only to this interface, so the
 * mock provider used now can be swapped for a real one (Liveblocks / Yjs /
 * Supabase Realtime) later with zero changes to components.
 */
import type { DrawnItem, Participant } from '@/store/useNumeraStore';

export interface CollabHandlers {
  onParticipantJoin: (p: Participant) => void;
  onParticipantLeave: (id: string) => void;
  onCursor: (id: string, cursor: { x: number; y: number }) => void;
  onRemoteItem: (item: DrawnItem) => void;
}

export interface CollabProvider {
  /** Join a room and start receiving presence + ops. */
  connect(roomId: string, handlers: CollabHandlers): void;
  /** Leave the room and tear down. */
  disconnect(): void;
  /** Broadcast the local user's cursor (normalised 0–1). */
  sendCursor(cursor: { x: number; y: number }): void;
  /** Broadcast a locally drawn item. */
  sendItem(item: DrawnItem): void;
}

/** Distinct, identity colours for participant cursors (functional, not decorative). */
export const PEER_COLORS = ['#2563eb', '#d97706', '#0d9488', '#7c3aed'];

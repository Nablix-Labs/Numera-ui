'use client';

/**
 * useCollab — connects a CollabProvider to the store while a group session is
 * active. Today it uses MockCollabProvider; swapping to a real backend is a
 * one-line change here.
 */
import { useEffect } from 'react';
import { useNumeraStore } from '@/store/useNumeraStore';
import { MockCollabProvider } from '@/lib/collab/MockCollabProvider';

export function useCollab() {
  const sessionMode = useNumeraStore((s) => s.sessionMode);

  useEffect(() => {
    if (sessionMode !== 'group') return;

    const {
      upsertParticipant, removeParticipant, setParticipantCursor, addRemoteItem,
    } = useNumeraStore.getState();

    const provider = new MockCollabProvider();
    provider.connect('numera-room', {
      onParticipantJoin: upsertParticipant,
      onParticipantLeave: removeParticipant,
      onCursor: setParticipantCursor,
      onRemoteItem: addRemoteItem,
    });

    return () => provider.disconnect();
  }, [sessionMode]);
}

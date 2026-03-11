import { create } from 'zustand';
import type { HaState } from '../api/client';

/** WebSocket connection status */
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface EntityStore {
  /** All entity states keyed by entity_id */
  entities: Record<string, HaState>;
  /** WebSocket connection status */
  connectionStatus: ConnectionStatus;
  /** Whether initial state dump has been received */
  initialized: boolean;
  /** Error message if any */
  error: string | null;
  /** HA backend connection status (backend → HA WebSocket) */
  haConnected: boolean;

  // Internal actions
  _setEntities: (states: HaState[]) => void;
  _updateEntity: (entityId: string, state: HaState) => void;
  _setConnectionStatus: (status: ConnectionStatus) => void;
  _setHaConnected: (connected: boolean) => void;
  _setError: (error: string | null) => void;
}

export const useEntityStore = create<EntityStore>((set) => ({
  entities: {},
  connectionStatus: 'disconnected',
  initialized: false,
  error: null,
  haConnected: false,

  _setEntities: (states) =>
    set(() => {
      const entities: Record<string, HaState> = {};
      for (const state of states) {
        entities[state.entity_id] = state;
      }
      return { entities, initialized: true };
    }),

  _updateEntity: (entityId, state) =>
    set((prev) => ({
      entities: { ...prev.entities, [entityId]: state },
    })),

  _setConnectionStatus: (status) => set({ connectionStatus: status }),
  _setHaConnected: (connected) => set({ haConnected: connected }),
  _setError: (error) => set({ error }),
}));

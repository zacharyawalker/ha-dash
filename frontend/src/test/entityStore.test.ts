import { describe, it, expect, beforeEach } from 'vitest';
import { useEntityStore } from '../store/entityStore';

const mockEntity = {
  entity_id: 'light.test',
  state: 'on',
  attributes: { friendly_name: 'Test Light' },
  last_changed: '2026-01-01T00:00:00Z',
  last_updated: '2026-01-01T00:00:00Z',
};

describe('entityStore', () => {
  beforeEach(() => {
    useEntityStore.setState({
      entities: {},
      connectionStatus: 'disconnected',
      haConnected: false,
      initialized: false,
      error: null,
    });
  });

  it('starts with no entities', () => {
    expect(Object.keys(useEntityStore.getState().entities)).toHaveLength(0);
    expect(useEntityStore.getState().initialized).toBe(false);
  });

  it('sets entities via bulk update', () => {
    useEntityStore.getState()._setEntities([mockEntity]);

    const { entities, initialized } = useEntityStore.getState();
    expect(entities['light.test']).toBeDefined();
    expect(entities['light.test'].state).toBe('on');
    expect(initialized).toBe(true);
  });

  it('updates a single entity', () => {
    useEntityStore.getState()._setEntities([mockEntity]);
    useEntityStore.getState()._updateEntity('light.test', { ...mockEntity, state: 'off' });

    expect(useEntityStore.getState().entities['light.test'].state).toBe('off');
  });

  it('creates new reference on entity update (immutability)', () => {
    useEntityStore.getState()._setEntities([mockEntity]);
    const before = useEntityStore.getState().entities;

    useEntityStore.getState()._updateEntity('light.test', { ...mockEntity, state: 'off' });
    const after = useEntityStore.getState().entities;

    expect(after).not.toBe(before);
  });

  it('tracks connection status', () => {
    useEntityStore.getState()._setConnectionStatus('connected');
    expect(useEntityStore.getState().connectionStatus).toBe('connected');

    useEntityStore.getState()._setConnectionStatus('disconnected');
    expect(useEntityStore.getState().connectionStatus).toBe('disconnected');
  });

  it('tracks HA connection status', () => {
    useEntityStore.getState()._setHaConnected(true);
    expect(useEntityStore.getState().haConnected).toBe(true);
  });

  it('handles errors', () => {
    useEntityStore.getState()._setError('WebSocket failed');
    expect(useEntityStore.getState().error).toBe('WebSocket failed');

    useEntityStore.getState()._setError(null);
    expect(useEntityStore.getState().error).toBeNull();
  });
});

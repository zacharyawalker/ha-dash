import { useMemo } from 'react';
import { useEntityStore } from '../store/entityStore';
import type { HaState } from '../api/client';

/**
 * Get all entities, optionally filtered by domain(s).
 * Reads from the shared WebSocket-backed entity store.
 */
export function useHaEntities(domain?: string | string[]) {
  const entities = useEntityStore((s) => s.entities);
  const initialized = useEntityStore((s) => s.initialized);

  const filtered = useMemo(() => {
    const all = Object.values(entities);
    if (!domain) return all;
    if (Array.isArray(domain)) {
      return all.filter((e) => domain.some((d) => e.entity_id.startsWith(`${d}.`)));
    }
    return all.filter((e) => e.entity_id.startsWith(`${domain}.`));
  }, [entities, domain]);

  return {
    entities: filtered,
    loading: !initialized,
    error: null,
  };
}

/**
 * Get a single entity by ID.
 */
export function useHaEntity(entityId: string | undefined): {
  entity: HaState | undefined;
  loading: boolean;
} {
  const entity = useEntityStore((s) =>
    entityId ? s.entities[entityId] : undefined
  );
  const initialized = useEntityStore((s) => s.initialized);

  return {
    entity,
    loading: !initialized,
  };
}

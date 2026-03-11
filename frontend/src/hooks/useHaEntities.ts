import { useState, useEffect, useCallback } from 'react';
import { getStates, type HaState } from '../api/client';

export function useHaEntities(domain?: string, pollInterval = 5000) {
  const [entities, setEntities] = useState<HaState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntities = useCallback(async () => {
    try {
      const states = await getStates();
      const filtered = domain
        ? states.filter((s) => s.entity_id.startsWith(`${domain}.`))
        : states;
      setEntities(filtered);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    fetchEntities();
    const interval = setInterval(fetchEntities, pollInterval);
    return () => clearInterval(interval);
  }, [fetchEntities, pollInterval]);

  return { entities, loading, error, refetch: fetchEntities };
}

export function useHaEntity(entityId: string | undefined, pollInterval = 5000) {
  const { entities, loading, error, refetch } = useHaEntities(undefined, pollInterval);
  const entity = entityId ? entities.find((e) => e.entity_id === entityId) : undefined;
  return { entity, loading, error, refetch };
}

/** Derive API base from current page location (works with HA ingress and standalone) */
const BASE = (() => {
  const path = window.location.pathname.replace(/\/+$/, '');
  return `${path}/api`;
})();

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${BASE}${url}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`API error ${resp.status}: ${err}`);
  }
  return resp.json();
}

// HA API proxy
export async function getStates() {
  return fetchJson<HaState[]>('/ha/states');
}

export async function getState(entityId: string) {
  return fetchJson<HaState>(`/ha/states/${entityId}`);
}

export async function callService(domain: string, service: string, data: Record<string, unknown>, returnResponse = false) {
  const result = await fetchJson<unknown>(`/ha/services/${domain}/${service}${returnResponse ? '?return_response=true' : ''}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  // After a service call, poll for updated state since WebSocket may not deliver through ingress
  const entityId = data.entity_id as string | undefined;
  if (entityId) {
    setTimeout(async () => {
      try {
        const { useEntityStore } = await import('../store/entityStore');
        const updated = await fetchJson<HaState>(`/ha/states/${entityId}`);
        useEntityStore.getState()._updateEntity(entityId, updated);
      } catch {
        // Silent fallback — WebSocket may deliver it instead
      }
    }, 500);
  }

  return result;
}

// Dashboard API
export async function loadDashboard(id: string) {
  return fetchJson<import('../types/dashboard').Dashboard>(`/dashboards/${id}`);
}

export async function saveDashboard(id: string, data: import('../types/dashboard').Dashboard) {
  return fetchJson<import('../types/dashboard').Dashboard>(`/dashboards/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listDashboards() {
  return fetchJson<{ id: string; name: string }[]>('/dashboards/');
}

export async function deleteDashboard(id: string) {
  return fetchJson<{ status: string }>(`/dashboards/${id}`, { method: 'DELETE' });
}

export async function createDashboard(id: string, name: string) {
  return saveDashboard(id, {
    id,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    widgets: [],
  } as import('../types/dashboard').Dashboard);
}

export async function getHistory(entityId: string, hours = 24) {
  return fetchJson<{ state: string; last_changed: string }[]>(
    `/ha/history/${entityId}?hours=${hours}`
  );
}

// HA state type
export interface HaState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

const BASE = './api';

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

export async function callService(domain: string, service: string, data: Record<string, unknown>) {
  return fetchJson<unknown>(`/ha/services/${domain}/${service}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
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

// HA state type
export interface HaState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

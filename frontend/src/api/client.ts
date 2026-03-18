/** 
 * Derive API base URL.
 * In HA ingress: the page loads from /api/hassio_ingress/TOKEN/ or similar.
 * Standalone: loads from / or /some-path/.
 * We find the base by looking at where our own script loaded from.
 */
const BASE = (() => {
  // Try to find our script's origin path
  const scripts = document.querySelectorAll('script[src*="index-"]');
  for (const s of scripts) {
    const src = (s as HTMLScriptElement).src;
    // src = https://host/api/hassio_ingress/TOKEN/assets/index-XXX.js
    const assetsIdx = src.indexOf('/assets/');
    if (assetsIdx > 0) {
      const basePath = new URL(src).pathname.substring(0, assetsIdx);
      return `${basePath}/api`;
    }
  }
  // Fallback: use current page path
  const path = window.location.pathname.replace(/\/+$/, '');
  return `${path}/api`;
})();

// Import entity store at module level to avoid dynamic import issues
let _entityStoreModule: typeof import('../store/entityStore') | null = null;
import('../store/entityStore').then(m => { _entityStoreModule = m; });

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

/** Toggle service names that flip on/off state */
const TOGGLE_SERVICES = new Set(['toggle', 'turn_on', 'turn_off']);

export async function callService(domain: string, service: string, data: Record<string, unknown>, returnResponse = false) {
  const entityId = data.entity_id as string | undefined;

  // Optimistic update: flip state instantly in the UI
  if (entityId && _entityStoreModule && TOGGLE_SERVICES.has(service)) {
    const store = _entityStoreModule.useEntityStore;
    const current = store.getState().entities[entityId];
    if (current) {
      let optimisticState: string;
      if (service === 'turn_on') optimisticState = 'on';
      else if (service === 'turn_off') optimisticState = 'off';
      else optimisticState = current.state === 'on' ? 'off' : 'on'; // toggle

      store.getState()._updateEntity(entityId, {
        ...current,
        state: optimisticState,
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      });
    }
  }

  const result = await fetchJson<unknown>(`/ha/services/${domain}/${service}${returnResponse ? '?return_response=true' : ''}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  // Confirm with real state after a short delay
  if (entityId && _entityStoreModule) {
    const store = _entityStoreModule.useEntityStore;
    setTimeout(async () => {
      try {
        const updated = await fetchJson<HaState>(`/ha/states/${entityId}`);
        store.getState()._updateEntity(entityId, updated);
      } catch (e) {
        console.warn('[callService] State confirm failed:', e);
      }
    }, 1000);
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

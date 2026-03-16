import { create } from 'zustand';

export interface LicenseLimits {
  max_dashboards: number;
  max_pages_per_dashboard: number;
  max_widgets_per_page: number;
  templates_enabled: boolean;
  quick_search: boolean;
  auto_arrange: boolean;
  custom_themes: boolean;
  import_export: boolean;
  widget_palette: boolean;
}

interface LicenseState {
  tier: 'free' | 'pro';
  valid: boolean;
  email: string;
  error: string;
  loading: boolean;
  limits: LicenseLimits;
  freeWidgets: string[];

  // Actions
  fetchStatus: () => Promise<void>;
  activate: (key: string) => Promise<{ success: boolean; error?: string }>;
  deactivate: () => Promise<void>;
  isPro: () => boolean;
  isWidgetAllowed: (type: string) => boolean;
  isFeatureAllowed: (feature: keyof LicenseLimits) => boolean;
}

const FREE_LIMITS: LicenseLimits = {
  max_dashboards: 1,
  max_pages_per_dashboard: 3,
  max_widgets_per_page: 20,
  templates_enabled: false,
  quick_search: false,
  auto_arrange: false,
  custom_themes: false,
  import_export: false,
  widget_palette: false,
};

/** Derive API base from current page location */
const API_BASE = (() => {
  const path = window.location.pathname.replace(/\/+$/, '');
  return `${path}/api`;
})();

export const useLicenseStore = create<LicenseState>((set, get) => ({
  tier: 'free',
  valid: false,
  email: '',
  error: '',
  loading: false,
  limits: FREE_LIMITS,
  freeWidgets: [],

  fetchStatus: async () => {
    set({ loading: true });
    try {
      const resp = await fetch(`${API_BASE}/license/status`);
      const data = await resp.json();
      set({
        tier: data.tier || 'free',
        valid: data.valid || false,
        email: data.email || '',
        error: data.error || '',
        limits: data.limits || FREE_LIMITS,
        freeWidgets: data.free_widgets || [],
        loading: false,
      });
    } catch (e) {
      console.error('[LicenseStore] Failed to fetch status:', e);
      set({ loading: false });
    }
  },

  activate: async (key: string) => {
    set({ loading: true });
    try {
      const resp = await fetch(`${API_BASE}/license/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: key }),
      });
      const data = await resp.json();
      set({
        tier: data.tier || 'free',
        valid: data.valid || false,
        email: data.email || '',
        error: data.error || '',
        loading: false,
      });
      // Re-fetch full status for limits
      await get().fetchStatus();
      return { success: data.valid, error: data.error };
    } catch (e) {
      set({ loading: false });
      return { success: false, error: 'Failed to connect to licensing server' };
    }
  },

  deactivate: async () => {
    set({ loading: true });
    try {
      await fetch(`${API_BASE}/license/deactivate`, { method: 'POST' });
    } catch {}
    set({
      tier: 'free',
      valid: false,
      email: '',
      error: '',
      limits: FREE_LIMITS,
      loading: false,
    });
  },

  isPro: () => get().tier === 'pro',

  isWidgetAllowed: (type: string) => {
    const { tier, freeWidgets } = get();
    if (tier === 'pro') return true;
    if (freeWidgets.length === 0) return true; // No restrictions loaded yet
    return freeWidgets.includes(type);
  },

  isFeatureAllowed: (feature: keyof LicenseLimits) => {
    const value = get().limits[feature];
    if (typeof value === 'boolean') return value;
    return true;
  },
}));

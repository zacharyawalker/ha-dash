import { create } from 'zustand';
import type { Dashboard, Widget } from '../types/dashboard';
import { loadDashboard, saveDashboard } from '../api/client';

interface DashboardStore {
  dashboard: Dashboard | null;
  mode: 'edit' | 'view';
  selectedWidgetId: string | null;
  loading: boolean;
  error: string | null;

  setMode: (mode: 'edit' | 'view') => void;
  selectWidget: (id: string | null) => void;
  load: (id?: string) => Promise<void>;
  save: () => Promise<void>;
  addWidget: (widget: Widget) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  dashboard: null,
  mode: 'view',
  selectedWidgetId: null,
  loading: false,
  error: null,

  setMode: (mode) => set({ mode, selectedWidgetId: null }),

  selectWidget: (id) => set({ selectedWidgetId: id }),

  load: async (id = 'default') => {
    set({ loading: true, error: null });
    try {
      const dashboard = await loadDashboard(id);
      set({ dashboard, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  save: async () => {
    const { dashboard } = get();
    if (!dashboard) return;
    try {
      await saveDashboard(dashboard.id, dashboard);
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  addWidget: (widget) => {
    const { dashboard } = get();
    if (!dashboard) return;
    set({
      dashboard: {
        ...dashboard,
        widgets: [...dashboard.widgets, widget],
      },
    });
  },

  updateWidget: (id, updates) => {
    const { dashboard } = get();
    if (!dashboard) return;
    set({
      dashboard: {
        ...dashboard,
        widgets: dashboard.widgets.map((w) =>
          w.id === id ? { ...w, ...updates } : w
        ),
      },
    });
  },

  removeWidget: (id) => {
    const { dashboard } = get();
    if (!dashboard) return;
    set({
      dashboard: {
        ...dashboard,
        widgets: dashboard.widgets.filter((w) => w.id !== id),
      },
      selectedWidgetId: null,
    });
  },
}));

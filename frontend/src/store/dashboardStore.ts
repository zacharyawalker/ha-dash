import { create } from 'zustand';
import type { Dashboard, DashboardPage, Widget } from '../types/dashboard';
import { loadDashboard, saveDashboard } from '../api/client';
import { generateId } from '../utils/id';

interface HistoryEntry {
  pages: DashboardPage[];
  activePage: number;
  label: string;
}

interface DashboardStore {
  dashboard: Dashboard | null;
  mode: 'edit' | 'view';
  selectedWidgetId: string | null;
  selectedWidgetIds: Set<string>;
  loading: boolean;
  error: string | null;
  activePage: number;
  theme: 'dark' | 'light';

  // Grid
  gridEnabled: boolean;
  gridSize: number;

  // History
  history: HistoryEntry[];
  historyIndex: number;
  clipboard: Widget | null;

  // Helpers
  getPages: () => DashboardPage[];
  getActivePageWidgets: () => Widget[];

  // Actions
  setMode: (mode: 'edit' | 'view') => void;
  selectWidget: (id: string | null, addToSelection?: boolean) => void;
  load: (id?: string) => Promise<void>;
  save: () => Promise<void>;
  addWidget: (widget: Widget) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;

  // Pages
  setActivePage: (index: number) => void;
  addPage: (name?: string) => void;
  removePage: (index: number) => void;
  renamePage: (index: number, name: string) => void;

  // Grid
  setGridEnabled: (enabled: boolean) => void;
  setGridSize: (size: number) => void;
  snapToGrid: (value: number) => number;

  // Undo/redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Copy/paste
  copyWidget: () => void;
  pasteWidget: () => void;
  deleteSelected: () => void;

  // Theme
  setTheme: (theme: 'dark' | 'light') => void;
}

const MAX_HISTORY = 50;

/** Migrate legacy flat widgets to pages */
function ensurePages(dashboard: Dashboard): DashboardPage[] {
  if (dashboard.pages && dashboard.pages.length > 0) return dashboard.pages;
  return [{ id: generateId(), name: 'Main', widgets: dashboard.widgets || [] }];
}

function pushHistory(
  history: HistoryEntry[],
  historyIndex: number,
  pages: DashboardPage[],
  activePage: number,
  label: string,
): { history: HistoryEntry[]; historyIndex: number } {
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push({ pages: pages.map((p) => ({ ...p, widgets: [...p.widgets] })), activePage, label });
  if (newHistory.length > MAX_HISTORY) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  dashboard: null,
  mode: 'view',
  selectedWidgetId: null,
  selectedWidgetIds: new Set(),
  loading: false,
  error: null,
  activePage: 0,
  theme: 'dark',
  gridEnabled: true,
  gridSize: 20,
  history: [],
  historyIndex: -1,
  clipboard: null,

  getPages: () => {
    const { dashboard } = get();
    return dashboard ? ensurePages(dashboard) : [];
  },

  getActivePageWidgets: () => {
    const pages = get().getPages();
    const { activePage } = get();
    return pages[activePage]?.widgets || [];
  },

  setMode: (mode) => set({ mode, selectedWidgetId: null, selectedWidgetIds: new Set() }),

  selectWidget: (id, addToSelection = false) => {
    if (!addToSelection) {
      set({ selectedWidgetId: id, selectedWidgetIds: new Set(id ? [id] : []) });
    } else if (id) {
      const { selectedWidgetIds, selectedWidgetId } = get();
      const newSet = new Set(selectedWidgetIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      set({ selectedWidgetId: selectedWidgetId || id, selectedWidgetIds: newSet });
    }
  },

  load: async (id = 'default') => {
    set({ loading: true, error: null });

    // Try localStorage cache first for instant render
    const cacheKey = `ha-dash-${id}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const dashboard = JSON.parse(cached);
        const pages = ensurePages(dashboard);
        const ap = dashboard.activePage || 0;
        const theme = dashboard.theme || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        set({
          dashboard: { ...dashboard, pages },
          loading: false,
          activePage: ap,
          theme,
          history: [{ pages: pages.map((p) => ({ ...p, widgets: [...p.widgets] })), activePage: ap, label: 'Load (cached)' }],
          historyIndex: 0,
        });
      }
    } catch { /* ignore cache errors */ }

    try {
      const dashboard = await loadDashboard(id);
      const pages = ensurePages(dashboard);
      const ap = dashboard.activePage || 0;
      const theme = dashboard.theme || 'dark';
      document.documentElement.setAttribute('data-theme', theme);

      // Update localStorage cache
      try { localStorage.setItem(cacheKey, JSON.stringify(dashboard)); } catch { /* quota */ }

      set({
        dashboard: { ...dashboard, pages },
        loading: false,
        activePage: ap,
        theme,
        history: [{ pages: pages.map((p) => ({ ...p, widgets: [...p.widgets] })), activePage: ap, label: 'Load' }],
        historyIndex: 0,
      });
    } catch (e) {
      // If we already loaded from cache, don't show error
      if (!get().dashboard) {
        set({ error: (e as Error).message, loading: false });
      } else {
        set({ loading: false });
      }
    }
  },

  save: async () => {
    const { dashboard, activePage, theme } = get();
    if (!dashboard) return;
    const pages = ensurePages(dashboard);
    // Keep widgets as flat for backward compat
    const toSave = {
      ...dashboard,
      pages,
      widgets: pages[activePage]?.widgets || [],
      activePage,
      theme,
    };
    try {
      await saveDashboard(toSave.id, toSave);
      // Update localStorage cache
      try { localStorage.setItem(`ha-dash-${toSave.id}`, JSON.stringify(toSave)); } catch { /* quota */ }
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  addWidget: (widget) => {
    const { dashboard, activePage, history, historyIndex } = get();
    if (!dashboard) return;
    const pages = ensurePages(dashboard);
    const newPages = pages.map((p, i) =>
      i === activePage ? { ...p, widgets: [...p.widgets, widget] } : p,
    );
    const h = pushHistory(history, historyIndex, newPages, activePage, `Add ${widget.type}`);
    set({ dashboard: { ...dashboard, pages: newPages, widgets: newPages[activePage].widgets }, ...h });
  },

  updateWidget: (id, updates) => {
    const { dashboard, activePage, history, historyIndex } = get();
    if (!dashboard) return;
    const pages = ensurePages(dashboard);
    const newPages = pages.map((p, i) =>
      i === activePage
        ? { ...p, widgets: p.widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)) }
        : p,
    );
    const isSignificant = updates.config || updates.type;
    const h = isSignificant
      ? pushHistory(history, historyIndex, newPages, activePage, 'Update widget')
      : { history, historyIndex };
    set({ dashboard: { ...dashboard, pages: newPages, widgets: newPages[activePage].widgets }, ...h });
  },

  removeWidget: (id) => {
    const { dashboard, activePage, history, historyIndex } = get();
    if (!dashboard) return;
    const pages = ensurePages(dashboard);
    const newPages = pages.map((p, i) =>
      i === activePage ? { ...p, widgets: p.widgets.filter((w) => w.id !== id) } : p,
    );
    const h = pushHistory(history, historyIndex, newPages, activePage, 'Delete widget');
    set({
      dashboard: { ...dashboard, pages: newPages, widgets: newPages[activePage].widgets },
      selectedWidgetId: null,
      selectedWidgetIds: new Set(),
      ...h,
    });
  },

  // Pages
  setActivePage: (index) => {
    set({ activePage: index, selectedWidgetId: null, selectedWidgetIds: new Set() });
    // Update widgets shortcut for Canvas
    const pages = get().getPages();
    const { dashboard } = get();
    if (dashboard && pages[index]) {
      set({ dashboard: { ...dashboard, widgets: pages[index].widgets } });
    }
  },

  addPage: (name) => {
    const { dashboard, history, historyIndex } = get();
    if (!dashboard) return;
    const pages = ensurePages(dashboard);
    const newPage: DashboardPage = { id: generateId(), name: name || `Page ${pages.length + 1}`, widgets: [] };
    const newPages = [...pages, newPage];
    const newIndex = newPages.length - 1;
    const h = pushHistory(history, historyIndex, newPages, newIndex, 'Add page');
    set({
      dashboard: { ...dashboard, pages: newPages, widgets: [] },
      activePage: newIndex,
      selectedWidgetId: null,
      selectedWidgetIds: new Set(),
      ...h,
    });
  },

  removePage: (index) => {
    const { dashboard, activePage, history, historyIndex } = get();
    if (!dashboard) return;
    const pages = ensurePages(dashboard);
    if (pages.length <= 1) return; // Can't delete last page
    const newPages = pages.filter((_, i) => i !== index);
    const newActive = Math.min(activePage, newPages.length - 1);
    const h = pushHistory(history, historyIndex, newPages, newActive, 'Delete page');
    set({
      dashboard: { ...dashboard, pages: newPages, widgets: newPages[newActive].widgets },
      activePage: newActive,
      selectedWidgetId: null,
      selectedWidgetIds: new Set(),
      ...h,
    });
  },

  renamePage: (index, name) => {
    const { dashboard } = get();
    if (!dashboard) return;
    const pages = ensurePages(dashboard);
    const newPages = pages.map((p, i) => (i === index ? { ...p, name } : p));
    set({ dashboard: { ...dashboard, pages: newPages } });
  },

  // Grid
  setGridEnabled: (enabled) => set({ gridEnabled: enabled }),
  setGridSize: (size) => set({ gridSize: size }),
  snapToGrid: (value) => {
    const { gridEnabled, gridSize } = get();
    return gridEnabled ? Math.round(value / gridSize) * gridSize : value;
  },

  // Undo/redo
  undo: () => {
    const { dashboard, history, historyIndex } = get();
    if (!dashboard || historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    set({
      dashboard: { ...dashboard, pages: prev.pages, widgets: prev.pages[prev.activePage]?.widgets || [] },
      activePage: prev.activePage,
      historyIndex: historyIndex - 1,
      selectedWidgetId: null,
      selectedWidgetIds: new Set(),
    });
  },

  redo: () => {
    const { dashboard, history, historyIndex } = get();
    if (!dashboard || historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    set({
      dashboard: { ...dashboard, pages: next.pages, widgets: next.pages[next.activePage]?.widgets || [] },
      activePage: next.activePage,
      historyIndex: historyIndex + 1,
      selectedWidgetId: null,
      selectedWidgetIds: new Set(),
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // Copy/paste
  copyWidget: () => {
    const { selectedWidgetId } = get();
    if (!selectedWidgetId) return;
    const widgets = get().getActivePageWidgets();
    const widget = widgets.find((w) => w.id === selectedWidgetId);
    if (widget) set({ clipboard: { ...widget } });
  },

  pasteWidget: () => {
    const { clipboard } = get();
    if (!clipboard) return;
    const newWidget: Widget = { ...clipboard, id: generateId(), x: clipboard.x + 30, y: clipboard.y + 30 };
    get().addWidget(newWidget);
    set({ selectedWidgetId: newWidget.id, selectedWidgetIds: new Set([newWidget.id]) });
  },

  deleteSelected: () => {
    const { dashboard, activePage, selectedWidgetIds, history, historyIndex } = get();
    if (!dashboard || selectedWidgetIds.size === 0) return;
    const pages = ensurePages(dashboard);
    const newPages = pages.map((p, i) =>
      i === activePage ? { ...p, widgets: p.widgets.filter((w) => !selectedWidgetIds.has(w.id)) } : p,
    );
    const h = pushHistory(history, historyIndex, newPages, activePage, `Delete ${selectedWidgetIds.size} widgets`);
    set({
      dashboard: { ...dashboard, pages: newPages, widgets: newPages[activePage].widgets },
      selectedWidgetId: null,
      selectedWidgetIds: new Set(),
      ...h,
    });
  },

  // Theme
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
}));

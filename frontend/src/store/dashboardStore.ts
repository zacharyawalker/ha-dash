import { create } from 'zustand';
import type { Dashboard, Widget } from '../types/dashboard';
import { loadDashboard, saveDashboard } from '../api/client';
import { generateId } from '../utils/id';

/** Undoable action */
interface HistoryEntry {
  widgets: Widget[];
  label: string;
}

interface DashboardStore {
  dashboard: Dashboard | null;
  mode: 'edit' | 'view';
  selectedWidgetId: string | null;
  /** Multi-select: additional selected widget IDs */
  selectedWidgetIds: Set<string>;
  loading: boolean;
  error: string | null;

  /** Grid snapping */
  gridEnabled: boolean;
  gridSize: number;

  /** Undo/redo */
  history: HistoryEntry[];
  historyIndex: number;
  clipboard: Widget | null;

  // Actions
  setMode: (mode: 'edit' | 'view') => void;
  selectWidget: (id: string | null, addToSelection?: boolean) => void;
  load: (id?: string) => Promise<void>;
  save: () => Promise<void>;
  addWidget: (widget: Widget) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;

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

  // Multi-select
  deleteSelected: () => void;
}

const MAX_HISTORY = 50;

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  dashboard: null,
  mode: 'view',
  selectedWidgetId: null,
  selectedWidgetIds: new Set(),
  loading: false,
  error: null,
  gridEnabled: true,
  gridSize: 20,
  history: [],
  historyIndex: -1,
  clipboard: null,

  setMode: (mode) => set({ mode, selectedWidgetId: null, selectedWidgetIds: new Set() }),

  selectWidget: (id, addToSelection = false) => {
    if (!addToSelection) {
      set({ selectedWidgetId: id, selectedWidgetIds: new Set(id ? [id] : []) });
    } else if (id) {
      const { selectedWidgetIds, selectedWidgetId } = get();
      const newSet = new Set(selectedWidgetIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      // First selected becomes primary
      const primary = selectedWidgetId || id;
      set({ selectedWidgetId: primary, selectedWidgetIds: newSet });
    }
  },

  load: async (id = 'default') => {
    set({ loading: true, error: null });
    try {
      const dashboard = await loadDashboard(id);
      set({
        dashboard,
        loading: false,
        history: [{ widgets: [...dashboard.widgets], label: 'Load' }],
        historyIndex: 0,
      });
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

  /** Push to history before mutation */
  addWidget: (widget) => {
    const { dashboard, history, historyIndex } = get();
    if (!dashboard) return;
    const newWidgets = [...dashboard.widgets, widget];
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ widgets: newWidgets, label: `Add ${widget.type}` });
    if (newHistory.length > MAX_HISTORY) newHistory.shift();

    set({
      dashboard: { ...dashboard, widgets: newWidgets },
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  updateWidget: (id, updates) => {
    const { dashboard, history, historyIndex } = get();
    if (!dashboard) return;
    const newWidgets = dashboard.widgets.map((w) => w.id === id ? { ...w, ...updates } : w);
    // Only push to history for significant updates (not every drag pixel)
    const isSignificant = updates.config || updates.type;
    const newHistory = isSignificant
      ? [...history.slice(0, historyIndex + 1), { widgets: newWidgets, label: 'Update widget' }]
      : history;
    if (newHistory.length > MAX_HISTORY) newHistory.shift();

    set({
      dashboard: { ...dashboard, widgets: newWidgets },
      history: newHistory,
      historyIndex: isSignificant ? newHistory.length - 1 : historyIndex,
    });
  },

  removeWidget: (id) => {
    const { dashboard, history, historyIndex } = get();
    if (!dashboard) return;
    const newWidgets = dashboard.widgets.filter((w) => w.id !== id);
    const newHistory = [...history.slice(0, historyIndex + 1), { widgets: newWidgets, label: 'Delete widget' }];
    if (newHistory.length > MAX_HISTORY) newHistory.shift();

    set({
      dashboard: { ...dashboard, widgets: newWidgets },
      selectedWidgetId: null,
      selectedWidgetIds: new Set(),
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  // Grid
  setGridEnabled: (enabled) => set({ gridEnabled: enabled }),
  setGridSize: (size) => set({ gridSize: size }),
  snapToGrid: (value) => {
    const { gridEnabled, gridSize } = get();
    if (!gridEnabled) return value;
    return Math.round(value / gridSize) * gridSize;
  },

  // Undo/redo
  undo: () => {
    const { dashboard, history, historyIndex } = get();
    if (!dashboard || historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    set({
      dashboard: { ...dashboard, widgets: [...prev.widgets] },
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
      dashboard: { ...dashboard, widgets: [...next.widgets] },
      historyIndex: historyIndex + 1,
      selectedWidgetId: null,
      selectedWidgetIds: new Set(),
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // Copy/paste
  copyWidget: () => {
    const { dashboard, selectedWidgetId } = get();
    if (!dashboard || !selectedWidgetId) return;
    const widget = dashboard.widgets.find((w) => w.id === selectedWidgetId);
    if (widget) set({ clipboard: { ...widget } });
  },

  pasteWidget: () => {
    const { clipboard } = get();
    if (!clipboard) return;
    const newWidget: Widget = {
      ...clipboard,
      id: generateId(),
      x: clipboard.x + 30,
      y: clipboard.y + 30,
    };
    get().addWidget(newWidget);
    set({ selectedWidgetId: newWidget.id, selectedWidgetIds: new Set([newWidget.id]) });
  },

  // Delete all selected
  deleteSelected: () => {
    const { dashboard, selectedWidgetIds, history, historyIndex } = get();
    if (!dashboard || selectedWidgetIds.size === 0) return;
    const newWidgets = dashboard.widgets.filter((w) => !selectedWidgetIds.has(w.id));
    const newHistory = [...history.slice(0, historyIndex + 1), { widgets: newWidgets, label: `Delete ${selectedWidgetIds.size} widgets` }];

    set({
      dashboard: { ...dashboard, widgets: newWidgets },
      selectedWidgetId: null,
      selectedWidgetIds: new Set(),
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
}));

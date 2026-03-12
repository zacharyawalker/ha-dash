import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDashboardStore } from '../store/dashboardStore';
import type { Dashboard, Widget } from '../types/dashboard';

// Mock the API client
vi.mock('../api/client', () => ({
  loadDashboard: vi.fn(),
  saveDashboard: vi.fn(),
  callService: vi.fn(),
}));

const mockDashboard: Dashboard = {
  id: 'default',
  name: 'Test Dashboard',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  widgets: [],
};

const mockWidget: Widget = {
  id: 'test-widget-1',
  type: 'light-toggle',
  x: 50,
  y: 50,
  width: 140,
  height: 140,
  config: { entityId: 'light.test', label: 'Test Light' },
};

describe('dashboardStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useDashboardStore.setState({
      dashboard: null,
      mode: 'view',
      selectedWidgetId: null,
      loading: false,
      error: null,
    });
  });

  describe('mode', () => {
    it('starts in view mode', () => {
      expect(useDashboardStore.getState().mode).toBe('view');
    });

    it('switches to edit mode', () => {
      useDashboardStore.getState().setMode('edit');
      expect(useDashboardStore.getState().mode).toBe('edit');
    });

    it('clears selection when switching modes', () => {
      useDashboardStore.setState({ selectedWidgetId: 'some-id' });
      useDashboardStore.getState().setMode('view');
      expect(useDashboardStore.getState().selectedWidgetId).toBeNull();
    });
  });

  describe('widget selection', () => {
    it('selects a widget', () => {
      useDashboardStore.getState().selectWidget('test-id');
      expect(useDashboardStore.getState().selectedWidgetId).toBe('test-id');
    });

    it('deselects with null', () => {
      useDashboardStore.setState({ selectedWidgetId: 'test-id' });
      useDashboardStore.getState().selectWidget(null);
      expect(useDashboardStore.getState().selectedWidgetId).toBeNull();
    });
  });

  describe('addWidget', () => {
    it('adds a widget to the dashboard', () => {
      useDashboardStore.setState({ dashboard: { ...mockDashboard } });
      useDashboardStore.getState().addWidget(mockWidget);

      const widgets = useDashboardStore.getState().dashboard!.widgets;
      expect(widgets).toHaveLength(1);
      expect(widgets[0]).toEqual(mockWidget);
    });

    it('creates a new array reference (immutability)', () => {
      const dashboard = { ...mockDashboard, widgets: [] };
      useDashboardStore.setState({ dashboard });
      const originalWidgets = useDashboardStore.getState().dashboard!.widgets;

      useDashboardStore.getState().addWidget(mockWidget);
      const newWidgets = useDashboardStore.getState().dashboard!.widgets;

      expect(newWidgets).not.toBe(originalWidgets);
    });

    it('does nothing if no dashboard loaded', () => {
      useDashboardStore.getState().addWidget(mockWidget);
      expect(useDashboardStore.getState().dashboard).toBeNull();
    });
  });

  describe('updateWidget', () => {
    it('updates widget properties', () => {
      useDashboardStore.setState({
        dashboard: { ...mockDashboard, widgets: [{ ...mockWidget }] },
      });

      useDashboardStore.getState().updateWidget('test-widget-1', { x: 200, y: 300 });

      const widget = useDashboardStore.getState().dashboard!.widgets[0];
      expect(widget.x).toBe(200);
      expect(widget.y).toBe(300);
      expect(widget.width).toBe(140); // unchanged
    });

    it('updates widget config', () => {
      useDashboardStore.setState({
        dashboard: { ...mockDashboard, widgets: [{ ...mockWidget }] },
      });

      useDashboardStore.getState().updateWidget('test-widget-1', {
        config: { entityId: 'light.new', label: 'New Light' },
      });

      const widget = useDashboardStore.getState().dashboard!.widgets[0];
      expect(widget.config.entityId).toBe('light.new');
    });

    it('does not modify other widgets', () => {
      const widget2: Widget = { ...mockWidget, id: 'test-widget-2', x: 300 };
      useDashboardStore.setState({
        dashboard: { ...mockDashboard, widgets: [{ ...mockWidget }, widget2] },
      });

      useDashboardStore.getState().updateWidget('test-widget-1', { x: 999 });

      const widgets = useDashboardStore.getState().dashboard!.widgets;
      expect(widgets[0].x).toBe(999);
      expect(widgets[1].x).toBe(300);
    });
  });

  describe('removeWidget', () => {
    it('removes a widget by id', () => {
      useDashboardStore.setState({
        dashboard: { ...mockDashboard, widgets: [{ ...mockWidget }] },
      });

      useDashboardStore.getState().removeWidget('test-widget-1');

      expect(useDashboardStore.getState().dashboard!.widgets).toHaveLength(0);
    });

    it('clears selection after removal', () => {
      useDashboardStore.setState({
        dashboard: { ...mockDashboard, widgets: [{ ...mockWidget }] },
        selectedWidgetId: 'test-widget-1',
      });

      useDashboardStore.getState().removeWidget('test-widget-1');

      expect(useDashboardStore.getState().selectedWidgetId).toBeNull();
    });

    it('keeps other widgets intact', () => {
      const widget2: Widget = { ...mockWidget, id: 'test-widget-2' };
      useDashboardStore.setState({
        dashboard: { ...mockDashboard, widgets: [{ ...mockWidget }, widget2] },
      });

      useDashboardStore.getState().removeWidget('test-widget-1');

      const widgets = useDashboardStore.getState().dashboard!.widgets;
      expect(widgets).toHaveLength(1);
      expect(widgets[0].id).toBe('test-widget-2');
    });
  });

  describe('load', () => {
    it('sets loading state', async () => {
      const { loadDashboard } = await import('../api/client');
      (loadDashboard as ReturnType<typeof vi.fn>).mockResolvedValue(mockDashboard);

      const promise = useDashboardStore.getState().load();
      expect(useDashboardStore.getState().loading).toBe(true);

      await promise;
      expect(useDashboardStore.getState().loading).toBe(false);
      expect(useDashboardStore.getState().dashboard).toEqual(mockDashboard);
    });

    it('handles load errors', async () => {
      const { loadDashboard } = await import('../api/client');
      (loadDashboard as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      await useDashboardStore.getState().load();

      expect(useDashboardStore.getState().error).toBe('Network error');
      expect(useDashboardStore.getState().loading).toBe(false);
    });
  });
});

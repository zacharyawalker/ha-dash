import { useDashboardStore } from '../store/dashboardStore';

/**
 * Shows a size label below the selected widget in edit mode.
 * Displays width × height in pixels.
 */
export default function WidgetSizeLabel() {
  const { mode, selectedWidgetId, dashboard, activePage } = useDashboardStore();
  const pages = dashboard?.pages;
  const widgets = pages?.[activePage]?.widgets || [];
  const widget = widgets.find((w) => w.id === selectedWidgetId);

  if (mode !== 'edit' || !widget) return null;

  return (
    <div
      className="absolute pointer-events-none z-50 px-1.5 py-0.5 rounded text-xs font-mono"
      style={{
        left: widget.x,
        top: widget.y + widget.height + 4,
        background: 'var(--color-accent)',
        color: 'white',
        fontSize: '10px',
      }}
    >
      {widget.width} × {widget.height}
    </div>
  );
}

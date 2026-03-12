import { useDashboardStore } from '../store/dashboardStore';
import WidgetWrapper from './WidgetWrapper';

export default function Canvas() {
  const { dashboard, mode, selectWidget } = useDashboardStore();

  return (
    <div
      className="relative w-full flex-1 overflow-hidden"
      style={{ background: 'var(--color-surface-page)' }}
      onMouseDown={(e) => {
        // Only deselect when clicking the canvas background itself, not a child widget
        if (e.target === e.currentTarget) selectWidget(null);
      }}
    >
      {dashboard?.widgets.map((widget) => (
        <WidgetWrapper key={widget.id} widget={widget} mode={mode} />
      ))}

      {dashboard?.widgets.length === 0 && mode === 'edit' && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <p style={{ color: 'var(--color-text-tertiary)' }}>Click "Add Widget" in the toolbar to get started</p>
        </div>
      )}
    </div>
  );
}

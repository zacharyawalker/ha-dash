import { useDashboardStore } from '../store/dashboardStore';
import WidgetWrapper from './WidgetWrapper';

export default function Canvas() {
  const { dashboard, mode, selectWidget, gridEnabled, gridSize } = useDashboardStore();

  const gridBackground = mode === 'edit' && gridEnabled
    ? {
        backgroundImage: `radial-gradient(circle, var(--color-border-primary) 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }
    : {};

  return (
    <div
      className="relative w-full flex-1 overflow-hidden"
      style={{
        background: 'var(--color-surface-page)',
        ...gridBackground,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) selectWidget(null);
      }}
    >
      {dashboard?.widgets.map((widget) => (
        <WidgetWrapper key={widget.id} widget={widget} mode={mode} />
      ))}

      {dashboard?.widgets.length === 0 && mode === 'edit' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p style={{ color: 'var(--color-text-tertiary)' }}>Click "Add Widget" in the toolbar to get started</p>
        </div>
      )}
    </div>
  );
}

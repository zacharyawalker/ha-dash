import { useDashboardStore } from '../store/dashboardStore';
import WidgetWrapper from './WidgetWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import AlignmentGuides from './AlignmentGuides';
import WidgetSizeLabel from './WidgetSizeLabel';
import { useResponsiveScale } from '../hooks/useResponsiveScale';
import { usePinchZoom } from '../hooks/usePinchZoom';

/** Page transition */
const pageTransition = {
  duration: 0.25,
};

export default function Canvas() {
  const { dashboard, mode, selectWidget, gridEnabled, gridSize, activePage } = useDashboardStore();
  const pages = dashboard?.pages;
  const currentPage = pages?.[activePage];
  const widgets = currentPage?.widgets || dashboard?.widgets || [];
  const bgImage = currentPage?.backgroundImage;
  const bgColor = currentPage?.backgroundColor;

  const { scale } = useResponsiveScale();
  const { zoom, resetZoom, bindCanvas } = usePinchZoom();
  // In view mode: auto-scale for small screens × manual zoom. Edit mode: zoom only.
  const canvasScale = mode === 'view' ? scale * zoom : zoom;

  const gridBackground = mode === 'edit' && gridEnabled
    ? {
        backgroundImage: `radial-gradient(circle, var(--color-border-primary) 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }
    : {};

  return (
    <div
      data-canvas
      ref={bindCanvas}
      className="relative w-full flex-1 overflow-auto"
      style={{
        background: bgImage
          ? `url(${bgImage}) center/cover no-repeat`
          : bgColor || 'var(--color-surface-page)',
        ...gridBackground,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) selectWidget(null);
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`page-${activePage}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={pageTransition}
          className="absolute inset-0"
          style={{
            transform: canvasScale < 1 ? `scale(${canvasScale})` : undefined,
            transformOrigin: 'top left',
            width: canvasScale < 1 ? `${100 / canvasScale}%` : undefined,
            height: canvasScale < 1 ? `${100 / canvasScale}%` : undefined,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) selectWidget(null);
          }}
        >
          {widgets.map((widget, i) => (
            <WidgetWrapper key={widget.id} widget={widget} mode={mode} index={i} />
          ))}
          {mode === 'edit' && <AlignmentGuides />}
          {mode === 'edit' && <WidgetSizeLabel />}
        </motion.div>
      </AnimatePresence>

      {/* Zoom indicator */}
      {canvasScale !== 1 && (
        <button
          onClick={resetZoom}
          className="fixed bottom-4 right-4 z-50 px-2 py-1 text-xs font-mono rounded-lg shadow-lg"
          style={{
            background: 'var(--color-surface-primary)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border-primary)',
          }}
          title="Click to reset zoom"
        >
          {Math.round(canvasScale * 100)}%
        </button>
      )}

      {widgets.length === 0 && mode === 'edit' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <p style={{ color: 'var(--color-text-tertiary)' }}>Click "Add Widget" in the toolbar to get started</p>
        </div>
      )}
    </div>
  );
}

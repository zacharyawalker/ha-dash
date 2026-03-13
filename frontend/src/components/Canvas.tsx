import { useDashboardStore } from '../store/dashboardStore';
import WidgetWrapper from './WidgetWrapper';
import { motion, AnimatePresence } from 'framer-motion';

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

  const gridBackground = mode === 'edit' && gridEnabled
    ? {
        backgroundImage: `radial-gradient(circle, var(--color-border-primary) 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }
    : {};

  return (
    <div
      data-canvas
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
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) selectWidget(null);
          }}
        >
          {widgets.map((widget, i) => (
            <WidgetWrapper key={widget.id} widget={widget} mode={mode} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {widgets.length === 0 && mode === 'edit' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <p style={{ color: 'var(--color-text-tertiary)' }}>Click "Add Widget" in the toolbar to get started</p>
        </div>
      )}
    </div>
  );
}

import { useMemo, useRef, useCallback } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { motion } from 'framer-motion';

const MINIMAP_WIDTH = 180;
const MINIMAP_HEIGHT = 120;

/**
 * Minimap component — shows a bird's-eye view of all widgets on the current page.
 * Widgets appear as colored rectangles. Selected widget is highlighted.
 * Click on minimap to scroll canvas to that position.
 */
export default function Minimap() {
  const mode = useDashboardStore((s) => s.mode);
  const dashboard = useDashboardStore((s) => s.dashboard);
  const activePage = useDashboardStore((s) => s.activePage);
  const selectedWidgetId = useDashboardStore((s) => s.selectedWidgetId);
  const ref = useRef<HTMLDivElement>(null);

  const pages = dashboard?.pages || [];
  const widgets = pages[activePage]?.widgets || [];

  const { scale } = useMemo(() => {
    if (widgets.length === 0) return { scale: 1, bounds: { maxX: 1920, maxY: 1080 } };
    let maxX = 1920;
    let maxY = 1080;
    for (const w of widgets) {
      maxX = Math.max(maxX, w.x + w.width + 40);
      maxY = Math.max(maxY, w.y + w.height + 40);
    }
    return {
      scale: Math.min(MINIMAP_WIDTH / maxX, MINIMAP_HEIGHT / maxY),
    };
  }, [widgets]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    // Scroll canvas to center on clicked position
    const canvas = document.querySelector('[data-canvas]') as HTMLElement | null;
    if (canvas) {
      canvas.scrollTo({
        left: x - canvas.clientWidth / 2,
        top: y - canvas.clientHeight / 2,
        behavior: 'smooth',
      });
    }
  }, [scale]);

  if (mode !== 'edit' || widgets.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-16 right-4 z-30 rounded-lg shadow-lg overflow-hidden cursor-crosshair"
      style={{
        width: MINIMAP_WIDTH,
        height: MINIMAP_HEIGHT,
        background: 'var(--color-surface-primary)',
        border: '1px solid var(--color-border-primary)',
        opacity: 0.85,
      }}
      ref={ref}
      onClick={handleClick}
    >
      {widgets.map((w) => (
        <div
          key={w.id}
          className="absolute rounded-sm"
          style={{
            left: w.x * scale,
            top: w.y * scale,
            width: Math.max(4, w.width * scale),
            height: Math.max(3, w.height * scale),
            background: w.id === selectedWidgetId ? 'var(--color-accent)' : 'var(--color-accent-muted)',
            border: w.id === selectedWidgetId ? '1px solid var(--color-accent)' : '1px solid var(--color-border-secondary)',
          }}
        />
      ))}
    </motion.div>
  );
}

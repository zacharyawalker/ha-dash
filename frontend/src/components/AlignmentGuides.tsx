import { useMemo } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

/**
 * Alignment guide lines shown in edit mode.
 * Displays center crosshairs and widget edge alignment lines
 * when a widget is being dragged near another widget's edge.
 */
export default function AlignmentGuides() {
  const dashboard = useDashboardStore((s) => s.dashboard);
  const activePage = useDashboardStore((s) => s.activePage);
  const selectedWidgetId = useDashboardStore((s) => s.selectedWidgetId);
  const mode = useDashboardStore((s) => s.mode);

  const pages = dashboard?.pages || [];
  const widgets = pages[activePage]?.widgets || [];
  const selected = widgets.find((w) => w.id === selectedWidgetId);

  const guides = useMemo(() => {
    if (!selected || mode !== 'edit') return { horizontal: [] as number[], vertical: [] as number[] };

    const threshold = 5;
    const h: number[] = [];
    const v: number[] = [];

    const sCenterX = selected.x + selected.width / 2;
    const sCenterY = selected.y + selected.height / 2;

    for (const w of widgets) {
      if (w.id === selected.id) continue;

      // Left edge alignment
      if (Math.abs(selected.x - w.x) < threshold) v.push(w.x);
      // Right edge alignment
      if (Math.abs(selected.x + selected.width - (w.x + w.width)) < threshold) v.push(w.x + w.width);
      // Left to right
      if (Math.abs(selected.x - (w.x + w.width)) < threshold) v.push(w.x + w.width);
      // Right to left
      if (Math.abs(selected.x + selected.width - w.x) < threshold) v.push(w.x);

      // Top edge alignment
      if (Math.abs(selected.y - w.y) < threshold) h.push(w.y);
      // Bottom edge alignment
      if (Math.abs(selected.y + selected.height - (w.y + w.height)) < threshold) h.push(w.y + w.height);
      // Top to bottom
      if (Math.abs(selected.y - (w.y + w.height)) < threshold) h.push(w.y + w.height);
      // Bottom to top
      if (Math.abs(selected.y + selected.height - w.y) < threshold) h.push(w.y);

      // Center alignment
      const wCenterX = w.x + w.width / 2;
      const wCenterY = w.y + w.height / 2;
      if (Math.abs(sCenterX - wCenterX) < threshold) v.push(wCenterX);
      if (Math.abs(sCenterY - wCenterY) < threshold) h.push(wCenterY);
    }

    return { horizontal: [...new Set(h)], vertical: [...new Set(v)] };
  }, [selected, widgets, mode]);

  if (!selected || mode !== 'edit') return null;

  return (
    <>
      {guides.vertical.map((x, i) => (
        <div
          key={`v-${i}`}
          className="absolute top-0 bottom-0 pointer-events-none z-40"
          style={{
            left: x,
            width: 1,
            background: 'var(--color-accent)',
            opacity: 0.5,
          }}
        />
      ))}
      {guides.horizontal.map((y, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 right-0 pointer-events-none z-40"
          style={{
            top: y,
            height: 1,
            background: 'var(--color-accent)',
            opacity: 0.5,
          }}
        />
      ))}
    </>
  );
}

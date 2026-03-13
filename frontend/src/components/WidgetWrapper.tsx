import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import type { Widget } from '../types/dashboard';
import { widgetComponents } from './widgets/WidgetRegistry';
import { useDashboardStore } from '../store/dashboardStore';
import { useEntityStore } from '../store/entityStore';
import WidgetErrorBoundary from './WidgetErrorBoundary';

interface Props {
  widget: Widget;
  mode: 'edit' | 'view';
  index?: number;
}

/**
 * Evaluate conditional visibility.
 * config.visibilityEntity + config.visibilityState controls show/hide.
 * In edit mode, always show (with opacity hint).
 */
function useConditionalVisibility(widget: Widget, mode: 'edit' | 'view'): { visible: boolean; dimmed: boolean } {
  const condEntity = widget.config.visibilityEntity as string | undefined;
  const condState = widget.config.visibilityState as string | undefined;
  const entity = useEntityStore((s) => condEntity ? s.entities[condEntity] : undefined);

  if (!condEntity || !condState) return { visible: true, dimmed: false };

  const matches = entity?.state === condState;
  if (mode === 'edit') return { visible: true, dimmed: !matches };
  return { visible: matches, dimmed: false };
}

import { memo } from 'react';

function WidgetWrapperInner({ widget, mode, index = 0 }: Props) {
  const { updateWidget, selectedWidgetId, selectWidget, snapToGrid, gridEnabled, gridSize } =
    useDashboardStore();
  const { visible, dimmed } = useConditionalVisibility(widget, mode);

  const WidgetComponent = widgetComponents[widget.type];
  if (!WidgetComponent) return null;
  if (!visible) return null;

  const isSelected = selectedWidgetId === widget.id;

  if (mode === 'edit') {
    return (
      <Rnd
        position={{ x: widget.x, y: widget.y }}
        size={{ width: widget.width, height: widget.height }}
        disableDragging={!!widget.locked}
        enableResizing={!widget.locked}
        onMouseDown={() => {
          selectWidget(widget.id);
        }}
        onDragStop={(_e, d) => {
          updateWidget(widget.id, {
            x: snapToGrid(d.x),
            y: snapToGrid(d.y),
          });
        }}
        onResizeStop={(_e, _dir, ref, _delta, position) => {
          updateWidget(widget.id, {
            width: gridEnabled ? snapToGrid(parseInt(ref.style.width)) : parseInt(ref.style.width),
            height: gridEnabled ? snapToGrid(parseInt(ref.style.height)) : parseInt(ref.style.height),
            x: snapToGrid(position.x),
            y: snapToGrid(position.y),
          });
        }}
        dragGrid={gridEnabled ? [gridSize, gridSize] : undefined}
        resizeGrid={gridEnabled ? [gridSize, gridSize] : undefined}
        bounds="parent"
        minWidth={80}
        minHeight={80}
        style={{
          outline: widget.locked
            ? (isSelected ? '2px solid var(--color-warning)' : '1px dashed var(--color-warning)')
            : (isSelected ? '2px solid var(--color-accent)' : '1px dashed var(--color-border-secondary)'),
          borderRadius: 'var(--radius-card)',
          overflow: 'visible',
          zIndex: isSelected ? 100 : (widget.zIndex || 1),
          opacity: dimmed ? 0.4 : 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full h-full"
          style={{ pointerEvents: 'none' }}
          data-widget-id={widget.id}
        >
          <WidgetErrorBoundary widgetId={widget.id}>
            <WidgetComponent config={widget.config} mode={mode} />
          </WidgetErrorBoundary>
        </motion.div>
      </Rnd>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.04, 0.6), duration: 0.3, ease: 'easeOut' }}
        className="w-full h-full"
      >
        <WidgetErrorBoundary widgetId={widget.id}>
          <WidgetComponent config={widget.config} mode={mode} />
        </WidgetErrorBoundary>
      </motion.div>
    </div>
  );
}

/** Memoized widget wrapper — prevents re-renders when other widgets change */
const WidgetWrapper = memo(WidgetWrapperInner, (prev, next) => {
  return (
    prev.mode === next.mode &&
    prev.index === next.index &&
    prev.widget.id === next.widget.id &&
    prev.widget.x === next.widget.x &&
    prev.widget.y === next.widget.y &&
    prev.widget.width === next.widget.width &&
    prev.widget.height === next.widget.height &&
    prev.widget.config === next.widget.config
  );
});

export default WidgetWrapper;

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

export default function WidgetWrapper({ widget, mode }: Props) {
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
          outline: isSelected ? '2px solid var(--color-accent)' : '1px dashed var(--color-border-secondary)',
          borderRadius: 'var(--radius-card)',
          overflow: 'visible',
          zIndex: isSelected ? 10 : 1,
          opacity: dimmed ? 0.4 : 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full h-full"
          style={{ pointerEvents: 'none' }}
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full h-full"
      >
        <WidgetErrorBoundary widgetId={widget.id}>
          <WidgetComponent config={widget.config} mode={mode} />
        </WidgetErrorBoundary>
      </motion.div>
    </div>
  );
}

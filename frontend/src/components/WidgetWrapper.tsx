import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import type { Widget } from '../types/dashboard';
import { widgetComponents } from './widgets/WidgetRegistry';
import { useDashboardStore } from '../store/dashboardStore';
import WidgetErrorBoundary from './WidgetErrorBoundary';

interface Props {
  widget: Widget;
  mode: 'edit' | 'view';
}

export default function WidgetWrapper({ widget, mode }: Props) {
  const { updateWidget, selectedWidgetId, selectWidget, snapToGrid, gridEnabled, gridSize } =
    useDashboardStore();

  const WidgetComponent = widgetComponents[widget.type];
  if (!WidgetComponent) return null;

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

import { useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import type { Widget } from '../types/dashboard';
import { widgetComponents } from './widgets/WidgetRegistry';
import { useDashboardStore } from '../store/dashboardStore';

interface Props {
  widget: Widget;
  mode: 'edit' | 'view';
}

export default function WidgetWrapper({ widget, mode }: Props) {
  const { updateWidget, selectedWidgetId, selectWidget } =
    useDashboardStore();

  const WidgetComponent = widgetComponents[widget.type];
  if (!WidgetComponent) return null;

  const isSelected = selectedWidgetId === widget.id;

  // Stop mousedown from reaching the Canvas (which would deselect)
  // but DON'T stop it from reaching React-Rnd (which needs it for dragging)
  const handleWrapperMouseDown = useCallback(() => {
    selectWidget(widget.id);
  }, [selectWidget, widget.id]);

  if (mode === 'edit') {
    return (
      <div
        onMouseDownCapture={(e) => {
          // Stop the Canvas from receiving this event (prevents deselect)
          // Using capture phase so React-Rnd still gets the bubble phase for dragging
          e.stopPropagation();
          handleWrapperMouseDown();
        }}
      >
        <Rnd
          position={{ x: widget.x, y: widget.y }}
          size={{ width: widget.width, height: widget.height }}
          onDragStart={() => {
            selectWidget(widget.id);
          }}
          onDragStop={(_e, d) => {
            updateWidget(widget.id, { x: d.x, y: d.y });
          }}
          onResizeStop={(_e, _dir, ref, _delta, position) => {
            updateWidget(widget.id, {
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
              x: position.x,
              y: position.y,
            });
          }}
          bounds="parent"
          minWidth={80}
          minHeight={80}
          style={{
            outline: isSelected ? '2px solid #4a9eff' : '1px dashed rgba(255,255,255,0.2)',
            borderRadius: '12px',
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
            <WidgetComponent config={widget.config} mode={mode} />
          </motion.div>
        </Rnd>
      </div>
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
        <WidgetComponent config={widget.config} mode={mode} />
      </motion.div>
    </div>
  );
}

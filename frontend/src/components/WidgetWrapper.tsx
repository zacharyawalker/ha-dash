import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import type { Widget } from '../types/dashboard';
import { widgetComponents } from './widgets/WidgetRegistry';
import { useDashboardStore } from '../store/dashboardStore';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';

interface Props {
  widget: Widget;
  mode: 'edit' | 'view';
}

export default function WidgetWrapper({ widget, mode }: Props) {
  const { updateWidget, removeWidget, selectedWidgetId, selectWidget } =
    useDashboardStore();

  const WidgetComponent = widgetComponents[widget.type];
  if (!WidgetComponent) return null;

  const isSelected = selectedWidgetId === widget.id;

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full h-full relative"
    >
      {mode === 'edit' && isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeWidget(widget.id);
          }}
          className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-400 transition-colors"
        >
          <Icon path={mdiClose} size={0.5} color="white" />
        </button>
      )}
      <WidgetComponent config={widget.config} mode={mode} />
    </motion.div>
  );

  if (mode === 'edit') {
    return (
      <Rnd
        position={{ x: widget.x, y: widget.y }}
        size={{ width: widget.width, height: widget.height }}
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
        }}
        onMouseDown={() => selectWidget(widget.id)}
      >
        {content}
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
      <AnimatePresence>{content}</AnimatePresence>
    </div>
  );
}

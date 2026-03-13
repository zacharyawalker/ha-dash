import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import {
  mdiContentCopy, mdiDelete, mdiArrowUpBold, mdiArrowDownBold,
  mdiLock, mdiLockOpen,
} from '@mdi/js';
import { useDashboardStore } from '../store/dashboardStore';

interface MenuPos {
  x: number;
  y: number;
  widgetId: string;
}

/**
 * Right-click context menu for widgets in edit mode.
 * Provides quick access to copy, delete, lock, layering, and config.
 */
export default function ContextMenu() {
  const [menu, setMenu] = useState<MenuPos | null>(null);
  const { mode, copyWidget, pasteWidget, removeWidget, updateWidget, selectWidget, bringToFront, sendToBack } = useDashboardStore();

  const dashboard = useDashboardStore((s) => s.dashboard);
  const activePage = useDashboardStore((s) => s.activePage);

  const widget = menu
    ? dashboard?.pages?.[activePage]?.widgets.find((w) => w.id === menu.widgetId) ??
      dashboard?.widgets?.find((w) => w.id === menu.widgetId)
    : null;

  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (mode !== 'edit') return;

    // Walk up from target to find a widget wrapper
    let el = e.target as HTMLElement | null;
    let widgetId: string | null = null;
    while (el) {
      if (el.dataset?.widgetId) {
        widgetId = el.dataset.widgetId;
        break;
      }
      el = el.parentElement;
    }
    if (!widgetId) return;

    e.preventDefault();
    selectWidget(widgetId);
    setMenu({ x: e.clientX, y: e.clientY, widgetId });
  }, [mode, selectWidget]);

  const close = useCallback(() => setMenu(null), []);

  useEffect(() => {
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', close);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', close);
    };
  }, [handleContextMenu, close]);

  if (!menu || !widget) return null;

  const isLocked = !!widget.locked;

  const items = [
    { icon: mdiContentCopy, label: 'Duplicate', action: () => { copyWidget(); pasteWidget(); } },
    { icon: mdiArrowUpBold, label: 'Bring to Front', action: () => bringToFront(menu.widgetId) },
    { icon: mdiArrowDownBold, label: 'Send to Back', action: () => sendToBack(menu.widgetId) },
    { icon: isLocked ? mdiLockOpen : mdiLock, label: isLocked ? 'Unlock' : 'Lock', action: () => updateWidget(menu.widgetId, { locked: !isLocked }) },
    { icon: mdiDelete, label: 'Delete', action: () => removeWidget(menu.widgetId), danger: true },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.1 }}
        className="fixed z-[100] min-w-[160px] rounded-lg shadow-xl overflow-hidden"
        style={{
          top: menu.y,
          left: menu.x,
          background: 'var(--color-surface-primary)',
          border: '1px solid var(--color-border-primary)',
        }}
      >
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => { item.action(); close(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left"
            style={{ color: (item as { danger?: boolean }).danger ? 'var(--color-error)' : 'var(--color-text-primary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon path={item.icon} size={0.6} color={(item as { danger?: boolean }).danger ? 'var(--color-error)' : 'var(--color-text-secondary)'} />
            {item.label}
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

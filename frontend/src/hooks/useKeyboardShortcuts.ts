import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

/**
 * Global keyboard shortcuts for edit mode.
 * Ctrl+Z: undo, Ctrl+Shift+Z / Ctrl+Y: redo
 * Ctrl+C: copy widget, Ctrl+V: paste widget
 * Delete/Backspace: delete selected
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const store = useDashboardStore.getState();
      if (store.mode !== 'edit') return;

      // Don't intercept when typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      } else if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        store.redo();
      } else if (ctrl && e.key === 'c') {
        e.preventDefault();
        store.copyWidget();
      } else if (ctrl && e.key === 'v') {
        e.preventDefault();
        store.pasteWidget();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (store.selectedWidgetIds.size > 0) {
          store.deleteSelected();
        }
      } else if (e.key === 'Escape') {
        store.selectWidget(null);
      } else if (ctrl && e.key === 'g') {
        e.preventDefault();
        store.setGridEnabled(!store.gridEnabled);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}

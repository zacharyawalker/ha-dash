import { useEffect } from 'react';
import { useDashboardStore } from './store/dashboardStore';
import { wsManager } from './api/websocket';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import WidgetConfigPanel from './components/WidgetConfigPanel';
import ErrorBoundary from './components/ErrorBoundary';
import PageTabs from './components/PageTabs';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  const { load, loading, error } = useDashboardStore();
  const mode = useDashboardStore((s) => s.mode);
  const selectedWidgetId = useDashboardStore((s) => s.selectedWidgetId);

  useKeyboardShortcuts();

  useEffect(() => {
    wsManager.connect();
    return () => wsManager.disconnect();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--color-surface-primary)', color: 'var(--color-text-secondary)' }}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3" style={{ background: 'var(--color-surface-primary)' }}>
        <div className="text-lg font-medium" style={{ color: 'var(--color-error)' }}>
          Failed to load dashboard
        </div>
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{error}</div>
        <button
          onClick={() => load()}
          className="mt-2 px-4 py-2 text-sm rounded-lg transition-colors"
          style={{ background: 'var(--color-accent)', color: 'white' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen">
        <Toolbar />
        <PageTabs />
        <div className="flex flex-1 overflow-hidden">
          <Canvas />
          {mode === 'edit' && selectedWidgetId && <WidgetConfigPanel />}
        </div>
      </div>
    </ErrorBoundary>
  );
}

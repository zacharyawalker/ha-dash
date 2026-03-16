import { useEffect, useState } from 'react';
import { useDashboardStore } from './store/dashboardStore';
import { wsManager } from './api/websocket';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import WidgetConfigPanel from './components/WidgetConfigPanel';
import ErrorBoundary from './components/ErrorBoundary';
import PageTabs from './components/PageTabs';
import DashboardSwitcher from './components/DashboardSwitcher';
import ShortcutHelp from './components/ShortcutHelp';
import ContextMenu from './components/ContextMenu';
import Minimap from './components/Minimap';
import PageSidebar from './components/PageSidebar';
import WelcomeOverlay from './components/WelcomeOverlay';
import QuickSearch from './components/QuickSearch';
import WidgetPalette from './components/WidgetPalette';
import LicenseSettings from './components/LicenseSettings';
import { useLicenseStore } from './store/licenseStore';
import ConnectionBanner from './components/ConnectionBanner';
import StatusBar from './components/StatusBar';
import ToastContainer from './components/ToastContainer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTouchOptimization } from './hooks/useTouchOptimization';
import { useAutoHideToolbar } from './hooks/useAutoHideToolbar';
import { useSwipeNavigation } from './hooks/useSwipeNavigation';

export default function App() {
  const { load, loading, error } = useDashboardStore();
  const mode = useDashboardStore((s) => s.mode);
  const selectedWidgetId = useDashboardStore((s) => s.selectedWidgetId);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('ha-dash-welcomed'));
  const [showLicense, setShowLicense] = useState(false);
  const fetchLicenseStatus = useLicenseStore((s) => s.fetchStatus);

  useKeyboardShortcuts();
  useTouchOptimization();
  const { toolbarVisible } = useAutoHideToolbar(mode);
  useSwipeNavigation();

  // '?' opens keyboard shortcut help
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === '?') setShowShortcuts((v) => !v);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    wsManager.connect();
    return () => wsManager.disconnect();
  }, []);

  useEffect(() => {
    load();
    fetchLicenseStatus();
  }, [load, fetchLicenseStatus]);

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
        <ConnectionBanner />
        <div style={{
          transition: 'opacity 0.3s ease, max-height 0.3s ease',
          maxHeight: toolbarVisible ? '200px' : '0px',
          opacity: toolbarVisible ? 1 : 0,
          overflow: toolbarVisible ? 'visible' : 'hidden',
          position: 'relative',
          zIndex: 40,
        }}>
          <Toolbar onDashboardClick={() => setShowSwitcher(true)} onLicenseClick={() => setShowLicense(true)} />
          <PageTabs />
        </div>
        <div className="flex flex-1 overflow-hidden">
          <WidgetPalette />
          <Canvas />
          {mode === 'edit' && selectedWidgetId && <WidgetConfigPanel />}
        </div>
        <StatusBar />
        {showSwitcher && <DashboardSwitcher onClose={() => setShowSwitcher(false)} />}
        <ShortcutHelp open={showShortcuts} onClose={() => setShowShortcuts(false)} />
        <ContextMenu />
        <Minimap />
        <PageSidebar />
        <QuickSearch />
        {showWelcome && (
          <WelcomeOverlay onDismiss={() => { setShowWelcome(false); localStorage.setItem('ha-dash-welcomed', '1'); }} />
        )}
        <LicenseSettings open={showLicense} onClose={() => setShowLicense(false)} />
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}

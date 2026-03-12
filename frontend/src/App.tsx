import { useEffect } from 'react';
import { useDashboardStore } from './store/dashboardStore';
import { wsManager } from './api/websocket';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';

export default function App() {
  const { load, loading, error } = useDashboardStore();

  // Initialize WebSocket connection to HA
  useEffect(() => {
    wsManager.connect();
    return () => wsManager.disconnect();
  }, []);

  // Load dashboard
  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-900 text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-900 text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Toolbar />
      <Canvas />
    </div>
  );
}

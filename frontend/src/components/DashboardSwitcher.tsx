import { useState, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { listDashboards, deleteDashboard, createDashboard } from '../api/client';
import Icon from '@mdi/react';
import { mdiViewDashboard, mdiPlus, mdiDelete, mdiClose } from '@mdi/js';
import { generateId } from '../utils/id';

interface DashInfo {
  id: string;
  name: string;
}

export default function DashboardSwitcher({ onClose }: { onClose: () => void }) {
  const { load, dashboard } = useDashboardStore();
  const [dashboards, setDashboards] = useState<DashInfo[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const list = await listDashboards();
      setDashboards(list);
    } catch (e) {
      console.error('[DashboardSwitcher] Failed to list:', e);
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const id = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || generateId();
    try {
      await createDashboard(id, newName.trim());
      await load(id);
      onClose();
    } catch (e) {
      console.error('[DashboardSwitcher] Failed to create:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === 'default') return; // Don't delete default
    try {
      await deleteDashboard(id);
      await refresh();
      if (dashboard?.id === id) await load('default');
    } catch (e) {
      console.error('[DashboardSwitcher] Failed to delete:', e);
    }
  };

  const handleSwitch = async (id: string) => {
    await load(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div
        className="w-96 max-h-[80vh] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border-primary)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
          <div className="flex items-center gap-2">
            <Icon path={mdiViewDashboard} size={0.8} color="var(--color-accent)" />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Dashboards</h2>
          </div>
          <button onClick={onClose} className="hover:opacity-80" style={{ color: 'var(--color-text-secondary)' }}>
            <Icon path={mdiClose} size={0.8} />
          </button>
        </div>

        {/* Dashboard list */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="text-sm text-center py-4" style={{ color: 'var(--color-text-tertiary)' }}>Loading...</div>
          ) : (
            dashboards.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer group"
                style={{
                  background: d.id === dashboard?.id ? 'var(--color-accent-muted)' : 'transparent',
                }}
                onClick={() => handleSwitch(d.id)}
                onMouseEnter={(e) => { if (d.id !== dashboard?.id) e.currentTarget.style.background = 'var(--color-surface-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = d.id === dashboard?.id ? 'var(--color-accent-muted)' : 'transparent'; }}
              >
                <div>
                  <div className="text-sm font-medium" style={{ color: d.id === dashboard?.id ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                    {d.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{d.id}</div>
                </div>
                {d.id !== 'default' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20"
                  >
                    <Icon path={mdiDelete} size={0.6} color="var(--color-error)" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Create new */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--color-border-primary)' }}>
          {creating ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
                placeholder="Dashboard name..."
                autoFocus
                className="flex-1 px-3 py-2 text-sm rounded-lg outline-none"
                style={{
                  background: 'var(--color-surface-tertiary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-focus)',
                }}
              />
              <button onClick={handleCreate}
                className="px-3 py-2 text-sm rounded-lg"
                style={{ background: 'var(--color-accent)', color: 'white' }}>
                Create
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors"
              style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface-tertiary)' }}
            >
              <Icon path={mdiPlus} size={0.7} />
              New Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

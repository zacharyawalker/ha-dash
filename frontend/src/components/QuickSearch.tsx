import { useState, useEffect, useRef, useMemo } from 'react';
import { useEntityStore } from '../store/entityStore';
import { useDashboardStore } from '../store/dashboardStore';
import Icon from '@mdi/react';
import { mdiMagnify, mdiClose, mdiPlus } from '@mdi/js';
import { getEntityIcon } from '../utils/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { widgetDefinitions } from './widgets/WidgetRegistry';

/**
 * Quick search overlay — Ctrl+K to open.
 * Search across all HA entities, click to add as widget.
 */
export default function QuickSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const entities = useEntityStore((s) => s.entities);
  const addWidget = useDashboardStore((s) => s.addWidget);
  const mode = useDashboardStore((s) => s.mode);

  // Ctrl+K to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery('');
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return Object.entries(entities)
      .filter(([id, e]) =>
        id.toLowerCase().includes(q) ||
        (e.attributes?.friendly_name as string || '').toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [query, entities]);

  const getWidgetType = (domain: string): string => {
    const map: Record<string, string> = {
      light: 'light-toggle',
      switch: 'switch-toggle',
      sensor: 'sensor-display',
      binary_sensor: 'binary-sensor',
      climate: 'climate-card',
      fan: 'fan-control',
      cover: 'cover-control',
      lock: 'lock-control',
      media_player: 'media-player',
      camera: 'camera-feed',
      vacuum: 'vacuum-control',
      input_number: 'number-input',
      input_select: 'input-select',
      input_boolean: 'switch-toggle',
      timer: 'timer-widget',
      person: 'person-tracker',
      automation: 'automation-toggle',
      scene: 'scene-button',
      script: 'script-button',
    };
    return map[domain] || 'entity-status';
  };

  const addEntityWidget = (entityId: string) => {
    const domain = entityId.split('.')[0];
    const entity = entities[entityId];
    const friendlyName = entity?.attributes?.friendly_name as string || '';

    if (mode !== 'edit') {
      useDashboardStore.getState().setMode('edit');
    }

    const def = widgetDefinitions.find((d) => d.type === getWidgetType(domain));
    addWidget({
      id: crypto.randomUUID(),
      type: getWidgetType(domain),
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: def?.defaultWidth || 200,
      height: def?.defaultHeight || 200,
      config: { entityId, label: friendlyName },
    });
    setOpen(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-24"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.95, y: -10 }}
          animate={{ scale: 1, y: 0 }}
          className="w-[500px] max-h-[60vh] rounded-xl shadow-2xl overflow-hidden flex flex-col"
          style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border-primary)' }}
        >
          {/* Search input */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
            <Icon path={mdiMagnify} size={0.7} color="var(--color-text-tertiary)" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entities... (lights, sensors, climate)"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--color-text-primary)' }}
            />
            <button onClick={() => setOpen(false)}>
              <Icon path={mdiClose} size={0.6} color="var(--color-text-tertiary)" />
            </button>
          </div>

          {/* Results */}
          <div className="overflow-y-auto flex-1">
            {query && results.length === 0 && (
              <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                No entities found
              </div>
            )}
            {!query && (
              <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                Type to search {Object.keys(entities).length} entities
              </div>
            )}
            {results.map(([id, entity]) => {
              const domain = id.split('.')[0];
              const name = (entity.attributes?.friendly_name as string) || id;
              const icon = getEntityIcon(domain, entity.attributes?.device_class as string | undefined, entity.state);
              const isOn = ['on', 'open', 'home', 'playing'].includes(entity.state);
              return (
                <button
                  key={id}
                  onClick={() => addEntityWidget(id)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:opacity-80 transition-opacity"
                  style={{ borderBottom: '1px solid var(--color-border-primary)' }}
                >
                  <Icon path={icon} size={0.7} color={isOn ? 'var(--color-accent)' : 'var(--color-text-tertiary)'} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>{id}</div>
                  </div>
                  <span className="text-xs capitalize px-1.5 py-0.5 rounded" style={{
                    background: isOn ? 'var(--color-accent-muted)' : 'var(--color-surface-tertiary)',
                    color: isOn ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                  }}>
                    {entity.state}
                  </span>
                  <Icon path={mdiPlus} size={0.5} color="var(--color-text-tertiary)" />
                </button>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 text-xs" style={{ color: 'var(--color-text-tertiary)', borderTop: '1px solid var(--color-border-primary)' }}>
            Click an entity to add as widget • ESC to close
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

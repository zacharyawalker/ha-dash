import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiChevronUp, mdiMagnify } from '@mdi/js';
import { widgetDefinitions } from './widgets/WidgetRegistry';
import { useDashboardStore } from '../store/dashboardStore';

const CATEGORIES = [
  { key: 'control', label: 'Control', color: '#4a9eff' },
  { key: 'climate', label: 'Climate', color: '#ef4444' },
  { key: 'display', label: 'Display', color: '#22c55e' },
  { key: 'layout', label: 'Layout', color: '#f59e0b' },
  { key: 'media', label: 'Media', color: '#a855f7' },
];

/**
 * Left-side widget palette in edit mode.
 * Shows all widget types organized by category.
 * Click to add to canvas.
 */
export default function WidgetPalette() {
  const mode = useDashboardStore((s) => s.mode);
  const addWidget = useDashboardStore((s) => s.addWidget);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ control: true, display: true });
  const [search, setSearch] = useState('');

  if (mode !== 'edit') return null;

  const filtered = search
    ? widgetDefinitions.filter((d) =>
        d.label.toLowerCase().includes(search.toLowerCase()) ||
        d.category?.toLowerCase().includes(search.toLowerCase())
      )
    : widgetDefinitions;

  const handleAdd = (type: string) => {
    const def = widgetDefinitions.find((d) => d.type === type);
    addWidget({
      id: crypto.randomUUID(),
      type,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 300,
      width: def?.defaultWidth || 200,
      height: def?.defaultHeight || 200,
      config: { ...def?.defaultConfig },
    });
  };

  return (
    <div
      className="h-full w-52 flex flex-col overflow-hidden shrink-0"
      style={{
        background: 'var(--color-surface-primary)',
        borderRight: '1px solid var(--color-border-primary)',
      }}
    >
      {/* Search */}
      <div className="p-2">
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{
          background: 'var(--color-surface-tertiary)',
          border: '1px solid var(--color-border-primary)',
        }}>
          <Icon path={mdiMagnify} size={0.5} color="var(--color-text-tertiary)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search widgets..."
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {CATEGORIES.map(({ key, label, color }) => {
          const items = filtered.filter((d) => d.category === key);
          if (items.length === 0) return null;
          const isExpanded = search || expanded[key];

          return (
            <div key={key}>
              <button
                onClick={() => setExpanded((p) => ({ ...p, [key]: !p[key] }))}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold rounded"
                style={{ color }}
              >
                {label} ({items.length})
                <Icon path={isExpanded ? mdiChevronUp : mdiChevronDown} size={0.5} color="var(--color-text-tertiary)" />
              </button>
              {isExpanded && (
                <div className="space-y-0.5 ml-1">
                  {items.map((def) => (
                    <button
                      key={def.type}
                      onClick={() => handleAdd(def.type)}
                      className="flex items-center gap-1.5 w-full px-2 py-1 text-xs rounded hover:opacity-80 transition-opacity text-left"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                      {def.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

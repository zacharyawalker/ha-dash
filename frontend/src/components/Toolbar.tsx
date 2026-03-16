import { useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { useEntityStore } from '../store/entityStore';
import { widgetDefinitions, WIDGET_DOMAINS } from './widgets/WidgetRegistry';
import { useHaEntities } from '../hooks/useHaEntities';
import Icon from '@mdi/react';
import {
  mdiPencil,
  mdiEye,
  mdiPlus,
  mdiContentSave,
  mdiCircle,
  mdiUndo,
  mdiRedo,
  mdiGrid,
  mdiViewGrid,
  mdiWeatherNight,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiWeatherSunny,
} from '@mdi/js';
import { generateId } from '../utils/id';
import { WIDGET_TEMPLATES, instantiateTemplate } from '../utils/widgetTemplates';

/** Connection status indicator */
function ConnectionBadge() {
  const connectionStatus = useEntityStore((s) => s.connectionStatus);
  const haConnected = useEntityStore((s) => s.haConnected);

  const color =
    connectionStatus === 'connected' && haConnected
      ? 'var(--color-success)'
      : connectionStatus === 'connecting'
        ? 'var(--color-warning)'
        : 'var(--color-error)';

  const label =
    connectionStatus === 'connected' && haConnected
      ? 'Connected'
      : connectionStatus === 'connecting'
        ? 'Connecting...'
        : 'Disconnected';

  return (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }} title={label}>
      <Icon path={mdiCircle} size={0.35} color={color} />
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

export default function Toolbar({ onDashboardClick, onLicenseClick }: { onDashboardClick?: () => void; onLicenseClick?: () => void } = {}) {
  const { mode, setMode, addWidget, save, dashboard, undo, redo, canUndo, canRedo, gridEnabled, setGridEnabled, autoArrange, theme, setTheme, activePage } = useDashboardStore();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addStep, setAddStep] = useState<'type' | 'entity' | 'templates' | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const domain = selectedType ? WIDGET_DOMAINS[selectedType] : undefined;
  const { entities } = useHaEntities(domain);

  /** Check if a widget type requires an entity */
  const needsEntity = (type: string): boolean => {
    const def = widgetDefinitions.find((d) => d.type === type);
    return def?.configFields.some((f) => f.key === 'entityId') ?? false;
  };

  const handleAddWidget = (entityId?: string, friendlyName?: string) => {
    const def = widgetDefinitions.find((d) => d.type === selectedType);
    if (!def) return;

    const widget = {
      id: generateId(),
      type: def.type,
      x: 50 + Math.random() * 200,
      y: 50 + Math.random() * 200,
      width: def.defaultWidth,
      height: def.defaultHeight,
      config: {
        ...def.defaultConfig,
        ...(entityId ? { entityId, label: friendlyName || '' } : {}),
      },
    };
    addWidget(widget);
    setShowAddMenu(false);
    setAddStep(null);
    setSelectedType(null);
    setSearch('');
  };

  const filteredEntities = entities.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = (e.attributes.friendly_name as string || '').toLowerCase();
    return name.includes(q) || e.entity_id.toLowerCase().includes(q);
  });

  return (
    <div
      className="flex items-center justify-between px-4 py-2"
      style={{ background: 'var(--color-surface-primary)', borderBottom: '1px solid var(--color-border-primary)', overflow: 'visible', position: 'relative', zIndex: 50 }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onDashboardClick}
          className="text-lg font-semibold mr-2 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
          title="Switch dashboard"
        >
          {dashboard?.name || 'HA Dash'}
        </button>

        <ConnectionBadge />

        {mode === 'edit' && (
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-tertiary)', color: 'var(--color-text-tertiary)' }}>
            {(dashboard?.pages?.[activePage]?.widgets || []).length} widgets
          </span>
        )}

        {mode === 'edit' && (
          <>
            <div className="relative">
              <button
                onClick={() => {
                  setShowAddMenu(!showAddMenu);
                  setAddStep('type');
                  setCategoryFilter(null);
                  setSearch('');
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ background: 'var(--color-accent)', color: 'white' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <Icon path={mdiPlus} size={0.7} />
                Add Widget
              </button>

              {showAddMenu && (
                <div
                  className="absolute top-full left-0 mt-1 w-64 rounded-lg shadow-xl max-h-[70vh] overflow-y-auto"
                  style={{ zIndex: 9999, background: 'var(--color-surface-tertiary)', border: '1px solid var(--color-border-secondary)' }}
                >
                  {(addStep === 'type' || addStep === 'templates') && (
                    <div className="flex gap-1 px-3 py-1.5" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
                      <button
                        onClick={() => setAddStep('type')}
                        className="flex-1 text-xs py-1 rounded"
                        style={{
                          background: addStep === 'type' ? 'var(--color-accent-muted)' : 'transparent',
                          color: addStep === 'type' ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                        }}
                      >
                        Widgets
                      </button>
                      <button
                        onClick={() => setAddStep('templates')}
                        className="flex-1 text-xs py-1 rounded"
                        style={{
                          background: addStep === 'templates' ? 'var(--color-accent-muted)' : 'transparent',
                          color: addStep === 'templates' ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                        }}
                      >
                        Templates
                      </button>
                    </div>
                  )}

                  {addStep === 'templates' && (
                    <div className="max-h-[60vh] overflow-y-auto" data-scrollable>
                      {WIDGET_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.name}
                          onClick={() => {
                            const widgets = instantiateTemplate(tpl);
                            widgets.forEach((w) => addWidget(w));
                            setShowAddMenu(false);
                            setAddStep(null);
                          }}
                          className="w-full text-left px-4 py-3 transition-colors"
                          style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border-primary)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <span className="text-sm font-medium block">{tpl.name}</span>
                          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{tpl.description}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {addStep === 'type' && (
                    <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search widgets..."
                        autoFocus
                        className="w-full px-3 py-1.5 text-sm rounded-lg outline-none"
                        style={{ background: 'var(--color-surface-tertiary)', color: 'var(--color-text-primary)' }}
                      />
                    </div>
                  )}

                  {addStep === 'type' && !search && (
                    <div className="flex gap-1 px-3 py-1.5 flex-wrap" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
                      {[null, 'control', 'climate', 'display', 'layout'].map((cat) => (
                        <button
                          key={cat || 'all'}
                          onClick={() => setCategoryFilter(cat)}
                          className="px-2 py-0.5 text-xs rounded-full transition-colors"
                          style={{
                            background: categoryFilter === cat ? 'var(--color-accent-muted)' : 'var(--color-surface-tertiary)',
                            color: categoryFilter === cat ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                          }}
                        >
                          {cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'All'}
                        </button>
                      ))}
                    </div>
                  )}

                  {addStep === 'type' &&
                    widgetDefinitions
                    .filter((def) => {
                      if (search) return def.label.toLowerCase().includes(search.toLowerCase()) || def.category?.toLowerCase().includes(search.toLowerCase());
                      if (categoryFilter) return def.category === categoryFilter;
                      return true;
                    })
                    .map((def) => (
                      <button
                        key={def.type}
                        onClick={() => {
                          if (!needsEntity(def.type)) {
                            setSelectedType(def.type);
                            // Directly add — no entity selection needed
                            setTimeout(() => {
                              const widget = {
                                id: generateId(),
                                type: def.type,
                                x: 50 + Math.random() * 200,
                                y: 50 + Math.random() * 200,
                                width: def.defaultWidth,
                                height: def.defaultHeight,
                                config: { ...def.defaultConfig },
                              };
                              addWidget(widget);
                              setShowAddMenu(false);
                              setAddStep(null);
                              setSelectedType(null);
                            }, 0);
                            return;
                          }
                          setSelectedType(def.type);
                          setAddStep('entity');
                        }}
                        className="w-full text-left px-4 py-2 text-sm transition-colors"
                        style={{ color: 'var(--color-text-primary)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {def.label}
                      </button>
                    ))}

                  {addStep === 'entity' && (
                    <>
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border-primary)' }}>
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search entities..."
                          autoFocus
                          className="w-full px-2 py-1.5 text-sm rounded outline-none"
                          style={{
                            background: 'var(--color-surface-secondary)',
                            color: 'var(--color-text-primary)',
                            border: '1px solid var(--color-border-primary)',
                          }}
                        />
                      </div>
                      {filteredEntities.map((e) => (
                        <button
                          key={e.entity_id}
                          onClick={() =>
                            handleAddWidget(e.entity_id, e.attributes.friendly_name as string)
                          }
                          className="w-full text-left px-4 py-2 text-sm transition-colors"
                          style={{ color: 'var(--color-text-primary)' }}
                          onMouseEnter={(ev) => (ev.currentTarget.style.background = 'var(--color-surface-hover)')}
                          onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                        >
                          <div>{e.attributes.friendly_name as string || e.entity_id}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{e.entity_id}</div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => save()}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors"
              style={{ background: 'var(--color-success)', color: 'white' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <Icon path={mdiContentSave} size={0.7} />
              Save
            </button>

            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5 ml-1">
              <button
                onClick={undo}
                disabled={!canUndo()}
                className="p-1.5 rounded-lg transition-colors"
                style={{
                  color: canUndo() ? 'var(--color-text-primary)' : 'var(--color-text-disabled)',
                  background: 'var(--color-surface-tertiary)',
                }}
                title="Undo (Ctrl+Z)"
              >
                <Icon path={mdiUndo} size={0.7} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo()}
                className="p-1.5 rounded-lg transition-colors"
                style={{
                  color: canRedo() ? 'var(--color-text-primary)' : 'var(--color-text-disabled)',
                  background: 'var(--color-surface-tertiary)',
                }}
                title="Redo (Ctrl+Y)"
              >
                <Icon path={mdiRedo} size={0.7} />
              </button>
            </div>

            {/* Grid toggle */}
            <button
              onClick={() => setGridEnabled(!gridEnabled)}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                color: gridEnabled ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                background: gridEnabled ? 'var(--color-accent-muted)' : 'var(--color-surface-tertiary)',
              }}
              title={`Grid snap: ${gridEnabled ? 'ON' : 'OFF'} (Ctrl+G)`}
            >
              <Icon path={mdiGrid} size={0.7} />
            </button>

            {/* Auto-arrange */}
            <button
              onClick={autoArrange}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--color-text-tertiary)', background: 'var(--color-surface-tertiary)' }}
              title="Auto-arrange widgets"
            >
              <Icon path={mdiViewGrid} size={0.7} />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* License/tier badge */}
        {onLicenseClick && (
          <button
            onClick={onLicenseClick}
            className="px-2 py-1 text-xs font-semibold rounded-lg transition-colors"
            style={{ background: '#f59e0b15', color: '#f59e0b', border: '1px solid #f59e0b30' }}
            title="License settings"
          >
            ★ Pro
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-lg transition-colors"
          style={{
            color: 'var(--color-text-secondary)',
            background: 'var(--color-surface-tertiary)',
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <Icon path={theme === 'dark' ? mdiWeatherSunny : mdiWeatherNight} size={0.7} />
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              document.documentElement.requestFullscreen();
            }
          }}
          className="p-1.5 rounded-lg transition-colors"
          style={{
            color: 'var(--color-text-secondary)',
            background: 'var(--color-surface-tertiary)',
          }}
          title="Toggle fullscreen"
        >
          <Icon path={document.fullscreenElement ? mdiFullscreenExit : mdiFullscreen} size={0.7} />
        </button>

        <button
          onClick={() => setMode(mode === 'edit' ? 'view' : 'edit')}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors"
          style={{ background: 'var(--color-surface-tertiary)', color: 'var(--color-text-primary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-surface-tertiary)')}
        >
          <Icon path={mode === 'edit' ? mdiEye : mdiPencil} size={0.7} />
          {mode === 'edit' ? 'View' : 'Edit'}
        </button>
      </div>
    </div>
  );
}

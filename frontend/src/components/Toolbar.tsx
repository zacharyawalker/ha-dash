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
} from '@mdi/js';
import { generateId } from '../utils/id';

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

export default function Toolbar() {
  const { mode, setMode, addWidget, save, dashboard } = useDashboardStore();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addStep, setAddStep] = useState<'type' | 'entity' | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [search, setSearch] = useState('');

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
      style={{ background: 'var(--color-surface-primary)', borderBottom: '1px solid var(--color-border-primary)' }}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold mr-2" style={{ color: 'var(--color-text-primary)' }}>
          {dashboard?.name || 'HA Dash'}
        </h1>

        <ConnectionBadge />

        {mode === 'edit' && (
          <>
            <div className="relative">
              <button
                onClick={() => {
                  setShowAddMenu(!showAddMenu);
                  setAddStep('type');
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
                  className="absolute top-full left-0 mt-1 w-64 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
                  style={{ background: 'var(--color-surface-tertiary)', border: '1px solid var(--color-border-secondary)' }}
                >
                  {addStep === 'type' &&
                    widgetDefinitions.map((def) => (
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
          </>
        )}
      </div>

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
  );
}

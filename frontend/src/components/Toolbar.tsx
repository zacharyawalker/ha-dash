import { useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { useEntityStore } from '../store/entityStore';
import { widgetDefinitions } from './widgets/WidgetRegistry';
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

/** Domain filter per widget type */
const WIDGET_DOMAINS: Record<string, string | undefined> = {
  'light-toggle': 'light',
  'sensor-display': 'sensor',
  'climate-card': 'climate',
  'scene-button': 'scene',
};

/** Connection status indicator */
function ConnectionBadge() {
  const connectionStatus = useEntityStore((s) => s.connectionStatus);
  const haConnected = useEntityStore((s) => s.haConnected);

  const color =
    connectionStatus === 'connected' && haConnected
      ? '#22c55e'
      : connectionStatus === 'connecting'
        ? '#eab308'
        : '#ef4444';

  const label =
    connectionStatus === 'connected' && haConnected
      ? 'Connected'
      : connectionStatus === 'connecting'
        ? 'Connecting...'
        : 'Disconnected';

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-400" title={label}>
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

  // Get entities from shared store (no polling)
  const domain = selectedType ? WIDGET_DOMAINS[selectedType] : undefined;
  const { entities } = useHaEntities(domain);

  const handleAddWidget = (entityId: string, friendlyName?: string) => {
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
        entityId,
        label: friendlyName || '',
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
    <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-white mr-2">
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
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                <Icon path={mdiPlus} size={0.7} />
                Add Widget
              </button>

              {showAddMenu && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 z-50 max-h-80 overflow-y-auto">
                  {addStep === 'type' &&
                    widgetDefinitions.map((def) => (
                      <button
                        key={def.type}
                        onClick={() => {
                          setSelectedType(def.type);
                          setAddStep('entity');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-neutral-700 transition-colors"
                      >
                        {def.label}
                      </button>
                    ))}

                  {addStep === 'entity' && (
                    <>
                      <div className="px-3 py-2 border-b border-neutral-700">
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search entities..."
                          autoFocus
                          className="w-full px-2 py-1.5 text-sm bg-neutral-700 text-white rounded border border-neutral-600 placeholder-gray-400 outline-none focus:border-blue-500"
                        />
                      </div>
                      {filteredEntities.map((e) => (
                        <button
                          key={e.entity_id}
                          onClick={() =>
                            handleAddWidget(
                              e.entity_id,
                              e.attributes.friendly_name as string
                            )
                          }
                          className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-neutral-700 transition-colors"
                        >
                          <div>{e.attributes.friendly_name as string || e.entity_id}</div>
                          <div className="text-xs text-gray-500">{e.entity_id}</div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => save()}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
            >
              <Icon path={mdiContentSave} size={0.7} />
              Save
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => setMode(mode === 'edit' ? 'view' : 'edit')}
        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
      >
        <Icon path={mode === 'edit' ? mdiEye : mdiPencil} size={0.7} />
        {mode === 'edit' ? 'View' : 'Edit'}
      </button>
    </div>
  );
}

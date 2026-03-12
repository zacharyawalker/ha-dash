import { useState, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { widgetDefinitions } from './widgets/WidgetRegistry';
import EntityPicker from './EntityPicker';
import Icon from '@mdi/react';
import { mdiClose, mdiDelete, mdiContentSave } from '@mdi/js';
import type { WidgetConfig } from '../types/dashboard';

/** Widget-type-specific config fields */
interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'entity';
  domain?: string;
  placeholder?: string;
}

const WIDGET_CONFIG_FIELDS: Record<string, ConfigField[]> = {
  'light-toggle': [
    { key: 'entityId', label: 'Entity', type: 'entity', domain: 'light' },
    { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
  ],
  'sensor-display': [
    { key: 'entityId', label: 'Entity', type: 'entity', domain: 'sensor' },
    { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
    { key: 'unit', label: 'Unit Override', type: 'text', placeholder: 'Auto from entity' },
  ],
  'climate-card': [
    { key: 'entityId', label: 'Entity', type: 'entity', domain: 'climate' },
    { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
  ],
  'scene-button': [
    { key: 'entityId', label: 'Entity', type: 'entity', domain: 'scene' },
    { key: 'label', label: 'Label', type: 'text', placeholder: 'Auto from entity name' },
  ],
};

/** Default config fields for unknown widget types */
const DEFAULT_CONFIG_FIELDS: ConfigField[] = [
  { key: 'entityId', label: 'Entity', type: 'entity' },
  { key: 'label', label: 'Label', type: 'text', placeholder: 'Widget label' },
];

export default function WidgetConfigPanel() {
  const { dashboard, selectedWidgetId, selectWidget, updateWidget, removeWidget } =
    useDashboardStore();

  const widget = dashboard?.widgets.find((w) => w.id === selectedWidgetId);

  // Local config state for editing
  const [localConfig, setLocalConfig] = useState<WidgetConfig>({});
  const [isDirty, setIsDirty] = useState(false);

  // Sync local state when selected widget changes
  useEffect(() => {
    if (widget) {
      setLocalConfig({ ...widget.config });
      setIsDirty(false);
    }
  }, [widget?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!widget) return null;

  const widgetDef = widgetDefinitions.find((d) => d.type === widget.type);
  const configFields = WIDGET_CONFIG_FIELDS[widget.type] || DEFAULT_CONFIG_FIELDS;

  const handleChange = (key: string, value: string) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    updateWidget(widget.id, { config: { ...localConfig } });
    setIsDirty(false);
  };

  const handleDelete = () => {
    removeWidget(widget.id);
    selectWidget(null);
  };

  return (
    <div className="w-72 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <h2 className="text-sm font-semibold text-white">
          {widgetDef?.label || widget.type}
        </h2>
        <button
          onClick={() => selectWidget(null)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Icon path={mdiClose} size={0.8} />
        </button>
      </div>

      {/* Config fields */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {configFields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              {field.label}
            </label>

            {field.type === 'entity' ? (
              <EntityPicker
                value={(localConfig[field.key] as string) || ''}
                onChange={(v) => handleChange(field.key, v)}
                domain={field.domain}
                placeholder={field.placeholder || `Select ${field.domain || 'entity'}...`}
              />
            ) : field.type === 'number' ? (
              <input
                type="number"
                value={(localConfig[field.key] as number) ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 text-sm bg-neutral-700 text-white rounded-lg border border-neutral-600 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
              />
            ) : (
              <input
                type="text"
                value={(localConfig[field.key] as string) || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 text-sm bg-neutral-700 text-white rounded-lg border border-neutral-600 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
              />
            )}
          </div>
        ))}

        {/* Position & size (read-only info) */}
        <div className="pt-2 border-t border-neutral-800">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Position & Size
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div>X: {Math.round(widget.x)}</div>
            <div>Y: {Math.round(widget.y)}</div>
            <div>W: {widget.width}</div>
            <div>H: {widget.height}</div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-4 py-3 border-t border-neutral-800 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
            isDirty
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-neutral-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Icon path={mdiContentSave} size={0.7} />
          Apply
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
        >
          <Icon path={mdiDelete} size={0.7} />
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { getWidgetDefinition } from './widgets/WidgetRegistry';
import EntityPicker from './EntityPicker';
import Icon from '@mdi/react';
import { mdiClose, mdiDelete, mdiContentSave } from '@mdi/js';
import type { WidgetConfig } from '../types/dashboard';
import type { ConfigField } from '../types/widget';

/**
 * Dynamic config field renderer.
 * Renders the appropriate input component based on field type.
 */
function ConfigFieldInput({
  field,
  value,
  onChange,
}: {
  field: ConfigField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case 'entity':
      return (
        <EntityPicker
          value={(value as string) || ''}
          onChange={(v) => onChange(v)}
          domain={field.domain}
          placeholder={field.placeholder || `Select ${field.domain || 'entity'}...`}
        />
      );

    case 'number':
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            min={field.min}
            max={field.max}
            step={field.step}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 text-sm bg-neutral-700 text-white rounded-lg border border-neutral-600 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
          />
          {field.unit && (
            <span className="text-xs text-gray-500 shrink-0">{field.unit}</span>
          )}
        </div>
      );

    case 'select':
      return (
        <select
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-neutral-700 text-white rounded-lg border border-neutral-600 outline-none focus:border-blue-500 transition-colors cursor-pointer"
        >
          <option value="" className="bg-neutral-800">
            {field.placeholder || 'Select...'}
          </option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-neutral-800">
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'toggle':
      return (
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            value ? 'bg-blue-600' : 'bg-neutral-600'
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              value ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      );

    case 'color':
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={(value as string) || '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded border border-neutral-600 cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#ffffff"
            className="flex-1 px-3 py-2 text-sm bg-neutral-700 text-white rounded-lg border border-neutral-600 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors font-mono"
          />
        </div>
      );

    case 'text':
    default:
      return (
        <input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2 text-sm bg-neutral-700 text-white rounded-lg border border-neutral-600 placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
        />
      );
  }
}

/**
 * Widget configuration panel.
 * Renders config fields dynamically based on the widget definition.
 * Adding a new widget type with configFields = automatically gets a config UI.
 */
export default function WidgetConfigPanel() {
  const { dashboard, selectedWidgetId, selectWidget, updateWidget, removeWidget } =
    useDashboardStore();

  const widget = dashboard?.widgets.find((w) => w.id === selectedWidgetId);
  const widgetDef = widget ? getWidgetDefinition(widget.type) : undefined;
  const configFields = widgetDef?.configFields ?? [];

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

  if (!widget || !widgetDef) return null;

  const handleChange = (key: string, value: unknown) => {
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

  /** Check if a field should be visible based on showWhen condition */
  const isFieldVisible = (field: ConfigField): boolean => {
    if (!field.showWhen) return true;
    const { field: depField, value: depValue, notEmpty } = field.showWhen;
    const currentValue = localConfig[depField];
    if (notEmpty) return currentValue != null && currentValue !== '';
    return currentValue === depValue;
  };

  return (
    <div className="w-72 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <div>
          <h2 className="text-sm font-semibold text-white">
            {widgetDef.label}
          </h2>
          {widgetDef.category && (
            <span className="text-xs text-gray-500 capitalize">{widgetDef.category}</span>
          )}
        </div>
        <button
          onClick={() => selectWidget(null)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Icon path={mdiClose} size={0.8} />
        </button>
      </div>

      {/* Config fields — rendered dynamically from widget definition */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {configFields.filter(isFieldVisible).map((field) => (
          <div key={field.key}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-400">
                {field.label}
                {field.required && <span className="text-red-400 ml-0.5">*</span>}
              </label>
            </div>
            <ConfigFieldInput
              field={field}
              value={localConfig[field.key]}
              onChange={(v) => handleChange(field.key, v)}
            />
            {field.helpText && (
              <p className="mt-1 text-xs text-gray-600">{field.helpText}</p>
            )}
          </div>
        ))}

        {/* Position & size (always shown) */}
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

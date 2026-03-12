import { useState, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { getWidgetDefinition } from './widgets/WidgetRegistry';
import EntityPicker from './EntityPicker';
import Icon from '@mdi/react';
import { mdiClose, mdiDelete, mdiContentSave, mdiAlertCircleOutline } from '@mdi/js';
import type { WidgetConfig } from '../types/dashboard';
import type { ConfigField } from '../types/widget';

/** Shared input styles using theme tokens */
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  fontSize: '0.875rem',
  background: 'var(--color-surface-tertiary)',
  color: 'var(--color-text-primary)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border-primary)',
  outline: 'none',
};

/**
 * Dynamic config field renderer.
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
          domain={field.domains || field.domain}
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
            style={inputStyle}
          />
          {field.unit && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>{field.unit}</span>
          )}
        </div>
      );

    case 'select':
      return (
        <select
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="" style={{ background: 'var(--color-surface-primary)' }}>
            {field.placeholder || 'Select...'}
          </option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: 'var(--color-surface-primary)' }}>
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
          className="relative w-10 h-5 rounded-full transition-colors"
          style={{ background: value ? 'var(--color-accent)' : 'var(--color-surface-tertiary)' }}
        >
          <div
            className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
            style={{
              background: 'white',
              transform: value ? 'translateX(20px)' : 'translateX(2px)',
            }}
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
            className="w-8 h-8 rounded cursor-pointer"
            style={{ border: '1px solid var(--color-border-primary)', background: 'transparent' }}
          />
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#ffffff"
            style={{ ...inputStyle, fontFamily: 'monospace' }}
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
          style={inputStyle}
        />
      );
  }
}

/**
 * Widget configuration panel.
 * Renders config fields dynamically based on the widget definition.
 */
export default function WidgetConfigPanel() {
  const { dashboard, selectedWidgetId, selectWidget, updateWidget, removeWidget } =
    useDashboardStore();

  const widget = dashboard?.widgets.find((w) => w.id === selectedWidgetId);
  const widgetDef = widget ? getWidgetDefinition(widget.type) : undefined;
  const configFields = widgetDef?.configFields ?? [];

  const [localConfig, setLocalConfig] = useState<WidgetConfig>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (widget) {
      setLocalConfig({ ...widget.config });
      setIsDirty(false);
      setShowDeleteConfirm(false);
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
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    removeWidget(widget.id);
    selectWidget(null);
  };

  const isFieldVisible = (field: ConfigField): boolean => {
    if (!field.showWhen) return true;
    const { field: depField, value: depValue, notEmpty } = field.showWhen;
    const currentValue = localConfig[depField];
    if (notEmpty) return currentValue != null && currentValue !== '';
    return currentValue === depValue;
  };

  return (
    <div
      className="w-72 flex flex-col h-full overflow-hidden"
      style={{ background: 'var(--color-surface-primary)', borderLeft: '1px solid var(--color-border-primary)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {widgetDef.label}
          </h2>
          {widgetDef.category && (
            <span className="text-xs capitalize" style={{ color: 'var(--color-text-tertiary)' }}>{widgetDef.category}</span>
          )}
        </div>
        <button
          onClick={() => selectWidget(null)}
          style={{ color: 'var(--color-text-secondary)' }}
          className="hover:opacity-80 transition-opacity"
        >
          <Icon path={mdiClose} size={0.8} />
        </button>
      </div>

      {/* Config fields */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {configFields.filter(isFieldVisible).map((field) => (
          <div key={field.key}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {field.label}
                {field.required && <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span>}
              </label>
            </div>
            <ConfigFieldInput
              field={field}
              value={localConfig[field.key]}
              onChange={(v) => handleChange(field.key, v)}
            />
            {field.helpText && (
              <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{field.helpText}</p>
            )}
          </div>
        ))}

        {/* Position & size */}
        <div className="pt-2" style={{ borderTop: '1px solid var(--color-border-primary)' }}>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Position & Size
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            <div>X: {Math.round(widget.x)}</div>
            <div>Y: {Math.round(widget.y)}</div>
            <div>W: {widget.width}</div>
            <div>H: {widget.height}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--color-border-primary)' }}>
        {showDeleteConfirm ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-error)' }}>
              <Icon path={mdiAlertCircleOutline} size={0.7} />
              <span>Delete this widget?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 px-3 py-2 text-sm rounded-lg transition-colors"
                style={{ background: 'var(--color-error)', color: 'white' }}
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-3 py-2 text-sm rounded-lg transition-colors"
                style={{ background: 'var(--color-surface-tertiary)', color: 'var(--color-text-primary)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors"
              style={{
                background: isDirty ? 'var(--color-accent)' : 'var(--color-surface-tertiary)',
                color: isDirty ? 'white' : 'var(--color-text-disabled)',
                cursor: isDirty ? 'pointer' : 'not-allowed',
              }}
            >
              <Icon path={mdiContentSave} size={0.7} />
              Apply
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors"
              style={{ background: 'var(--color-error-muted)', color: 'var(--color-error)' }}
            >
              <Icon path={mdiDelete} size={0.7} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

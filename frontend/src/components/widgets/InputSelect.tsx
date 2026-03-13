import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiFormSelect } from '../../utils/icons';
import { getIconByName } from '../../utils/haIcons';
import type { WidgetProps } from '../../types/widget';

export default function InputSelect({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const options = (entity?.attributes?.options as string[]) || [];
  const current = entity?.state || '';
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accentColor = config.accentColor as string | undefined;
  const hideLabel = config.hideLabel as boolean;

  const handleChange = async (value: string) => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('input_select', 'select_option', {
        entity_id: config.entityId,
        option: value,
      });
    } catch (e) {
      console.error('[InputSelect] Failed:', e);
    }
  };

  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Select');

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full rounded-card p-3 gap-2"
      style={{ background: 'var(--color-surface-secondary)' }}
    >
      {!hideLabel && (
        <div className="flex items-center gap-1.5">
          <Icon path={customIcon || mdiFormSelect} size={0.7} color={accentColor || 'var(--color-accent)'} />
          <span className="font-medium" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
            {label}
          </span>
        </div>
      )}
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        disabled={mode === 'edit'}
        className="w-full px-3 py-2 text-sm rounded-lg outline-none cursor-pointer"
        style={{
          background: 'var(--color-surface-tertiary)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border-primary)',
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} style={{ background: 'var(--color-surface-primary)' }}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

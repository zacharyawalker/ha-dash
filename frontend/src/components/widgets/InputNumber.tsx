import { useState } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiNumeric } from '../../utils/icons';
import type { WidgetProps } from '../../types/widget';

export default function InputNumber({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const current = parseFloat(entity?.state || '0') || 0;
  const min = (entity?.attributes?.min as number) ?? 0;
  const max = (entity?.attributes?.max as number) ?? 100;
  const step = (entity?.attributes?.step as number) ?? 1;
  const unit = (entity?.attributes?.unit_of_measurement as string) || '';
  const [pending, setPending] = useState<number | null>(null);

  const displayValue = pending ?? current;

  const handleChange = async (value: number) => {
    if (mode === 'edit' || !config.entityId) return;
    setPending(value);
    try {
      await callService('input_number', 'set_value', {
        entity_id: config.entityId,
        value,
      });
    } catch (e) {
      console.error('[InputNumber] Failed:', e);
    }
    setTimeout(() => setPending(null), 2000);
  };

  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Number');
  const accentColor = config.accentColor as string | undefined;
  const hideLabel = config.hideLabel as boolean;
  const accent = accentColor || 'var(--color-accent)';

  return (
    <div
      className="flex flex-col items-center justify-between w-full h-full rounded-card p-3"
      style={{ background: 'var(--color-surface-secondary)' }}
    >
      {!hideLabel && (
        <div className="flex items-center gap-1.5">
          <Icon path={mdiNumeric} size={0.7} color={accent} />
          <span className="font-medium" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
            {label}
          </span>
        </div>
      )}

      <div className="text-center">
        <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {displayValue}
        </span>
        {unit && <span className="ml-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{unit}</span>}
      </div>

      <div className="w-full px-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onChange={(e) => handleChange(Number(e.target.value))}
          disabled={mode === 'edit'}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${accent} 0%, ${accent} ${((displayValue - min) / (max - min)) * 100}%, var(--color-surface-tertiary) ${((displayValue - min) / (max - min)) * 100}%, var(--color-surface-tertiary) 100%)`,
            accentColor: accent,
          }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}

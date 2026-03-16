import { useCallback } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiMinus, mdiPlus, mdiNumeric } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

/**
 * Number input widget — increment/decrement control for input_number entities.
 * Shows current value with +/- buttons and optional slider.
 */
export default function NumberInput({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accentColor = (config.accentColor as string) || 'var(--color-accent)';
  const hideLabel = config.hideLabel as boolean;

  if (!entity) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>
        {config.entityId ? 'Loading...' : 'No entity'}
      </div>
    );
  }

  const value = parseFloat(entity.state) || 0;
  const min = (entity.attributes?.min as number) ?? 0;
  const max = (entity.attributes?.max as number) ?? 100;
  const step = (entity.attributes?.step as number) ?? 1;
  const unit = (entity.attributes?.unit_of_measurement as string) || '';
  const label = String(config.label || entity.attributes?.friendly_name || 'Number');

  const setValue = useCallback(async (newValue: number) => {
    if (mode === 'edit' || !config.entityId) return;
    const clamped = Math.min(max, Math.max(min, newValue));
    try {
      await callService('input_number', 'set_value', {
        entity_id: config.entityId,
        value: clamped,
      });
    } catch (e) {
      console.error('[NumberInput]', e);
    }
  }, [config.entityId, mode, min, max]);

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full rounded-card gap-2 p-3"
      style={{ background: 'var(--color-surface-secondary)' }}>

      <Icon path={customIcon || mdiNumeric} size={1} color={accentColor} />

      {!hideLabel && (
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      )}

      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setValue(value - step)}
          disabled={mode === 'edit' || value <= min}
          className="p-1.5 rounded-full"
          style={{ background: `${accentColor}15`, opacity: value <= min ? 0.3 : 1 }}
        >
          <Icon path={mdiMinus} size={0.6} color={accentColor} />
        </motion.button>

        <span className="text-xl font-bold tabular-nums" style={{ color: 'var(--color-text-primary)', minWidth: '60px', textAlign: 'center' }}>
          {Math.round(value * 100) / 100}{unit && <span className="text-xs ml-0.5 font-normal">{unit}</span>}
        </span>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setValue(value + step)}
          disabled={mode === 'edit' || value >= max}
          className="p-1.5 rounded-full"
          style={{ background: `${accentColor}15`, opacity: value >= max ? 0.3 : 1 }}
        >
          <Icon path={mdiPlus} size={0.6} color={accentColor} />
        </motion.button>
      </div>

      {/* Slider */}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        disabled={mode === 'edit'}
        className="w-full h-1.5 rounded-full appearance-none"
        style={{
          background: `linear-gradient(to right, ${accentColor} ${percent}%, var(--color-surface-tertiary) ${percent}%)`,
        }}
      />

      <div className="flex justify-between w-full text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

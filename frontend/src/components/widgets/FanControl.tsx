import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiFan } from '@mdi/js';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

export default function FanControl({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const isOn = entity?.state === 'on';
  const percentage = (entity?.attributes?.percentage as number) || 0;
  const oscillating = (entity?.attributes?.oscillating as boolean) || false;
  const speedCount = (entity?.attributes?.percentage_step as number) || 33;
  const presetModes = (entity?.attributes?.preset_modes as string[]) || [];
  const presetMode = (entity?.attributes?.preset_mode as string) || '';

  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Fan');

  const svc = async (service: string, data?: Record<string, unknown>) => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('fan', service, { entity_id: config.entityId, ...data });
    } catch (e) {
      console.error('[FanControl]', e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full rounded-card p-3"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {/* Animated fan icon */}
      <button onClick={() => svc('toggle')} disabled={mode === 'edit'}
        style={{ cursor: mode === 'edit' ? 'grab' : 'pointer' }}>
        <motion.div
          animate={{ rotate: isOn ? 360 : 0 }}
          transition={{ duration: isOn ? 2 / (percentage / 100 || 1) : 0, repeat: isOn ? Infinity : 0, ease: 'linear' }}
        >
          <Icon path={mdiFan} size={2} color={isOn ? 'var(--color-accent)' : 'var(--color-text-tertiary)'} />
        </motion.div>
      </button>

      <span className="font-medium" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
        {label}
      </span>

      {/* Speed slider */}
      <div className="w-full px-1 space-y-1">
        <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          <span>{isOn ? `${percentage}%` : 'Off'}</span>
        </div>
        <input
          type="range" min={0} max={100} step={speedCount}
          value={percentage}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val === 0) svc('turn_off');
            else svc('set_percentage', { percentage: val });
          }}
          disabled={mode === 'edit'}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${percentage}%, var(--color-surface-tertiary) ${percentage}%, var(--color-surface-tertiary) 100%)`,
            accentColor: 'var(--color-accent)',
          }}
        />

        {/* Oscillation toggle */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <button
            onClick={() => svc('oscillate', { oscillating: !oscillating })}
            disabled={mode === 'edit' || !isOn}
            className="text-xs px-2 py-0.5 rounded transition-colors"
            style={{
              background: oscillating ? 'var(--color-accent-muted)' : 'var(--color-surface-tertiary)',
              color: oscillating ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
            }}
          >
            Oscillate
          </button>
        </div>

        {/* Preset modes */}
        {presetModes.length > 0 && (
          <select
            value={presetMode}
            onChange={(e) => svc('set_preset_mode', { preset_mode: e.target.value })}
            disabled={mode === 'edit'}
            className="w-full text-xs py-1 px-2 rounded outline-none cursor-pointer mt-1"
            style={{ background: 'var(--color-surface-tertiary)', color: 'var(--color-text-secondary)', border: 'none' }}
          >
            {presetModes.map((m) => (
              <option key={m} value={m} style={{ background: 'var(--color-surface-primary)' }}>{m}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

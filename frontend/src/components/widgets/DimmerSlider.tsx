import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiLightbulb, mdiLightbulbOff } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

export default function DimmerSlider({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const isOn = entity?.state === 'on';
  const brightness = (entity?.attributes?.brightness as number) || 0;
  const pct = Math.round((brightness / 255) * 100);
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accent = (config.accentColor as string) || '#fbbf24';
  const hideLabel = config.hideLabel as boolean;
  const compact = config.compactMode as boolean;

  const handleToggle = async () => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('light', 'toggle', { entity_id: config.entityId });
    } catch (e) {
      console.error('[DimmerSlider]', e);
    }
  };

  const handleBrightness = async (value: number) => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      if (value === 0) {
        await callService('light', 'turn_off', { entity_id: config.entityId });
      } else {
        await callService('light', 'turn_on', {
          entity_id: config.entityId,
          brightness: Math.round((value / 100) * 255),
        });
      }
    } catch (e) {
      console.error('[DimmerSlider]', e);
    }
  };

  const iconPath = customIcon || (isOn ? mdiLightbulb : mdiLightbulbOff);
  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Dimmer');

  if (compact) {
    return (
      <div className="flex items-center gap-3 w-full h-full rounded-card px-4"
        style={{ background: 'var(--color-surface-secondary)' }}>
        <button onClick={handleToggle} disabled={mode === 'edit'}
          style={{ cursor: mode === 'edit' ? 'grab' : 'pointer' }}>
          <Icon path={iconPath} size={1.2} color={isOn ? accent : 'var(--color-text-secondary)'} />
        </button>
        <div className="flex-1 min-w-0">
          {!hideLabel && (
            <span className="text-xs font-medium block truncate" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
          )}
          <input
            type="range" min={0} max={100} value={pct}
            onChange={(e) => handleBrightness(Number(e.target.value))}
            disabled={mode === 'edit'}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${accent} 0%, ${accent} ${pct}%, var(--color-surface-tertiary) ${pct}%, var(--color-surface-tertiary) 100%)`,
              accentColor: accent,
            }}
          />
        </div>
        <span className="text-xs font-mono w-8 text-right" style={{ color: 'var(--color-text-tertiary)' }}>{pct}%</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between w-full h-full rounded-card p-4"
      style={{
        background: isOn
          ? `linear-gradient(180deg, ${accent}18 0%, var(--color-surface-secondary) 100%)`
          : 'var(--color-surface-secondary)',
      }}>
      <motion.button
        onClick={handleToggle}
        whileTap={mode !== 'edit' ? { scale: 0.9 } : undefined}
        disabled={mode === 'edit'}
        style={{ cursor: mode === 'edit' ? 'grab' : 'pointer' }}
      >
        <Icon path={iconPath} size={1.8} color={isOn ? accent : 'var(--color-text-secondary)'} />
      </motion.button>

      {!hideLabel && (
        <span className="font-medium" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
          {label}
        </span>
      )}

      <div className="w-full space-y-1">
        <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          <span>{isOn ? `${pct}%` : 'Off'}</span>
        </div>
        <input
          type="range" min={0} max={100} value={pct}
          onChange={(e) => handleBrightness(Number(e.target.value))}
          disabled={mode === 'edit'}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${accent} 0%, ${accent} ${pct}%, var(--color-surface-tertiary) ${pct}%, var(--color-surface-tertiary) 100%)`,
            accentColor: accent,
          }}
        />
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiLightbulb } from '../../utils/icons';
import type { WidgetProps } from '../../types/widget';

export default function DimmerSlider({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const isOn = entity?.state === 'on';
  const brightness = (entity?.attributes?.brightness as number) || 0;
  const brightnessPct = Math.round((brightness / 255) * 100);
  const [pending, setPending] = useState<number | null>(null);

  const displayPct = pending ?? brightnessPct;

  const handleToggle = async () => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('light', 'toggle', { entity_id: config.entityId });
    } catch (e) {
      console.error('[DimmerSlider] Toggle failed:', e);
    }
  };

  const handleBrightness = useCallback(async (value: number) => {
    if (mode === 'edit' || !config.entityId) return;
    setPending(value);
    try {
      await callService('light', 'turn_on', {
        entity_id: config.entityId,
        brightness_pct: value,
      });
    } catch (e) {
      console.error('[DimmerSlider] Brightness failed:', e);
    }
    setTimeout(() => setPending(null), 2000);
  }, [config.entityId, mode]);

  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Light');

  return (
    <div
      className="flex flex-col items-center justify-between w-full h-full rounded-card p-3 transition-all"
      style={{
        background: isOn
          ? `linear-gradient(180deg, rgba(251, 191, 36, ${displayPct / 500 + 0.05}) 0%, var(--color-surface-secondary) 100%)`
          : 'var(--color-surface-secondary)',
        cursor: mode === 'edit' ? 'grab' : 'default',
      }}
    >
      {/* Top: icon + toggle */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 transition-colors"
        style={{ cursor: mode === 'edit' ? 'grab' : 'pointer' }}
      >
        <Icon
          path={mdiLightbulb}
          size={1}
          color={isOn ? 'var(--color-state-on)' : 'var(--color-text-secondary)'}
        />
        <span className="font-medium" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
          {label}
        </span>
      </button>

      {/* Center: brightness percentage */}
      <div className="text-center">
        <span className="text-2xl font-bold" style={{ color: isOn ? 'var(--color-state-on)' : 'var(--color-text-tertiary)' }}>
          {isOn ? `${displayPct}%` : 'Off'}
        </span>
      </div>

      {/* Bottom: slider */}
      <div className="w-full px-1">
        <input
          type="range"
          min={1}
          max={100}
          value={displayPct || 1}
          onChange={(e) => handleBrightness(Number(e.target.value))}
          disabled={mode === 'edit'}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: isOn
              ? `linear-gradient(to right, var(--color-state-on) 0%, var(--color-state-on) ${displayPct}%, var(--color-surface-tertiary) ${displayPct}%, var(--color-surface-tertiary) 100%)`
              : 'var(--color-surface-tertiary)',
            accentColor: 'var(--color-state-on)',
          }}
        />
      </div>
    </div>
  );
}

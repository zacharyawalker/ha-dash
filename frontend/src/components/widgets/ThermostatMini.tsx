import { useState, useCallback } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiThermometer, mdiChevronUp, mdiChevronDown, mdiFire, mdiSnowflake } from '@mdi/js';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

/**
 * Compact thermostat widget — just current temp + target with up/down arrows.
 * Much smaller than the full ClimateCard.
 */
export default function ThermostatMini({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const [pending, setPending] = useState<number | null>(null);
  const accentColor = config.accentColor as string | undefined;
  const hideLabel = config.hideLabel as boolean;

  if (!entity) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>
        {config.entityId ? 'Loading...' : 'No entity'}
      </div>
    );
  }

  const hvacMode = entity.state;
  const currentTemp = entity.attributes?.current_temperature as number | null;
  const targetTemp = pending ?? (entity.attributes?.temperature as number | null);
  const label = String(config.label || entity.attributes?.friendly_name || 'Thermostat');
  const isHeating = entity.attributes?.hvac_action === 'heating';
  const isCooling = entity.attributes?.hvac_action === 'cooling';

  const modeColor = accentColor || (isHeating ? '#ef4444' : isCooling ? '#4a9eff' : 'var(--color-text-tertiary)');
  const modeIcon = isHeating ? mdiFire : isCooling ? mdiSnowflake : mdiThermometer;

  const adjust = useCallback(async (delta: number) => {
    if (mode === 'edit' || !config.entityId || !targetTemp) return;
    const next = targetTemp + delta;
    setPending(next);
    try {
      await callService('climate', 'set_temperature', {
        entity_id: config.entityId,
        temperature: next,
      });
    } catch (e) {
      console.error('[ThermostatMini]', e);
    }
    setTimeout(() => setPending(null), 3000);
  }, [config.entityId, mode, targetTemp]);

  return (
    <div className="flex items-center justify-between w-full h-full rounded-card px-3 py-2"
      style={{
        background: isHeating || isCooling ? `${modeColor}10` : 'var(--color-surface-secondary)',
        border: `1px solid ${modeColor}30`,
      }}>

      {/* Left: icon + current temp */}
      <div className="flex items-center gap-2">
        <motion.div
          animate={isHeating ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: isHeating ? Infinity : 0 }}
        >
          <Icon path={modeIcon} size={1.2} color={modeColor} />
        </motion.div>
        <div>
          {!hideLabel && (
            <span className="text-xs block" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
          )}
          <span className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {currentTemp != null ? `${currentTemp}°` : '—'}
          </span>
        </div>
      </div>

      {/* Right: target + arrows */}
      {hvacMode !== 'off' && targetTemp != null && (
        <div className="flex items-center gap-1">
          <button onClick={() => adjust(-1)} disabled={mode === 'edit'}
            className="p-1 rounded hover:bg-white/10">
            <Icon path={mdiChevronDown} size={0.8} color="var(--color-text-secondary)" />
          </button>
          <div className="text-center" style={{ minWidth: '45px' }}>
            <span className="text-lg font-bold" style={{ color: modeColor }}>
              {targetTemp}°
            </span>
            <span className="text-xs block" style={{ color: 'var(--color-text-tertiary)' }}>Target</span>
          </div>
          <button onClick={() => adjust(1)} disabled={mode === 'edit'}
            className="p-1 rounded hover:bg-white/10">
            <Icon path={mdiChevronUp} size={0.8} color="var(--color-text-secondary)" />
          </button>
        </div>
      )}
    </div>
  );
}

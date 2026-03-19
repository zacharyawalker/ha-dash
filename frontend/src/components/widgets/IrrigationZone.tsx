import { useState, useCallback } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiSprinkler, mdiSprinklerFire, mdiStop, mdiPlay, mdiTimerSand } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

/**
 * Single irrigation zone control.
 * Toggle zone on/off with optional duration selection.
 */
export default function IrrigationZone({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  // Duration entity for future use
  useHaEntity(config.durationEntityId as string | undefined);
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accentColor = (config.accentColor as string) || '#22c55e';
  const hideLabel = config.hideLabel as boolean;
  const [duration, setDuration] = useState(10);

  if (!entity) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>
        {config.entityId ? 'Loading...' : 'No entity'}
      </div>
    );
  }

  const isOn = entity.state === 'on';
  const label = String(config.label || entity.attributes?.friendly_name || 'Zone');
  const zoneNumber = entity.attributes?.zone as number | undefined;

  const toggle = useCallback(async () => {
    if (mode === 'edit' || !config.entityId) return;
    const entityId = config.entityId as string;
    const domain = entityId.split('.')[0];
    try {
      if (isOn) {
        await callService(domain, 'turn_off', { entity_id: entityId });
      } else {
        await callService(domain, 'turn_on', { entity_id: entityId });
      }
    } catch (e) {
      console.error('[IrrigationZone]', e);
    }
  }, [config.entityId, mode, isOn]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full rounded-card gap-2 p-3"
      style={{
        background: isOn ? `${accentColor}15` : 'var(--color-surface-secondary)',
        border: `1px solid ${isOn ? accentColor + '40' : 'transparent'}`,
      }}>

      {/* Zone icon */}
      <motion.div
        animate={isOn ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 1.5, repeat: isOn ? Infinity : 0 }}
      >
        <Icon
          path={customIcon || (isOn ? mdiSprinklerFire : mdiSprinkler)}
          size={1.5}
          color={isOn ? accentColor : 'var(--color-text-tertiary)'}
        />
      </motion.div>

      {/* Label */}
      {!hideLabel && (
        <span className="text-xs font-semibold text-center" style={{ color: 'var(--color-text-primary)' }}>
          {label}
          {zoneNumber != null && (
            <span className="ml-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>#{zoneNumber}</span>
          )}
        </span>
      )}

      {/* Status */}
      <span className="text-xs font-bold" style={{ color: isOn ? accentColor : 'var(--color-text-tertiary)' }}>
        {isOn ? '● Running' : '○ Off'}
      </span>

      {/* Duration selector (only when off) */}
      {!isOn && (
        <div className="flex items-center gap-1">
          <Icon path={mdiTimerSand} size={0.4} color="var(--color-text-tertiary)" />
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={mode === 'edit'}
            className="text-xs px-1 py-0.5 rounded outline-none"
            style={{
              background: 'var(--color-surface-tertiary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-primary)',
            }}
          >
            {[5, 10, 15, 20, 30, 45, 60].map((m) => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>
        </div>
      )}

      {/* Toggle button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        disabled={mode === 'edit'}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
        style={{
          background: isOn ? '#ef444420' : `${accentColor}20`,
          color: isOn ? '#ef4444' : accentColor,
          cursor: mode === 'edit' ? 'grab' : 'pointer',
        }}
      >
        <Icon path={isOn ? mdiStop : mdiPlay} size={0.5} />
        {isOn ? 'Stop' : 'Start'}
      </motion.button>
    </div>
  );
}

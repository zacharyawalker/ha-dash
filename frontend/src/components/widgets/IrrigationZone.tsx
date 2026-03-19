import { useState, useCallback } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiSprinkler, mdiSprinklerFire, mdiStop, mdiWater } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import { motion, AnimatePresence } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

/** Duration preset buttons */
const DURATIONS = [5, 15, 30];

/**
 * Redesigned irrigation zone card.
 * Visual states: Idle (gray), Running (blue/green with animation), Error (red)
 * One-click duration buttons, animated water effect.
 */
export default function IrrigationZone({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const { entity: timerEntity } = useHaEntity(config.timerEntityId as string | undefined);
  useHaEntity(config.durationEntityId as string | undefined);
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accentColor = (config.accentColor as string) || '#3b82f6';
  const hideLabel = config.hideLabel as boolean;
  const [selectedDuration, setSelectedDuration] = useState(15);

  if (!entity) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>
        {config.entityId ? 'Loading...' : 'No entity'}
      </div>
    );
  }

  const isOn = entity.state === 'on';
  const isError = entity.state === 'unavailable';
  const label = String(config.label || entity.attributes?.friendly_name || 'Zone');
  const zoneNumber = entity.attributes?.zone as number | undefined;

  // Timer remaining
  const remaining = timerEntity?.attributes?.remaining as string | undefined;
  const timerActive = timerEntity?.state === 'active';

  const stateColor = isError ? '#ef4444' : isOn ? accentColor : 'var(--color-text-tertiary)';

  const startZone = useCallback(async (minutes: number) => {
    if (mode === 'edit' || !config.entityId) return;
    const entityId = config.entityId as string;
    const domain = entityId.split('.')[0];
    try {
      // Set duration if entity exists
      if (config.durationEntityId) {
        await callService('input_number', 'set_value', {
          entity_id: config.durationEntityId as string,
          value: minutes,
        });
      }
      await callService(domain, 'turn_on', { entity_id: entityId });
    } catch (e) {
      console.error('[IrrigationZone]', e);
    }
  }, [config.entityId, config.durationEntityId, mode]);

  const stopZone = useCallback(async () => {
    if (mode === 'edit' || !config.entityId) return;
    const entityId = config.entityId as string;
    const domain = entityId.split('.')[0];
    try {
      await callService(domain, 'turn_off', { entity_id: entityId });
    } catch (e) {
      console.error('[IrrigationZone]', e);
    }
  }, [config.entityId, mode]);

  return (
    <div className="flex flex-col w-full h-full rounded-card overflow-hidden"
      style={{
        background: isOn ? `${accentColor}08` : isError ? '#ef444408' : 'var(--color-surface-secondary)',
        border: `2px solid ${isOn ? accentColor + '40' : isError ? '#ef444440' : 'transparent'}`,
      }}>

      {/* Zone header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <div className="flex items-center gap-2">
          {zoneNumber != null && (
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: `${stateColor}20`, color: stateColor }}>
              {zoneNumber}
            </div>
          )}
          {!hideLabel && (
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isOn && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Icon path={mdiWater} size={0.5} color={accentColor} />
            </motion.div>
          )}
          <div className="w-2 h-2 rounded-full" style={{ background: stateColor }} />
        </div>
      </div>

      {/* Icon + Status */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1 px-3">
        <motion.div
          animate={isOn ? { rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: isOn ? Infinity : 0 }}
        >
          <Icon
            path={customIcon || (isOn ? mdiSprinklerFire : mdiSprinkler)}
            size={1.8}
            color={stateColor}
          />
        </motion.div>

        {/* Animated water drops when running */}
        <AnimatePresence>
          {isOn && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-1"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                >
                  <Icon path={mdiWater} size={0.3} color={accentColor} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer countdown */}
        {timerActive && remaining && (
          <span className="text-lg font-mono font-bold tabular-nums" style={{ color: accentColor }}>
            {remaining}
          </span>
        )}

        <span className="text-xs font-semibold"
          style={{ color: isOn ? accentColor : isError ? '#ef4444' : 'var(--color-text-tertiary)' }}>
          {isError ? 'Unavailable' : isOn ? 'Running' : 'Idle'}
        </span>
      </div>

      {/* Controls */}
      <div className="px-2 pb-2">
        {isOn ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={stopZone}
            disabled={mode === 'edit'}
            className="w-full flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold"
            style={{ background: '#ef4444', color: 'white', cursor: mode === 'edit' ? 'grab' : 'pointer' }}
          >
            <Icon path={mdiStop} size={0.5} />
            STOP
          </motion.button>
        ) : (
          <div className="flex gap-1">
            {DURATIONS.map((min) => (
              <motion.button
                key={min}
                whileTap={{ scale: 0.9 }}
                onClick={() => startZone(min)}
                disabled={mode === 'edit' || isError}
                className="flex-1 flex items-center justify-center gap-0.5 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: selectedDuration === min ? `${accentColor}25` : 'var(--color-surface-tertiary)',
                  color: selectedDuration === min ? accentColor : 'var(--color-text-secondary)',
                  border: `1px solid ${selectedDuration === min ? accentColor + '40' : 'transparent'}`,
                  cursor: mode === 'edit' || isError ? 'not-allowed' : 'pointer',
                  opacity: isError ? 0.4 : 1,
                }}
                onMouseEnter={() => setSelectedDuration(min)}
              >
                {min}m
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

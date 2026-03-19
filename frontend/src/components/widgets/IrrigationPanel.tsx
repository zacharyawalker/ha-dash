import { useCallback, useMemo } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { useEntityStore } from '../../store/entityStore';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import {
  mdiSprinkler, mdiSprinklerFire, mdiWeatherRainy,
  mdiWater, mdiClockOutline, mdiShieldAlert,
} from '@mdi/js';
import { motion, AnimatePresence } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

/** Individual zone card inside the panel */
function ZoneCard({ entityId, timerEntityId, mode, accent }: {
  entityId: string;
  timerEntityId?: string;
  mode: 'edit' | 'view';
  accent: string;
}) {
  const { entity } = useHaEntity(entityId);
  const { entity: timer } = useHaEntity(timerEntityId);
  if (!entity) return null;

  const isOn = entity.state === 'on';
  const isError = entity.state === 'unavailable';
  const name = (entity.attributes?.friendly_name as string) || entityId;
  const zoneNum = entity.attributes?.zone as number | undefined;
  const domain = entityId.split('.')[0];
  const remaining = timer?.attributes?.remaining as string | undefined;
  const timerActive = timer?.state === 'active';

  const toggle = async () => {
    if (mode === 'edit') return;
    try {
      await callService(domain, isOn ? 'turn_off' : 'turn_on', { entity_id: entityId });
    } catch (e) {
      console.error('[IrrigationPanel]', e);
    }
  };

  const stateColor = isError ? '#ef4444' : isOn ? accent : 'var(--color-text-tertiary)';
  const displayName = zoneNum != null ? `Zone ${zoneNum}` : name.replace(/^Rain Bird /, '').replace(/^Sprinkler /, 'Zone ');

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggle}
      disabled={mode === 'edit'}
      className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all min-h-[100px]"
      style={{
        background: isOn ? `${accent}12` : isError ? '#ef444408' : 'var(--color-surface-tertiary)',
        border: `2px solid ${isOn ? accent + '40' : isError ? '#ef444430' : 'transparent'}`,
        cursor: mode === 'edit' ? 'grab' : isError ? 'not-allowed' : 'pointer',
        opacity: isError ? 0.5 : 1,
      }}
    >
      {/* Zone number badge */}
      <div className="flex items-center justify-between w-full">
        {zoneNum != null && (
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: `${stateColor}20`, color: stateColor }}>
            {zoneNum}
          </div>
        )}
        <div className="w-2 h-2 rounded-full ml-auto" style={{ background: stateColor }} />
      </div>

      {/* Icon with animation */}
      <motion.div
        animate={isOn ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        <Icon path={isOn ? mdiSprinklerFire : mdiSprinkler} size={1} color={stateColor} />
      </motion.div>

      {/* Water drops animation */}
      <AnimatePresence>
        {isOn && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.div key={i}
                animate={{ y: [0, 6, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}>
                <Icon path={mdiWater} size={0.25} color={accent} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name */}
      <span className="text-xs font-semibold truncate w-full text-center"
        style={{ color: isOn ? accent : 'var(--color-text-secondary)' }}>
        {displayName}
      </span>

      {/* Timer or status */}
      {timerActive && remaining ? (
        <span className="text-xs font-mono font-bold tabular-nums" style={{ color: accent }}>
          {remaining}
        </span>
      ) : (
        <span className="text-[10px]" style={{ color: stateColor }}>
          {isError ? 'Error' : isOn ? 'Running' : 'Idle'}
        </span>
      )}
    </motion.button>
  );
}

/**
 * Redesigned multi-zone irrigation panel.
 * System status bar + 4x2 zone grid + stop all.
 */
export default function IrrigationPanel({ config, mode }: WidgetProps) {
  const accentColor = (config.accentColor as string) || '#3b82f6';
  const hideLabel = config.hideLabel as boolean;
  const title = String(config.label || 'Irrigation Control');

  // System entities
  const { entity: rainSensor } = useHaEntity(config.rainSensorId as string | undefined);
  const { entity: dailyRuntime } = useHaEntity(config.dailyRuntimeId as string | undefined);
  const { entity: nextRun } = useHaEntity(config.nextRunId as string | undefined);
  const isRaining = rainSensor?.state === 'on';

  // Collect zone entity IDs
  const zoneIds = [
    config.zone1, config.zone2, config.zone3, config.zone4,
    config.zone5, config.zone6, config.zone7, config.zone8,
    config.zone9, config.zone10, config.zone11, config.zone12,
  ].filter(Boolean) as string[];

  // Count active zones
  const entities = useEntityStore((s) => s.entities);
  const activeZones = useMemo(() => {
    return zoneIds.filter((id) => entities[id]?.state === 'on').length;
  }, [zoneIds, entities]);

  const stopAll = useCallback(async () => {
    if (mode === 'edit') return;
    try {
      for (const id of zoneIds) {
        const domain = id.split('.')[0];
        await callService(domain, 'turn_off', { entity_id: id });
      }
    } catch (e) {
      console.error('[IrrigationPanel] Stop all failed:', e);
    }
  }, [zoneIds, mode]);

  return (
    <div className="flex flex-col w-full h-full rounded-card overflow-hidden"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {/* System Status Bar */}
      <div className="flex items-center justify-between px-3 py-2.5"
        style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
        <div className="flex items-center gap-2">
          <Icon path={mdiSprinkler} size={0.7} color={accentColor} />
          {!hideLabel && (
            <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{title}</span>
          )}
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-1.5">
          {/* Rain sensor */}
          {rainSensor && (
            <div className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                background: isRaining ? '#3b82f620' : 'var(--color-surface-tertiary)',
                color: isRaining ? '#3b82f6' : 'var(--color-text-tertiary)',
              }}>
              <Icon path={mdiWeatherRainy} size={0.35} />
              {isRaining ? 'Rain' : 'Dry'}
            </div>
          )}

          {/* Active zones */}
          <div className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{
              background: activeZones > 0 ? `${accentColor}20` : 'var(--color-surface-tertiary)',
              color: activeZones > 0 ? accentColor : 'var(--color-text-tertiary)',
            }}>
            <Icon path={mdiSprinklerFire} size={0.35} />
            {activeZones} active
          </div>

          {/* Daily runtime */}
          {dailyRuntime && (
            <div className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--color-surface-tertiary)', color: 'var(--color-text-tertiary)' }}>
              <Icon path={mdiClockOutline} size={0.35} />
              {dailyRuntime.state}{String(dailyRuntime.attributes?.unit_of_measurement || 'min')}
            </div>
          )}
        </div>
      </div>

      {/* Next run info */}
      {nextRun && nextRun.state !== 'unknown' && (
        <div className="flex items-center gap-1 px-3 py-1 text-[10px]"
          style={{ color: 'var(--color-text-tertiary)', borderBottom: '1px solid var(--color-border-primary)' }}>
          <Icon path={mdiClockOutline} size={0.3} />
          Next: {nextRun.state}
        </div>
      )}

      {/* Zone Grid — responsive 4-col on wide, 2-col on narrow */}
      <div className="flex-1 grid grid-cols-4 gap-2 p-2.5 overflow-y-auto"
        style={{ gridAutoRows: 'min-content' }}>
        {zoneIds.map((id) => (
          <ZoneCard key={id} entityId={id} mode={mode} accent={accentColor} />
        ))}
      </div>

      {zoneIds.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-1"
          style={{ color: 'var(--color-text-tertiary)' }}>
          <Icon path={mdiSprinkler} size={1.5} color="var(--color-text-tertiary)" />
          <span className="text-xs">Configure zone entities in settings</span>
        </div>
      )}

      {/* Emergency Stop */}
      {activeZones > 0 && (
        <div className="px-2.5 pb-2.5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={stopAll}
            disabled={mode === 'edit'}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: '#ef4444', color: 'white', cursor: mode === 'edit' ? 'grab' : 'pointer' }}
          >
            <Icon path={mdiShieldAlert} size={0.6} />
            EMERGENCY STOP ALL
          </motion.button>
        </div>
      )}
    </div>
  );
}

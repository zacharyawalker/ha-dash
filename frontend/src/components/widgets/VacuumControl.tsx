import { useCallback } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiRobotVacuum, mdiPlay, mdiPause, mdiStop, mdiHome } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

/**
 * Vacuum robot control — start, pause, stop, return to base.
 * Shows battery level and current state.
 */
export default function VacuumControl({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accentColor = (config.accentColor as string) || '#22c55e';
  const hideLabel = config.hideLabel as boolean;

  if (!entity) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>
        {config.entityId ? 'Loading...' : 'No entity'}
      </div>
    );
  }

  const state = entity.state;
  const battery = entity.attributes?.battery_level as number | undefined;
  const label = String(config.label || entity.attributes?.friendly_name || 'Vacuum');
  const isCleaning = state === 'cleaning';
  const isReturning = state === 'returning';
  const isDocked = state === 'docked';

  const handleAction = useCallback(async (action: string) => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('vacuum', action, { entity_id: config.entityId });
    } catch (e) {
      console.error('[VacuumControl]', e);
    }
  }, [config.entityId, mode]);

  const stateColor = isCleaning ? accentColor : isReturning ? '#f59e0b' : 'var(--color-text-tertiary)';

  return (
    <div className="flex flex-col items-center justify-center w-full h-full rounded-card gap-2 p-3"
      style={{
        background: isCleaning ? `${accentColor}10` : 'var(--color-surface-secondary)',
        border: `1px solid ${isCleaning ? accentColor + '30' : 'transparent'}`,
      }}>

      <motion.div
        animate={isCleaning ? { rotate: 360 } : {}}
        transition={isCleaning ? { duration: 3, repeat: Infinity, ease: 'linear' } : {}}
      >
        <Icon path={customIcon || mdiRobotVacuum} size={1.5} color={stateColor} />
      </motion.div>

      {!hideLabel && (
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      )}

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold capitalize" style={{ color: stateColor }}>
          {state}
        </span>
        {battery != null && (
          <span className="text-xs px-1.5 py-0.5 rounded" style={{
            background: battery > 20 ? `${accentColor}20` : '#ef444420',
            color: battery > 20 ? accentColor : '#ef4444',
          }}>
            {battery}%
          </span>
        )}
      </div>

      <div className="flex gap-1.5">
        {!isCleaning && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleAction('start')} disabled={mode === 'edit'}
            className="p-1.5 rounded-lg" style={{ background: `${accentColor}20` }}>
            <Icon path={mdiPlay} size={0.6} color={accentColor} />
          </motion.button>
        )}
        {isCleaning && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleAction('pause')} disabled={mode === 'edit'}
            className="p-1.5 rounded-lg" style={{ background: '#f59e0b20' }}>
            <Icon path={mdiPause} size={0.6} color="#f59e0b" />
          </motion.button>
        )}
        {(isCleaning || state === 'paused') && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleAction('stop')} disabled={mode === 'edit'}
            className="p-1.5 rounded-lg" style={{ background: '#ef444420' }}>
            <Icon path={mdiStop} size={0.6} color="#ef4444" />
          </motion.button>
        )}
        {!isDocked && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleAction('return_to_base')} disabled={mode === 'edit'}
            className="p-1.5 rounded-lg" style={{ background: 'var(--color-surface-tertiary)' }}>
            <Icon path={mdiHome} size={0.6} color="var(--color-text-secondary)" />
          </motion.button>
        )}
      </div>
    </div>
  );
}

import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiRobotVacuum, mdiPlay, mdiPause, mdiHome } from '@mdi/js';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

const STATE_LABELS: Record<string, string> = {
  cleaning: 'Cleaning',
  docked: 'Docked',
  idle: 'Idle',
  paused: 'Paused',
  returning: 'Returning',
  error: 'Error',
};

export default function VacuumCard({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const accent = (config.accentColor as string) || '#14b8a6';
  const hideLabel = config.hideLabel as boolean;

  const state = entity?.state || 'idle';
  const isCleaning = state === 'cleaning';
  const label = String(config.label || entity?.attributes?.friendly_name || 'Vacuum');
  const battery = entity?.attributes?.battery_level as number | undefined;
  const stateLabel = STATE_LABELS[state] || state;

  const svc = async (service: string) => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('vacuum', service, { entity_id: config.entityId });
    } catch (e) {
      console.error('[VacuumCard]', e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full rounded-card p-3"
      style={{
        background: isCleaning ? `${accent}12` : 'var(--color-surface-secondary)',
        border: isCleaning ? `1px solid ${accent}33` : '1px solid transparent',
      }}>

      <motion.div
        animate={isCleaning ? { rotate: 360 } : {}}
        transition={{ duration: 3, repeat: isCleaning ? Infinity : 0, ease: 'linear' }}
      >
        <Icon path={mdiRobotVacuum} size={2} color={isCleaning ? accent : 'var(--color-text-secondary)'} />
      </motion.div>

      <div className="text-center">
        {!hideLabel && (
          <span className="font-medium block" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
            {label}
          </span>
        )}
        <span className="text-xs font-semibold" style={{ color: isCleaning ? accent : 'var(--color-text-tertiary)' }}>
          {stateLabel}
        </span>
        {battery != null && (
          <span className="text-xs block mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            🔋 {battery}%
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {state !== 'cleaning' ? (
          <button onClick={() => svc('start')} disabled={mode === 'edit'}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg"
            style={{ background: accent, color: 'white', cursor: mode === 'edit' ? 'grab' : 'pointer' }}>
            <Icon path={mdiPlay} size={0.5} />
            Start
          </button>
        ) : (
          <button onClick={() => svc('pause')} disabled={mode === 'edit'}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg"
            style={{ background: 'var(--color-surface-tertiary)', color: 'var(--color-text-primary)' }}>
            <Icon path={mdiPause} size={0.5} />
            Pause
          </button>
        )}
        <button onClick={() => svc('return_to_base')} disabled={mode === 'edit'}
          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg"
          style={{ background: 'var(--color-surface-tertiary)', color: 'var(--color-text-primary)' }}>
          <Icon path={mdiHome} size={0.5} />
          Dock
        </button>
      </div>
    </div>
  );
}

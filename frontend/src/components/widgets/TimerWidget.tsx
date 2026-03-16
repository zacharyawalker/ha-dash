import { useState, useEffect, useCallback } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiTimer, mdiPlay, mdiPause, mdiStop } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

/**
 * Timer widget — controls HA timer entities.
 * Shows countdown, start/pause/cancel controls.
 */
export default function TimerWidget({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accentColor = (config.accentColor as string) || '#4a9eff';
  const hideLabel = config.hideLabel as boolean;
  const [remaining, setRemaining] = useState('');

  const isActive = entity?.state === 'active';
  const isPaused = entity?.state === 'paused';
  const isIdle = entity?.state === 'idle';
  const label = String(config.label || entity?.attributes?.friendly_name || 'Timer');

  // Calculate remaining time from finishes_at
  useEffect(() => {
    if (!entity || !isActive) {
      if (isPaused && entity?.attributes?.remaining) {
        setRemaining(String(entity.attributes.remaining));
      } else {
        setRemaining(isIdle ? String(entity?.attributes?.duration || '0:00:00') : '');
      }
      return;
    }

    const finishesAt = entity.attributes?.finishes_at as string | undefined;
    if (!finishesAt) return;

    const update = () => {
      const finish = new Date(finishesAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, finish - now);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [entity, isActive, isPaused, isIdle]);

  const handleAction = useCallback(async (action: 'start' | 'pause' | 'cancel') => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('timer', action, { entity_id: config.entityId });
    } catch (e) {
      console.error('[TimerWidget]', e);
    }
  }, [config.entityId, mode]);

  if (!entity) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>
        {config.entityId ? 'Loading...' : 'No entity'}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full rounded-card gap-2 p-3"
      style={{
        background: isActive ? `${accentColor}10` : 'var(--color-surface-secondary)',
        border: `1px solid ${isActive ? accentColor + '30' : 'transparent'}`,
      }}>

      <motion.div animate={isActive ? { rotate: [0, 10, -10, 0] } : {}} transition={{ duration: 2, repeat: Infinity }}>
        <Icon path={customIcon || mdiTimer} size={1.2} color={isActive ? accentColor : 'var(--color-text-tertiary)'} />
      </motion.div>

      {!hideLabel && (
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      )}

      <span className="text-2xl font-mono font-bold tabular-nums"
        style={{ color: isActive ? accentColor : isPaused ? '#f59e0b' : 'var(--color-text-primary)' }}>
        {remaining || '—'}
      </span>

      <div className="flex gap-2">
        {(isIdle || isPaused) && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleAction('start')} disabled={mode === 'edit'}
            className="p-1.5 rounded-lg" style={{ background: `${accentColor}20` }}>
            <Icon path={mdiPlay} size={0.7} color={accentColor} />
          </motion.button>
        )}
        {isActive && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleAction('pause')} disabled={mode === 'edit'}
            className="p-1.5 rounded-lg" style={{ background: '#f59e0b20' }}>
            <Icon path={mdiPause} size={0.7} color="#f59e0b" />
          </motion.button>
        )}
        {(isActive || isPaused) && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleAction('cancel')} disabled={mode === 'edit'}
            className="p-1.5 rounded-lg" style={{ background: '#ef444420' }}>
            <Icon path={mdiStop} size={0.7} color="#ef4444" />
          </motion.button>
        )}
      </div>
    </div>
  );
}

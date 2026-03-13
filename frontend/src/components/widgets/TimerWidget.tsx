import { useState, useEffect } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiTimerOutline, mdiPlay, mdiPause, mdiStop } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

export default function TimerWidget({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const [now, setNow] = useState(Date.now());
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accent = (config.accentColor as string) || 'var(--color-accent)';
  const hideLabel = config.hideLabel as boolean;

  const state = entity?.state || 'idle';
  const isActive = state === 'active';
  const isPaused = state === 'paused';
  const label = String(config.label || entity?.attributes?.friendly_name || 'Timer');
  const duration = String(entity?.attributes?.duration || '0:00:00');
  const finishesAt = entity?.attributes?.finishes_at as string | undefined;

  // Tick every second when active
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Calculate remaining time
  let remaining = duration;
  if (isActive && finishesAt) {
    const diff = Math.max(0, new Date(finishesAt).getTime() - now);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    remaining = h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  }

  const svc = async (service: string) => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('timer', service, { entity_id: config.entityId });
    } catch (e) {
      console.error('[TimerWidget]', e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full rounded-card p-3 gap-2"
      style={{ background: isActive ? `${typeof accent === 'string' && accent.startsWith('#') ? accent + '12' : 'var(--color-accent-muted)'}` : 'var(--color-surface-secondary)' }}>

      <Icon path={customIcon || mdiTimerOutline} size={1.2} color={isActive ? accent : 'var(--color-text-tertiary)'} />

      {!hideLabel && (
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      )}

      <motion.span
        key={remaining}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="font-mono font-bold text-xl tabular-nums"
        style={{ color: isActive ? accent : 'var(--color-text-primary)' }}
      >
        {remaining}
      </motion.span>

      <div className="flex items-center gap-2">
        {state === 'idle' && (
          <button onClick={() => svc('start')} disabled={mode === 'edit'}
            className="p-2 rounded-full" style={{ background: accent, color: 'white' }}>
            <Icon path={mdiPlay} size={0.6} />
          </button>
        )}
        {isActive && (
          <>
            <button onClick={() => svc('pause')} disabled={mode === 'edit'}
              className="p-2 rounded-full" style={{ background: 'var(--color-surface-tertiary)' }}>
              <Icon path={mdiPause} size={0.6} color="var(--color-text-primary)" />
            </button>
            <button onClick={() => svc('cancel')} disabled={mode === 'edit'}
              className="p-2 rounded-full" style={{ background: 'var(--color-error-muted)' }}>
              <Icon path={mdiStop} size={0.6} color="var(--color-error)" />
            </button>
          </>
        )}
        {isPaused && (
          <>
            <button onClick={() => svc('start')} disabled={mode === 'edit'}
              className="p-2 rounded-full" style={{ background: accent, color: 'white' }}>
              <Icon path={mdiPlay} size={0.6} />
            </button>
            <button onClick={() => svc('cancel')} disabled={mode === 'edit'}
              className="p-2 rounded-full" style={{ background: 'var(--color-error-muted)' }}>
              <Icon path={mdiStop} size={0.6} color="var(--color-error)" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

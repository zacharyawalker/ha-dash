import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiCounter, mdiPlus, mdiMinus, mdiRestart } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

export default function CounterWidget({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accent = (config.accentColor as string) || 'var(--color-accent)';
  const hideLabel = config.hideLabel as boolean;

  const value = parseInt(entity?.state || '0') || 0;
  const label = String(config.label || entity?.attributes?.friendly_name || 'Counter');

  const svc = async (service: string) => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('counter', service, { entity_id: config.entityId });
    } catch (e) {
      console.error('[CounterWidget]', e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full rounded-card p-3 gap-2"
      style={{ background: 'var(--color-surface-secondary)' }}>

      <Icon path={customIcon || mdiCounter} size={1} color={accent} />

      {!hideLabel && (
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      )}

      <motion.span
        key={value}
        initial={{ scale: 1.3, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        className="font-bold text-3xl tabular-nums"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {value}
      </motion.span>

      <div className="flex items-center gap-3">
        <button onClick={() => svc('decrement')} disabled={mode === 'edit'}
          className="p-2 rounded-full transition-colors" style={{ background: 'var(--color-surface-tertiary)' }}>
          <Icon path={mdiMinus} size={0.6} color="var(--color-text-primary)" />
        </button>
        <button onClick={() => svc('reset')} disabled={mode === 'edit'}
          className="p-1.5 rounded-full transition-colors" style={{ background: 'var(--color-surface-tertiary)' }}>
          <Icon path={mdiRestart} size={0.5} color="var(--color-text-tertiary)" />
        </button>
        <button onClick={() => svc('increment')} disabled={mode === 'edit'}
          className="p-2 rounded-full transition-colors" style={{ background: accent, color: 'white' }}>
          <Icon path={mdiPlus} size={0.6} />
        </button>
      </div>
    </div>
  );
}

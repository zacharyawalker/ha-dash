import { useState } from 'react';
import { callService } from '../../api/client';
import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { mdiScript, mdiPlay } from '../../utils/icons';
import { motion, AnimatePresence } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

export default function ScriptButton({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    if (mode === 'edit' || !config.entityId) return;
    setRunning(true);
    try {
      await callService('script', 'turn_on', { entity_id: config.entityId });
      setTimeout(() => setRunning(false), 2000);
    } catch (e) {
      console.error('[ScriptButton] Failed:', e);
      setRunning(false);
    }
  };

  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Script');
  const isOn = entity?.state === 'on';

  return (
    <button
      onClick={handleRun}
      disabled={running || mode === 'edit'}
      className="flex flex-col items-center justify-center w-full h-full rounded-card transition-all"
      style={{
        background: running || isOn
          ? 'var(--color-accent-muted)'
          : 'var(--color-surface-secondary)',
        border: running || isOn ? '1px solid var(--color-accent)' : '1px solid transparent',
        cursor: mode === 'edit' ? 'grab' : 'pointer',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={running ? 'running' : 'idle'}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            rotate: running ? 360 : 0,
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: running ? 1 : 0.2, repeat: running ? Infinity : 0, ease: 'linear' }}
        >
          <Icon
            path={running ? mdiScript : mdiPlay}
            size={1.8}
            color={running ? 'var(--color-accent)' : 'var(--color-info)'}
          />
        </motion.div>
      </AnimatePresence>
      <span className="mt-2 font-medium" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
        {label}
      </span>
      {running && (
        <span className="text-xs mt-0.5" style={{ color: 'var(--color-accent)' }}>Running...</span>
      )}
    </button>
  );
}

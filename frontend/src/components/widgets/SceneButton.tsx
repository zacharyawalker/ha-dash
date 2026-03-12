import { useState } from 'react';
import { callService } from '../../api/client';
import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { mdiPlay, mdiCheck } from '@mdi/js';
import { motion, AnimatePresence } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

export default function SceneButton({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  const handleActivate = async () => {
    if (mode === 'edit' || !config.entityId) return;
    setActivating(true);
    try {
      await callService('scene', 'turn_on', { entity_id: config.entityId });
      setActivated(true);
      setTimeout(() => setActivated(false), 1500);
    } catch (e) {
      console.error('[SceneButton] Failed to activate scene:', e);
    } finally {
      setActivating(false);
    }
  };

  const label = String(
    config.label || entity?.attributes?.friendly_name || config.entityId || 'Scene'
  );

  return (
    <button
      onClick={handleActivate}
      disabled={activating || mode === 'edit'}
      className="flex flex-col items-center justify-center w-full h-full rounded-card transition-all"
      style={{
        background: activated
          ? 'var(--color-success-muted)'
          : 'var(--color-surface-secondary)',
        border: activated ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid transparent',
        cursor: mode === 'edit' ? 'grab' : 'pointer',
      }}
    >
      <AnimatePresence mode="wait">
        {activated ? (
          <motion.div
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <Icon path={mdiCheck} size={1.8} color="var(--color-success)" />
          </motion.div>
        ) : (
          <motion.div
            key="play"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <Icon
              path={mdiPlay}
              size={1.8}
              color={activating ? 'var(--color-text-tertiary)' : 'var(--color-info)'}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="mt-2 font-medium" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
        {label}
      </span>
    </button>
  );
}

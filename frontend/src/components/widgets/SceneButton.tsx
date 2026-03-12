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
      className="flex flex-col items-center justify-center w-full h-full rounded-xl transition-all"
      style={{
        background: activated
          ? 'linear-gradient(135deg, #22c55e20 0%, #22c55e10 100%)'
          : 'rgba(255,255,255,0.05)',
        border: activated ? '1px solid #22c55e40' : '1px solid transparent',
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
            <Icon path={mdiCheck} size={1.8} color="#22c55e" />
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
              color={activating ? '#6b7280' : '#8b5cf6'}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="mt-2 text-sm font-medium text-gray-300">{label}</span>
    </button>
  );
}

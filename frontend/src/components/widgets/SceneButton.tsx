import { useState } from 'react';
import { callService } from '../../api/client';
import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { mdiPlay, mdiCheck } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import { motion, AnimatePresence } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

export default function SceneButton({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accent = (config.accentColor as string) || 'var(--color-accent)';
  const hideLabel = config.hideLabel as boolean;
  const compact = config.compactMode as boolean;

  const handleActivate = async () => {
    if (mode === 'edit' || !config.entityId || activating) return;
    setActivating(true);
    try {
      await callService('scene', 'turn_on', { entity_id: config.entityId });
      setActivated(true);
      setTimeout(() => setActivated(false), 2000);
    } catch (e) {
      console.error('[SceneButton]', e);
    }
    setActivating(false);
  };

  const iconPath = customIcon || (activated ? mdiCheck : mdiPlay);
  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Scene');

  return (
    <motion.button
      onClick={handleActivate}
      whileTap={mode !== 'edit' ? { scale: 0.9 } : undefined}
      className={`flex ${compact ? 'flex-row gap-3 px-4' : 'flex-col'} items-center justify-center w-full h-full rounded-card transition-all`}
      style={{
        background: activated
          ? `linear-gradient(135deg, ${typeof accent === 'string' && accent.startsWith('#') ? accent : 'var(--color-accent)'}22 0%, var(--color-surface-secondary) 100%)`
          : 'var(--color-surface-secondary)',
        cursor: mode === 'edit' ? 'grab' : 'pointer',
        border: activated ? `1px solid ${typeof accent === 'string' && accent.startsWith('#') ? accent + '44' : 'var(--color-accent)'}` : '1px solid transparent',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activated ? 'check' : 'play'}
          initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          <Icon
            path={iconPath}
            size={compact ? 1.2 : 1.8}
            color={activated ? 'var(--color-success)' : accent}
          />
        </motion.div>
      </AnimatePresence>
      {!hideLabel && (
        <span className={`${compact ? '' : 'mt-2'} font-medium`}
          style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
          {label}
        </span>
      )}
    </motion.button>
  );
}

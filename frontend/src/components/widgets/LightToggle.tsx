import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiLightbulb, mdiLightbulbOff } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

export default function LightToggle({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const isOn = entity?.state === 'on';
  const accent = (config.accentColor as string) || '#fbbf24';
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const hideLabel = config.hideLabel as boolean;
  const compact = config.compactMode as boolean;

  const handleToggle = async () => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('light', 'toggle', { entity_id: config.entityId });
    } catch (e) {
      console.error('[LightToggle] Failed to toggle light:', e);
    }
  };

  const iconPath = customIcon || (isOn ? mdiLightbulb : mdiLightbulbOff);
  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Light');

  return (
    <motion.button
      onClick={handleToggle}
      whileTap={mode !== 'edit' ? { scale: 0.95 } : undefined}
      className={`flex ${compact ? 'flex-row gap-3 px-4' : 'flex-col'} items-center justify-center w-full h-full rounded-card transition-all`}
      style={{
        background: isOn
          ? `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`
          : 'var(--color-surface-secondary)',
        cursor: mode === 'edit' ? 'grab' : 'pointer',
        boxShadow: isOn ? `0 4px 20px ${accent}40` : 'none',
      }}
    >
      <motion.div
        animate={isOn ? { rotate: [0, -5, 5, 0], scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Icon
          path={iconPath}
          size={compact ? 1.2 : 1.8}
          color={isOn ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)'}
        />
      </motion.div>
      {!hideLabel && (
        <span
          className={`${compact ? '' : 'mt-2'} font-medium`}
          style={{
            fontSize: compact ? '0.8rem' : 'var(--text-widget-title)',
            color: isOn ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
          }}
        >
          {label}
        </span>
      )}
    </motion.button>
  );
}

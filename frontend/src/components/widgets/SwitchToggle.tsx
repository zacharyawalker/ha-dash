import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiPowerPlug, mdiPowerPlugOff } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

export default function SwitchToggle({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const isOn = entity?.state === 'on';
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accent = (config.accentColor as string) || 'var(--color-accent)';
  const hideLabel = config.hideLabel as boolean;
  const compact = config.compactMode as boolean;

  const handleToggle = async () => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      const domain = config.entityId.split('.')[0];
      await callService(domain, 'toggle', { entity_id: config.entityId });
    } catch (e) {
      console.error('[SwitchToggle]', e);
    }
  };

  const iconPath = customIcon || (isOn ? mdiPowerPlug : mdiPowerPlugOff);
  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Switch');

  return (
    <motion.button
      onClick={handleToggle}
      whileTap={mode !== 'edit' ? { scale: 0.95 } : undefined}
      className={`flex ${compact ? 'flex-row gap-3 px-4' : 'flex-col'} items-center justify-center w-full h-full rounded-card transition-all`}
      style={{
        background: isOn
          ? `linear-gradient(135deg, ${typeof accent === 'string' && accent.startsWith('#') ? accent : 'var(--color-accent)'}22 0%, var(--color-surface-secondary) 100%)`
          : 'var(--color-surface-secondary)',
        cursor: mode === 'edit' ? 'grab' : 'pointer',
        border: isOn ? `1px solid ${typeof accent === 'string' && accent.startsWith('#') ? accent + '44' : 'var(--color-accent)'}` : '1px solid transparent',
      }}
    >
      <Icon
        path={iconPath}
        size={compact ? 1.2 : 1.8}
        color={isOn ? accent : 'var(--color-text-secondary)'}
      />
      {!hideLabel && (
        <div className={`${compact ? '' : 'mt-2'} text-center`}>
          <span className="font-medium" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
            {label}
          </span>
          <span className="text-xs block mt-0.5" style={{ color: isOn ? accent : 'var(--color-text-tertiary)' }}>
            {isOn ? 'On' : 'Off'}
          </span>
        </div>
      )}
    </motion.button>
  );
}

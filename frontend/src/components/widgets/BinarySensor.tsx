import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { BINARY_SENSOR_ICONS } from '../../utils/icons';
import { getIconByName } from '../../utils/haIcons';
import { mdiAlertCircle } from '@mdi/js';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

export default function BinarySensor({ config }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const isOn = entity?.state === 'on';
  const deviceClass = entity?.attributes?.device_class as string | undefined;
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const bsIcons = deviceClass ? BINARY_SENSOR_ICONS[deviceClass] : undefined;
  const icon = customIcon || (bsIcons ? (isOn ? bsIcons.on : bsIcons.off) : mdiAlertCircle);
  const accent = (config.accentColor as string) || (isOn ? 'var(--color-warning)' : 'var(--color-success)');
  const hideLabel = config.hideLabel as boolean;
  const compact = config.compactMode as boolean;

  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Sensor');
  const stateText = isOn
    ? (deviceClass === 'door' || deviceClass === 'window' || deviceClass === 'garage_door' ? 'Open' : 'Detected')
    : (deviceClass === 'door' || deviceClass === 'window' || deviceClass === 'garage_door' ? 'Closed' : 'Clear');

  return (
    <div
      className={`flex ${compact ? 'flex-row gap-3 px-4' : 'flex-col'} items-center justify-center w-full h-full rounded-card transition-all`}
      style={{
        background: isOn
          ? `linear-gradient(135deg, ${typeof accent === 'string' && accent.startsWith('#') ? accent + '22' : 'var(--color-warning-muted)'} 0%, var(--color-surface-secondary) 100%)`
          : 'var(--color-surface-secondary)',
        border: isOn ? `1px solid ${typeof accent === 'string' && accent.startsWith('#') ? accent + '44' : 'rgba(245, 158, 11, 0.2)'}` : '1px solid transparent',
      }}
    >
      <motion.div
        animate={isOn ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.5, repeat: isOn ? Infinity : 0, repeatDelay: 2 }}
      >
        <Icon
          path={icon}
          size={compact ? 1.2 : 1.8}
          color={isOn ? accent : 'var(--color-text-tertiary)'}
        />
      </motion.div>
      {!hideLabel && (
        <div className={`${compact ? '' : 'mt-2'} text-center`}>
          <span className="font-medium block" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
            {label}
          </span>
          <span
            className="text-xs mt-0.5 block font-medium"
            style={{ color: isOn ? accent : 'var(--color-text-tertiary)' }}
          >
            {stateText}
          </span>
        </div>
      )}
    </div>
  );
}

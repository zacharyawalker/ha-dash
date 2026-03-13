import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { getEntityIcon } from '../../utils/icons';
import { getIconByName } from '../../utils/haIcons';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

/**
 * Versatile entity status widget — shows any entity with icon + state + name.
 * Adapts display based on entity domain. Perfect for doors, windows, motion sensors.
 * More visual than the basic sensor display.
 */
export default function EntityStatus({ config }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accentColor = config.accentColor as string | undefined;
  const hideLabel = config.hideLabel as boolean;
  const compactMode = config.compactMode as boolean;

  if (!entity) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>
        {config.entityId ? 'Loading...' : 'No entity'}
      </div>
    );
  }

  const domain = (config.entityId as string)?.split('.')[0] || '';
  const isActive = ['on', 'open', 'home', 'playing', 'heating', 'cooling'].includes(entity.state);
  const icon = customIcon || getEntityIcon(domain, entity.attributes?.device_class as string | undefined, entity.state);
  const unit = (entity.attributes?.unit_of_measurement as string) || '';
  const label = String(config.label || entity.attributes?.friendly_name || config.entityId || 'Entity');

  const activeColor = accentColor || (isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)');
  const stateText = unit ? `${entity.state} ${unit}` : entity.state;

  if (compactMode) {
    return (
      <div className="flex items-center gap-2 w-full h-full rounded-card px-3"
        style={{ background: isActive ? `${activeColor}10` : 'var(--color-surface-secondary)' }}>
        <Icon path={icon} size={0.8} color={activeColor} />
        {!hideLabel && (
          <span className="text-xs flex-1 truncate" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
        )}
        <span className="text-xs font-semibold capitalize" style={{ color: activeColor }}>{stateText}</span>
      </div>
    );
  }

  return (
    <motion.div
      animate={isActive ? { borderColor: `${activeColor}40` } : { borderColor: 'transparent' }}
      className="flex flex-col items-center justify-center w-full h-full rounded-card gap-1.5"
      style={{
        background: isActive ? `${activeColor}10` : 'var(--color-surface-secondary)',
        border: '1px solid transparent',
      }}
    >
      <motion.div animate={isActive ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}>
        <Icon path={icon} size={1.5} color={activeColor} />
      </motion.div>
      {!hideLabel && (
        <span className="text-xs font-medium text-center" style={{ color: 'var(--color-text-primary)' }}>
          {label}
        </span>
      )}
      <span className="text-xs font-semibold capitalize" style={{ color: activeColor }}>
        {stateText}
      </span>
    </motion.div>
  );
}

import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { getEntityIcon } from '../../utils/icons';
import { getIconByName } from '../../utils/haIcons';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

/**
 * Compact status badge — minimal footprint entity display.
 * Just an icon + state in a small pill. Perfect for status bars.
 */
export default function StatusBadge({ config }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accentColor = (config.accentColor as string) || 'var(--color-accent)';

  if (!entity) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-full"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>
        ?
      </div>
    );
  }

  const domain = (config.entityId as string)?.split('.')[0] || '';
  const isActive = ['on', 'open', 'home', 'playing', 'cleaning'].includes(entity.state);
  const icon = customIcon || getEntityIcon(domain, entity.attributes?.device_class as string | undefined, entity.state);
  const unit = (entity.attributes?.unit_of_measurement as string) || '';
  const stateText = ['on', 'off'].includes(entity.state) ? '' : `${entity.state}${unit ? ` ${unit}` : ''}`;
  const color = isActive ? accentColor : 'var(--color-text-tertiary)';

  return (
    <motion.div
      animate={isActive ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
      className="flex items-center justify-center gap-1.5 w-full h-full rounded-full px-2"
      style={{
        background: isActive ? `${accentColor}15` : 'var(--color-surface-secondary)',
        border: `1px solid ${isActive ? accentColor + '30' : 'var(--color-border-primary)'}`,
      }}
    >
      <Icon path={icon} size={0.7} color={color} />
      {stateText && (
        <span className="text-xs font-semibold tabular-nums" style={{ color }}>{stateText}</span>
      )}
      {!stateText && isActive && (
        <div className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
      )}
    </motion.div>
  );
}

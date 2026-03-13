import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { mdiThermometer, mdiWaterPercent, mdiGauge } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

const DEVICE_CLASS_ICONS: Record<string, string> = {
  temperature: mdiThermometer,
  humidity: mdiWaterPercent,
};

export default function SensorDisplay({ config }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const deviceClass = entity?.attributes?.device_class as string | undefined;
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const icon = customIcon || (deviceClass && DEVICE_CLASS_ICONS[deviceClass]) || mdiGauge;
  const accent = (config.accentColor as string) || 'var(--color-accent)';
  const hideLabel = config.hideLabel as boolean;
  const compact = config.compactMode as boolean;

  const value = entity?.state ?? '—';
  const unit = String(config.unit || entity?.attributes?.unit_of_measurement || '');
  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Sensor');

  return (
    <div
      className={`flex ${compact ? 'flex-row gap-3 px-4' : 'flex-col'} items-center justify-center w-full h-full rounded-card`}
      style={{ background: 'var(--color-surface-secondary)' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Icon path={icon} size={compact ? 1.2 : 1.5} color={accent} />
      </motion.div>
      <div className={`${compact ? '' : 'mt-2'} text-center`}>
        <motion.span
          key={value}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="font-bold block"
          style={{ fontSize: compact ? '1.2rem' : 'var(--text-widget-value)', color: 'var(--color-text-primary)' }}
        >
          {value}{unit && <span className="text-sm ml-1" style={{ color: 'var(--color-text-tertiary)' }}>{unit}</span>}
        </motion.span>
        {!hideLabel && (
          <span className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        )}
      </div>
    </div>
  );
}

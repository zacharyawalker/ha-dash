import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { mdiThermometer, mdiWaterPercent, mdiGauge } from '@mdi/js';
import type { WidgetProps } from '../../types/widget';

const DEVICE_CLASS_ICONS: Record<string, string> = {
  temperature: mdiThermometer,
  humidity: mdiWaterPercent,
};

export default function SensorDisplay({ config }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const deviceClass = entity?.attributes?.device_class as string | undefined;
  const icon = (deviceClass && DEVICE_CLASS_ICONS[deviceClass]) || mdiGauge;
  const unit = config.unit || (entity?.attributes?.unit_of_measurement as string) || '';

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full rounded-card"
      style={{ background: 'var(--color-surface-secondary)' }}
    >
      <Icon path={icon} size={1.4} color="var(--color-accent)" />
      <span className="mt-2 font-bold" style={{ fontSize: 'var(--text-widget-value)', color: 'var(--color-text-primary)' }}>
        {entity?.state ?? '—'}
        {unit ? <span style={{ fontSize: 'var(--text-widget-unit)', color: 'var(--color-text-secondary)', marginLeft: '4px' }}>{unit}</span> : null}
      </span>
      <span className="mt-1" style={{ fontSize: 'var(--text-widget-label)', color: 'var(--color-text-secondary)' }}>
        {String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Sensor')}
      </span>
    </div>
  );
}

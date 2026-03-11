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
      className="flex flex-col items-center justify-center w-full h-full rounded-xl"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <Icon path={icon} size={1.4} color="#4a9eff" />
      <span className="mt-2 text-2xl font-bold text-white">
        {entity?.state ?? '—'}{unit ? <span className="text-sm ml-1 text-gray-400">{unit}</span> : null}
      </span>
      <span className="mt-1 text-xs text-gray-400">
        {String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Sensor')}
      </span>
    </div>
  );
}

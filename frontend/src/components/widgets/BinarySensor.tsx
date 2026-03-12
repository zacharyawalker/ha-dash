import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { getEntityIcon, BINARY_SENSOR_ICONS } from '../../utils/icons';
import { mdiShieldCheck } from '@mdi/js';
import type { WidgetProps } from '../../types/widget';

export default function BinarySensor({ config }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const isOn = entity?.state === 'on';
  const deviceClass = (entity?.attributes?.device_class as string) || '';

  const icon = getEntityIcon('binary_sensor', deviceClass, entity?.state);
  const hasCustomIcon = deviceClass in BINARY_SENSOR_ICONS;

  // Color coding: motion/occupancy = blue, safety/leak = red, doors/windows = amber
  const getStateColor = (): string => {
    if (!isOn) return 'var(--color-text-tertiary)';
    if (['moisture', 'smoke', 'safety', 'problem', 'gas'].includes(deviceClass)) return 'var(--color-error)';
    if (['motion', 'occupancy', 'connectivity'].includes(deviceClass)) return 'var(--color-accent)';
    return 'var(--color-warning)'; // doors, windows, garage
  };

  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Sensor');
  const stateLabel = isOn
    ? (deviceClass === 'door' || deviceClass === 'window' || deviceClass === 'garage_door' ? 'Open' :
       deviceClass === 'motion' || deviceClass === 'occupancy' ? 'Detected' :
       deviceClass === 'moisture' ? 'Wet' :
       deviceClass === 'smoke' || deviceClass === 'safety' ? 'Alert!' : 'On')
    : (deviceClass === 'door' || deviceClass === 'window' || deviceClass === 'garage_door' ? 'Closed' :
       deviceClass === 'motion' || deviceClass === 'occupancy' ? 'Clear' :
       deviceClass === 'moisture' ? 'Dry' : 'Off');

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full rounded-card transition-all"
      style={{
        background: isOn
          ? `color-mix(in srgb, ${getStateColor()} 10%, transparent)`
          : 'var(--color-surface-secondary)',
        border: isOn ? `1px solid color-mix(in srgb, ${getStateColor()} 30%, transparent)` : '1px solid transparent',
      }}
    >
      <Icon
        path={hasCustomIcon ? icon : mdiShieldCheck}
        size={1.6}
        color={getStateColor()}
      />
      <span className="mt-2 font-medium" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
        {label}
      </span>
      <span className="mt-0.5" style={{ fontSize: 'var(--text-widget-label)', color: getStateColor() }}>
        {entity ? stateLabel : '—'}
      </span>
    </div>
  );
}

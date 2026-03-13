import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { mdiThermometer, mdiWaterPercent, mdiFlash, mdiGauge } from '@mdi/js';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

const UNIT_ICONS: Record<string, string> = {
  '°F': mdiThermometer,
  '°C': mdiThermometer,
  '%': mdiWaterPercent,
  'W': mdiFlash,
  'kW': mdiFlash,
  'kWh': mdiFlash,
};

function SensorItem({ entityId, accent }: { entityId: string; accent: string }) {
  const { entity } = useHaEntity(entityId);
  if (!entity) return null;

  const value = entity.state;
  const unit = (entity.attributes?.unit_of_measurement as string) || '';
  const name = (entity.attributes?.friendly_name as string) || entityId;
  const icon = UNIT_ICONS[unit] || mdiGauge;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-1 p-2 rounded-lg"
      style={{ background: 'var(--color-surface-tertiary)' }}
    >
      <Icon path={icon} size={0.6} color={accent} />
      <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--color-text-primary)' }}>
        {value}<span className="text-xs ml-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{unit}</span>
      </span>
      <span className="text-xs text-center truncate w-full" style={{ color: 'var(--color-text-secondary)' }}>
        {name}
      </span>
    </motion.div>
  );
}

/**
 * Sensor grid — displays up to 6 sensor entities in a compact grid.
 * Great for comparing temperatures, humidity, power across rooms.
 */
export default function SensorGrid({ config }: WidgetProps) {
  const accent = (config.accentColor as string) || 'var(--color-accent)';
  const hideLabel = config.hideLabel as boolean;
  const title = String(config.label || 'Sensors');

  // Collect up to 6 entity IDs
  const entityIds = [
    config.entity1, config.entity2, config.entity3,
    config.entity4, config.entity5, config.entity6,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col w-full h-full rounded-card p-3 gap-2"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {!hideLabel && (
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>
          {title}
        </span>
      )}

      <div className="grid gap-2 flex-1" style={{
        gridTemplateColumns: entityIds.length <= 2 ? 'repeat(2, 1fr)' : entityIds.length <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
      }}>
        {entityIds.map((id) => (
          <SensorItem key={id} entityId={id} accent={accent} />
        ))}
      </div>
    </div>
  );
}

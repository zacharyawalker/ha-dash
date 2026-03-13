import { useMemo } from 'react';
import { useEntityStore } from '../../store/entityStore';
import Icon from '@mdi/react';
import { mdiBattery, mdiBattery10, mdiBattery20, mdiBattery30, mdiBattery50, mdiBattery70, mdiBattery90, mdiBatteryAlert } from '@mdi/js';
import type { WidgetProps } from '../../types/widget';

function getBatteryIcon(level: number): string {
  if (level <= 5) return mdiBatteryAlert;
  if (level <= 15) return mdiBattery10;
  if (level <= 25) return mdiBattery20;
  if (level <= 40) return mdiBattery30;
  if (level <= 60) return mdiBattery50;
  if (level <= 80) return mdiBattery70;
  if (level <= 95) return mdiBattery90;
  return mdiBattery;
}

function getBatteryColor(level: number): string {
  if (level <= 10) return '#ef4444';
  if (level <= 25) return '#f59e0b';
  if (level <= 50) return '#eab308';
  return '#22c55e';
}

/**
 * Battery monitor widget — shows all devices with battery levels.
 * Sorted by battery level (lowest first). Highlights low batteries.
 */
export default function BatteryMonitor({ config }: WidgetProps) {
  const entities = useEntityStore((s) => s.entities);
  const threshold = (config.threshold as number) || 100;
  const hideLabel = config.hideLabel as boolean;

  const batteries = useMemo(() => {
    return Object.values(entities)
      .filter((e) => {
        const battery = e.attributes?.battery_level ?? e.attributes?.battery;
        if (battery == null && !e.entity_id.includes('battery')) return false;
        // Also check sensor.xxx_battery entities
        const val = battery ?? (e.attributes?.unit_of_measurement === '%' ? parseFloat(e.state) : null);
        return val != null && !isNaN(val as number) && (val as number) <= threshold;
      })
      .map((e) => {
        const val = (e.attributes?.battery_level ?? e.attributes?.battery ?? parseFloat(e.state)) as number;
        return {
          id: e.entity_id,
          name: (e.attributes?.friendly_name as string) || e.entity_id,
          level: Math.round(val),
        };
      })
      .sort((a, b) => a.level - b.level);
  }, [entities, threshold]);

  return (
    <div className="flex flex-col w-full h-full rounded-card overflow-hidden"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {!hideLabel && (
        <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
            Batteries
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {batteries.length} device{batteries.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-1" data-scrollable>
        {batteries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            All batteries OK
          </div>
        ) : (
          batteries.map((b) => (
            <div key={b.id} className="flex items-center gap-2 py-1.5 px-1">
              <Icon path={getBatteryIcon(b.level)} size={0.7} color={getBatteryColor(b.level)} />
              <span className="flex-1 text-xs truncate" style={{ color: 'var(--color-text-primary)' }}>
                {b.name}
              </span>
              <span className="text-xs font-mono font-semibold tabular-nums" style={{ color: getBatteryColor(b.level) }}>
                {b.level}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

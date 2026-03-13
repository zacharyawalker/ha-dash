import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { mdiSolarPower, mdiFlash, mdiBatteryCharging, mdiHomeCircle, mdiTransmissionTower } from '@mdi/js';
import type { WidgetProps } from '../../types/widget';

/**
 * Energy monitoring widget — shows solar production, grid consumption,
 * battery status, and home consumption in a flow layout.
 */
export default function EnergyMonitor({ config }: WidgetProps) {
  const { entity: solarEntity } = useHaEntity(config.solarEntity as string | undefined);
  const { entity: gridEntity } = useHaEntity(config.gridEntity as string | undefined);
  const { entity: batteryEntity } = useHaEntity(config.batteryEntity as string | undefined);
  const { entity: consumptionEntity } = useHaEntity(config.consumptionEntity as string | undefined);

  const accent = (config.accentColor as string) || '#f59e0b';
  const hideLabel = config.hideLabel as boolean;

  const parseVal = (entity: { state: string; attributes: Record<string, unknown> } | undefined): { value: string; unit: string } => {
    if (!entity) return { value: '—', unit: '' };
    const val = parseFloat(entity.state);
    const unit = String(entity.attributes?.unit_of_measurement || 'W');
    if (isNaN(val)) return { value: entity.state, unit: '' };
    if (val >= 1000) return { value: (val / 1000).toFixed(1), unit: 'k' + unit };
    return { value: Math.round(val).toString(), unit };
  };

  const solar = parseVal(solarEntity);
  const grid = parseVal(gridEntity);
  const battery = parseVal(batteryEntity);
  const consumption = parseVal(consumptionEntity);

  const Item = ({ icon, label, value, unit, color }: { icon: string; label: string; value: string; unit: string; color: string }) => (
    <div className="flex flex-col items-center gap-1 flex-1">
      <Icon path={icon} size={1} color={color} />
      <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
        {value}<span className="text-xs ml-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{unit}</span>
      </span>
      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{label}</span>
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full rounded-card p-3 gap-3"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {!hideLabel && (
        <div className="flex items-center gap-2">
          <Icon path={mdiFlash} size={0.6} color={accent} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>Energy</span>
        </div>
      )}

      <div className="flex items-center justify-around flex-1">
        {!!config.solarEntity && <Item icon={mdiSolarPower} label="Solar" value={solar.value} unit={solar.unit} color="#f59e0b" />}
        {!!config.gridEntity && <Item icon={mdiTransmissionTower} label="Grid" value={grid.value} unit={grid.unit} color="#6366f1" />}
        {!!config.batteryEntity && <Item icon={mdiBatteryCharging} label="Battery" value={battery.value} unit={battery.unit} color="#22c55e" />}
        {!!config.consumptionEntity && <Item icon={mdiHomeCircle} label="Home" value={consumption.value} unit={consumption.unit} color="#3b82f6" />}
      </div>
    </div>
  );
}

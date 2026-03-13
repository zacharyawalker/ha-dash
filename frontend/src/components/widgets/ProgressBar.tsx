import { useHaEntity } from '../../hooks/useHaEntities';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

/**
 * Horizontal progress bar widget.
 * Shows a numeric sensor as a colored bar with value label.
 * Great for battery levels, disk usage, water tanks, etc.
 */
export default function ProgressBar({ config }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const accentColor = config.accentColor as string | undefined;
  const hideLabel = config.hideLabel as boolean;

  const value = parseFloat(entity?.state || '0') || 0;
  const min = (config.min as number) || 0;
  const max = (config.max as number) || 100;
  const unit = String(config.unit || entity?.attributes?.unit_of_measurement || '%');
  const label = String(config.label || entity?.attributes?.friendly_name || 'Progress');
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const percent = Math.round(normalized * 100);

  // Color based on value or accent override
  const getColor = (): string => {
    if (accentColor) return accentColor;
    if (percent < 25) return '#ef4444';
    if (percent < 50) return '#f59e0b';
    if (percent < 75) return '#22c55e';
    return '#22c55e';
  };

  const color = getColor();

  return (
    <div className="flex flex-col justify-center w-full h-full rounded-card p-3 gap-2"
      style={{ background: 'var(--color-surface-secondary)' }}>

      <div className="flex items-center justify-between">
        {!hideLabel && (
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {label}
          </span>
        )}
        <span className="text-sm font-bold tabular-nums" style={{ color }}>
          {Math.round(value * 10) / 10}{unit}
        </span>
      </div>

      <div className="w-full h-3 rounded-full overflow-hidden"
        style={{ background: 'var(--color-surface-tertiary)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>

      <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

import { useHaEntity } from '../../hooks/useHaEntities';
import type { WidgetProps } from '../../types/widget';

/**
 * Radial gauge widget with color-coded thresholds.
 * Uses SVG arc for the gauge visualization.
 */
export default function GaugeWidget({ config }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const value = parseFloat(entity?.state || '0') || 0;
  const min = (config.min as number) || 0;
  const max = (config.max as number) || 100;
  const unit = String(config.unit || entity?.attributes?.unit_of_measurement || '');
  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Gauge');

  // Normalize value to 0-1
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));

  // Color thresholds
  const getColor = (): string => {
    const lowThreshold = (config.lowThreshold as number) ?? 30;
    const highThreshold = (config.highThreshold as number) ?? 70;
    const pct = normalized * 100;
    if (pct <= lowThreshold) return 'var(--color-success)';
    if (pct <= highThreshold) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  // SVG arc path
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference * (1 - normalized);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full rounded-card p-2"
      style={{ background: 'var(--color-surface-secondary)' }}>

      <svg width={size} height={size / 2 + 15} viewBox={`0 0 ${size} ${size / 2 + 15}`}>
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="var(--color-surface-tertiary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
        {/* Value text */}
        <text x={size / 2} y={size / 2 - 5} textAnchor="middle"
          style={{ fontSize: '24px', fontWeight: 'bold', fill: 'var(--color-text-primary)' }}>
          {Math.round(value * 10) / 10}
        </text>
        {unit && (
          <text x={size / 2} y={size / 2 + 12} textAnchor="middle"
            style={{ fontSize: '11px', fill: 'var(--color-text-tertiary)' }}>
            {unit}
          </text>
        )}
      </svg>

      <span className="mt-1" style={{ fontSize: 'var(--text-widget-label)', color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
    </div>
  );
}

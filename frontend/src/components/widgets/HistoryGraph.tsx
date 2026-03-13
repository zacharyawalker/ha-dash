import { useState, useEffect, useMemo } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { getHistory } from '../../api/client';
import type { WidgetProps } from '../../types/widget';

interface HistoryPoint {
  state: string;
  last_changed: string;
}

/**
 * SVG-based history graph widget.
 * Fetches entity state history from HA and renders a line/step chart.
 */
export default function HistoryGraph({ config }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hours = (config.hours as number) || 24;
  const chartType = (config.chartType as string) || 'line';
  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'History');
  const unit = String(config.unit || entity?.attributes?.unit_of_measurement || '');

  useEffect(() => {
    if (!config.entityId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getHistory(config.entityId, hours)
      .then((data) => {
        if (!cancelled) setHistory(data);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      getHistory(config.entityId!, hours)
        .then((data) => { if (!cancelled) setHistory(data); })
        .catch(() => {});
    }, 300_000);

    return () => { cancelled = true; clearInterval(interval); };
  }, [config.entityId, hours]);

  const { points, min, max, isNumeric } = useMemo(() => {
    if (!history.length) return { points: [], min: 0, max: 0, isNumeric: false };

    // Check if numeric
    const numericValues = history
      .map((h) => ({ val: parseFloat(h.state), time: new Date(h.last_changed).getTime() }))
      .filter((p) => !isNaN(p.val));

    if (numericValues.length < 2) {
      return { points: [], min: 0, max: 0, isNumeric: false };
    }

    const vals = numericValues.map((p) => p.val);
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const pad = (hi - lo) * 0.1 || 1;

    return {
      points: numericValues,
      min: lo - pad,
      max: hi + pad,
      isNumeric: true,
    };
  }, [history]);

  if (!config.entityId) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>
        No entity selected
      </div>
    );
  }

  if (loading && !history.length) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>
        Loading history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-error)' }}>
        <span className="text-xs">{error}</span>
      </div>
    );
  }

  if (!isNumeric) {
    // Show state timeline for binary/text states
    return (
      <div className="flex flex-col w-full h-full rounded-card p-3"
        style={{ background: 'var(--color-surface-secondary)' }}>
        <span className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        <div className="flex-1 flex items-end gap-px overflow-hidden">
          {history.slice(-50).map((h, i) => {
            const isOn = h.state === 'on' || h.state === 'home' || h.state === 'open';
            return (
              <div
                key={i}
                className="flex-1 rounded-sm min-w-[2px]"
                style={{
                  height: isOn ? '100%' : '20%',
                  background: isOn ? 'var(--color-accent)' : 'var(--color-surface-tertiary)',
                  transition: 'height 0.2s ease',
                }}
                title={`${h.state} at ${new Date(h.last_changed).toLocaleTimeString()}`}
              />
            );
          })}
        </div>
        <span className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
          Last {hours}h — {entity?.state}
        </span>
      </div>
    );
  }

  // Numeric line/step chart
  const svgW = 300;
  const svgH = 100;
  const pad = 5;

  const timeMin = points[0].time;
  const timeMax = points[points.length - 1].time;
  const timeRange = timeMax - timeMin || 1;

  const toX = (t: number) => pad + ((t - timeMin) / timeRange) * (svgW - pad * 2);
  const toY = (v: number) => svgH - pad - ((v - min) / (max - min)) * (svgH - pad * 2);

  const pathParts = points.map((p, i) => {
    const x = toX(p.time);
    const y = toY(p.val);
    if (i === 0) return `M ${x} ${y}`;
    if (chartType === 'step') {
      const prevY = toY(points[i - 1].val);
      return `L ${x} ${prevY} L ${x} ${y}`;
    }
    return `L ${x} ${y}`;
  });

  // Fill area under curve
  const fillPath = `${pathParts.join(' ')} L ${toX(timeMax)} ${svgH - pad} L ${toX(timeMin)} ${svgH - pad} Z`;

  const currentValue = points[points.length - 1]?.val;

  return (
    <div className="flex flex-col w-full h-full rounded-card p-3 gap-1"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {currentValue != null ? Math.round(currentValue * 10) / 10 : '—'}{unit && ` ${unit}`}
        </span>
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="flex-1 w-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((pct) => (
          <line
            key={pct}
            x1={pad} x2={svgW - pad}
            y1={pad + pct * (svgH - pad * 2)} y2={pad + pct * (svgH - pad * 2)}
            stroke="var(--color-border-primary)" strokeWidth={0.5} strokeDasharray="4 4"
          />
        ))}
        {/* Fill */}
        <path d={fillPath} fill="var(--color-accent)" opacity={0.15} />
        {/* Line */}
        <path d={pathParts.join(' ')} fill="none" stroke="var(--color-accent)" strokeWidth={2}
          vectorEffect="non-scaling-stroke" />
        {/* Current value dot */}
        {currentValue != null && (
          <circle cx={toX(timeMax)} cy={toY(currentValue)} r={3}
            fill="var(--color-accent)" stroke="var(--color-surface-secondary)" strokeWidth={1.5} />
        )}
      </svg>

      {/* Footer */}
      <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
        <span>{new Date(timeMin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span>{hours}h</span>
        <span>{new Date(timeMax).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
}

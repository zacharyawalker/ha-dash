import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { WEATHER_ICONS } from '../../utils/icons';
import { mdiWeatherCloudy, mdiWaterPercent, mdiWeatherWindy } from '@mdi/js';
import type { WidgetProps } from '../../types/widget';

interface ForecastDay {
  datetime: string;
  condition: string;
  temperature: number;
  templow?: number;
}

export default function WeatherForecast({ config }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);

  if (!entity) {
    return (
      <div
        className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-widget-title)' }}
      >
        {config.entityId ? 'Loading...' : 'No entity'}
      </div>
    );
  }

  const attrs = entity.attributes;
  const condition = entity.state;
  const temp = attrs.temperature as number | undefined;
  const humidity = attrs.humidity as number | undefined;
  const windSpeed = attrs.wind_speed as number | undefined;
  const forecast = (attrs.forecast as ForecastDay[] | undefined)?.slice(0, 4) || [];
  const icon = WEATHER_ICONS[condition] || mdiWeatherCloudy;

  const label = String(config.label || attrs.friendly_name || config.entityId || 'Weather');
  const conditionLabel = condition.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const getDayName = (iso: string): string => {
    try {
      const d = new Date(iso);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) return 'Today';
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      if (d.toDateString() === tomorrow.toDateString()) return 'Tmrw';
      return d.toLocaleDateString('en', { weekday: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className="flex flex-col w-full h-full rounded-card p-3 overflow-hidden"
      style={{ background: 'var(--color-surface-secondary)' }}
    >
      {/* Header: location */}
      <div className="text-xs font-medium mb-1 truncate" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </div>

      {/* Current conditions */}
      <div className="flex items-center gap-3 mb-2">
        <Icon path={icon} size={2} color="var(--color-accent)" />
        <div>
          <div className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {temp != null ? `${Math.round(temp)}°` : '—'}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {conditionLabel}
          </div>
        </div>
      </div>

      {/* Details row */}
      <div className="flex gap-3 mb-2">
        {humidity != null && (
          <div className="flex items-center gap-1">
            <Icon path={mdiWaterPercent} size={0.5} color="var(--color-text-tertiary)" />
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{humidity}%</span>
          </div>
        )}
        {windSpeed != null && (
          <div className="flex items-center gap-1">
            <Icon path={mdiWeatherWindy} size={0.5} color="var(--color-text-tertiary)" />
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{Math.round(windSpeed)} mph</span>
          </div>
        )}
      </div>

      {/* Forecast days */}
      {forecast.length > 0 && (
        <div className="flex gap-1 mt-auto" style={{ borderTop: '1px solid var(--color-border-primary)', paddingTop: '8px' }}>
          {forecast.map((day, i) => {
            const dayIcon = WEATHER_ICONS[day.condition] || mdiWeatherCloudy;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{getDayName(day.datetime)}</span>
                <Icon path={dayIcon} size={0.6} color="var(--color-text-secondary)" />
                <span style={{ fontSize: '10px', color: 'var(--color-text-primary)' }}>
                  {Math.round(day.temperature)}°
                </span>
                {day.templow != null && (
                  <span style={{ fontSize: '9px', color: 'var(--color-text-tertiary)' }}>
                    {Math.round(day.templow)}°
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

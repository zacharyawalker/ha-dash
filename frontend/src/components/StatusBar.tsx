import { useState, useEffect } from 'react';
import { useEntityStore } from '../store/entityStore';
import { useHaEntity } from '../hooks/useHaEntities';
import { useDashboardStore } from '../store/dashboardStore';
import Icon from '@mdi/react';
import {
  mdiCircle, mdiWeatherSunny, mdiWeatherCloudy, mdiWeatherRainy,
  mdiWeatherSnowy, mdiWeatherFog, mdiWeatherWindy, mdiWeatherNight,
  mdiWeatherPartlyCloudy, mdiThermometer, mdiWifi, mdiWifiOff,
} from '@mdi/js';

const WEATHER_ICONS: Record<string, string> = {
  sunny: mdiWeatherSunny,
  'clear-night': mdiWeatherNight,
  cloudy: mdiWeatherCloudy,
  partlycloudy: mdiWeatherPartlyCloudy,
  rainy: mdiWeatherRainy,
  snowy: mdiWeatherSnowy,
  fog: mdiWeatherFog,
  windy: mdiWeatherWindy,
};

/**
 * Bottom status bar for kiosk mode.
 * Shows: clock, weather summary, connection status, entity count.
 */
export default function StatusBar() {
  const [time, setTime] = useState(new Date());
  const connectionStatus = useEntityStore((s) => s.connectionStatus);
  const entities = useEntityStore((s) => s.entities);
  const mode = useDashboardStore((s) => s.mode);

  // Find weather entity automatically
  const weatherEntityId = Object.keys(entities).find((id) => id.startsWith('weather.'));
  const { entity: weatherEntity } = useHaEntity(weatherEntityId);

  // Find indoor temp sensor
  const tempEntityId = Object.keys(entities).find(
    (id) => id.includes('temperature') && id.startsWith('sensor.')
  );
  const { entity: tempEntity } = useHaEntity(tempEntityId);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Hide in edit mode to save space
  if (mode === 'edit') return null;

  const weatherState = weatherEntity?.state as string | undefined;
  const weatherIcon = weatherState ? WEATHER_ICONS[weatherState] || mdiWeatherSunny : null;
  const weatherTemp = weatherEntity?.attributes?.temperature as number | undefined;
  const indoorTemp = tempEntity?.state;

  const isConnected = connectionStatus === 'connected';
  const entityCount = Object.keys(entities).length;

  return (
    <div
      className="flex items-center justify-between px-4 py-1.5 text-xs shrink-0"
      style={{
        background: 'var(--color-surface-primary)',
        borderTop: '1px solid var(--color-border-primary)',
        color: 'var(--color-text-tertiary)',
      }}
    >
      {/* Left: Clock */}
      <div className="flex items-center gap-3">
        <span className="font-medium tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span>{time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
      </div>

      {/* Center: Weather */}
      <div className="flex items-center gap-3">
        {weatherIcon && (
          <div className="flex items-center gap-1">
            <Icon path={weatherIcon} size={0.6} color="var(--color-text-secondary)" />
            <span>{weatherTemp != null ? `${Math.round(weatherTemp)}°` : weatherState}</span>
          </div>
        )}
        {indoorTemp && (
          <div className="flex items-center gap-1">
            <Icon path={mdiThermometer} size={0.5} color="var(--color-text-tertiary)" />
            <span>Indoor {indoorTemp}°</span>
          </div>
        )}
      </div>

      {/* Right: Connection + entities */}
      <div className="flex items-center gap-3">
        <span>{entityCount} entities</span>
        <div className="flex items-center gap-1">
          <Icon
            path={isConnected ? mdiWifi : mdiWifiOff}
            size={0.5}
            color={isConnected ? 'var(--color-success)' : 'var(--color-error)'}
          />
          <Icon
            path={mdiCircle}
            size={0.3}
            color={isConnected ? 'var(--color-success)' : 'var(--color-error)'}
          />
        </div>
      </div>
    </div>
  );
}

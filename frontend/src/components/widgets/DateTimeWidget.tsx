import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { getIconByName } from '../../utils/haIcons';
import type { WidgetProps } from '../../types/widget';

/**
 * Date/Time display — shows current date and time.
 * No entity required. Configurable format options.
 */
export default function DateTimeWidget({ config }: WidgetProps) {
  const [now, setNow] = useState(new Date());
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accentColor = (config.accentColor as string) || 'var(--color-accent)';
  const hideLabel = config.hideLabel as boolean;
  const show24h = config.use24h as boolean;
  const showSeconds = config.showSeconds as boolean;
  const showDate = config.showDate !== false; // default true

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...(showSeconds && { second: '2-digit' }),
    hour12: !show24h,
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };

  const timeStr = now.toLocaleTimeString(undefined, timeOptions);
  const dateStr = now.toLocaleDateString(undefined, dateOptions);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full rounded-card gap-1 p-3"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {!hideLabel && customIcon && (
        <Icon path={customIcon} size={0.8} color={accentColor} />
      )}

      <span className="text-3xl font-bold font-mono tabular-nums" style={{ color: 'var(--color-text-primary)' }}>
        {timeStr}
      </span>

      {showDate && (
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {dateStr}
        </span>
      )}
    </div>
  );
}

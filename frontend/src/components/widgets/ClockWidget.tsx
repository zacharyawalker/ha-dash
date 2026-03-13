import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiClockOutline } from '../../utils/icons';
import { getIconByName } from '../../utils/haIcons';
import type { WidgetProps } from '../../types/widget';

export default function ClockWidget({ config }: WidgetProps) {
  const [now, setNow] = useState(new Date());
  const showDate = config.showDate !== false;
  const showSeconds = config.showSeconds === true;
  const use24h = config.use24h === true;
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accentColor = config.accentColor as string | undefined;

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: !use24h,
  });

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full rounded-card"
      style={{ background: 'var(--color-surface-secondary)' }}
    >
      {config.showIcon !== false && (
        <Icon path={customIcon || mdiClockOutline} size={0.8} color={accentColor || 'var(--color-text-tertiary)'} />
      )}
      <div className="text-2xl font-bold mt-1" style={{ color: accentColor || 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {timeStr}
      </div>
      {showDate && (
        <div className="mt-1" style={{ fontSize: 'var(--text-widget-label)', color: 'var(--color-text-secondary)' }}>
          {dateStr}
        </div>
      )}
      {config.label && (
        <div className="mt-1" style={{ fontSize: 'var(--text-widget-label)', color: 'var(--color-text-tertiary)' }}>
          {String(config.label)}
        </div>
      )}
    </div>
  );
}

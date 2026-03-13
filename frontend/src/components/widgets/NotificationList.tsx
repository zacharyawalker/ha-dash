import { useMemo } from 'react';
import { useEntityStore } from '../../store/entityStore';
import Icon from '@mdi/react';
import { mdiBell, mdiBellOff } from '@mdi/js';
import type { WidgetProps } from '../../types/widget';

/**
 * Notification list widget — shows persistent_notification entities.
 * Displays the message and creation time for each active notification.
 */
export default function NotificationList({ config }: WidgetProps) {
  const entities = useEntityStore((s) => s.entities);
  const hideLabel = config.hideLabel as boolean;
  const accent = (config.accentColor as string) || '#f59e0b';

  const notifications = useMemo(() => {
    return Object.values(entities)
      .filter((e) => e.entity_id.startsWith('persistent_notification.'))
      .filter((e) => e.state !== 'unavailable')
      .sort((a, b) => {
        const da = new Date(a.attributes?.created_at as string || 0).getTime();
        const db = new Date(b.attributes?.created_at as string || 0).getTime();
        return db - da;
      });
  }, [entities]);

  const formatTime = (iso: string): string => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col w-full h-full rounded-card overflow-hidden"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {!hideLabel && (
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
          <Icon path={mdiBell} size={0.6} color={accent} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
            Notifications
          </span>
          {notifications.length > 0 && (
            <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: `${accent}25`, color: accent }}>
              {notifications.length}
            </span>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto" data-scrollable>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-xs"
            style={{ color: 'var(--color-text-tertiary)' }}>
            <Icon path={mdiBellOff} size={1.5} color="var(--color-text-tertiary)" />
            No notifications
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.entity_id} className="px-3 py-2" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {(n.attributes?.title as string) || 'Notification'}
                </span>
                <span className="text-xs shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
                  {formatTime(n.attributes?.created_at as string || '')}
                </span>
              </div>
              <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                {(n.attributes?.message as string) || n.state}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

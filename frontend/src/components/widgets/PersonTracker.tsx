import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { mdiHome, mdiMapMarker, mdiAccountCircle } from '@mdi/js';
import type { WidgetProps } from '../../types/widget';

export default function PersonTracker({ config }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const accentColor = config.accentColor as string | undefined;
  const hideLabel = config.hideLabel as boolean;

  if (!entity) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>
        {config.entityId ? 'Loading...' : 'No entity'}
      </div>
    );
  }

  const isHome = entity.state === 'home';
  const location = entity.state;
  const entityPic = entity.attributes?.entity_picture as string | undefined;
  const label = String(config.label || entity.attributes?.friendly_name || config.entityId || 'Person');

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full rounded-card gap-2"
      style={{
        background: isHome ? 'var(--color-success-muted)' : 'var(--color-surface-secondary)',
        border: isHome ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid transparent',
      }}
    >
      {entityPic ? (
        <img src={entityPic} alt="" className="w-14 h-14 rounded-full object-cover"
          style={{ border: `2px solid ${isHome ? 'var(--color-success)' : 'var(--color-text-tertiary)'}` }} />
      ) : (
        <Icon path={mdiAccountCircle} size={2.5} color={isHome ? 'var(--color-success)' : 'var(--color-text-tertiary)'} />
      )}

      {!hideLabel && (
        <span className="font-medium" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
          {label}
        </span>
      )}

      <div className="flex items-center gap-1">
        <Icon path={isHome ? mdiHome : mdiMapMarker} size={0.5}
          color={accentColor || (isHome ? 'var(--color-success)' : 'var(--color-text-secondary)')} />
        <span className="text-xs capitalize" style={{ color: isHome ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
          {location}
        </span>
      </div>
    </div>
  );
}

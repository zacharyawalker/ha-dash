import { useState, useEffect } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { mdiCctv, mdiRefresh } from '@mdi/js';
import type { WidgetProps } from '../../types/widget';

/**
 * Camera feed widget — shows a camera entity's still image.
 * Refreshes periodically.
 */
export default function CameraFeed({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshInterval = ((config.refreshSeconds as number) || 10) * 1000;
  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Camera');
  const hideLabel = config.hideLabel as boolean;

  // Get camera image URL from entity picture
  const entityPicture = entity?.attributes?.entity_picture as string | undefined;
  // Build image URL - HA provides relative paths like /api/camera_proxy/camera.xxx
  const imageUrl = entityPicture
    ? `${entityPicture}${entityPicture.includes('?') ? '&' : '?'}t=${refreshKey}`
    : null;

  useEffect(() => {
    if (!config.entityId || mode === 'edit') return;
    const interval = setInterval(() => setRefreshKey((k) => k + 1), refreshInterval);
    return () => clearInterval(interval);
  }, [config.entityId, refreshInterval, mode]);

  if (!config.entityId) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>
        <Icon path={mdiCctv} size={2} color="var(--color-text-tertiary)" />
        <span className="mt-2 text-sm">Select a camera entity</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-card overflow-hidden" style={{ background: 'var(--color-surface-secondary)' }}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={label}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <Icon path={mdiCctv} size={2} color="var(--color-text-tertiary)" />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-1"
        style={{ background: 'linear-gradient(rgba(0,0,0,0.5), transparent)' }}>
        {!hideLabel && (
          <span className="text-xs font-medium text-white">{label}</span>
        )}
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="p-1 rounded-full hover:bg-white/20 transition-colors"
          disabled={mode === 'edit'}
        >
          <Icon path={mdiRefresh} size={0.5} color="white" />
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiLock, mdiLockOpen, mdiShieldAlert } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import type { WidgetProps } from '../../types/widget';

export default function LockControl({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const [confirming, setConfirming] = useState(false);
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
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

  const isLocked = entity.state === 'locked';
  const isJammed = entity.state === 'jammed';
  const label = String(config.label || entity.attributes?.friendly_name || config.entityId || 'Lock');

  const handleToggle = async () => {
    if (mode === 'edit' || !config.entityId) return;

    // Require confirmation to unlock
    if (isLocked && !confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 5000);
      return;
    }

    try {
      await callService('lock', isLocked ? 'unlock' : 'lock', { entity_id: config.entityId });
      setConfirming(false);
    } catch (e) {
      console.error('[LockControl]', e);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="flex flex-col items-center justify-center w-full h-full rounded-card transition-all gap-2"
      style={{
        background: isJammed
          ? 'var(--color-error-muted)'
          : confirming
            ? 'var(--color-warning-muted)'
            : isLocked
              ? 'var(--color-success-muted)'
              : 'var(--color-error-muted)',
        border: isJammed
          ? '1px solid var(--color-error)'
          : confirming
            ? '1px solid var(--color-warning)'
            : isLocked
              ? '1px solid rgba(34, 197, 94, 0.3)'
              : '1px solid rgba(239, 68, 68, 0.3)',
        cursor: mode === 'edit' ? 'grab' : 'pointer',
      }}
    >
      <Icon
        path={customIcon || (isJammed ? mdiShieldAlert : isLocked ? mdiLock : mdiLockOpen)}
        size={1.8}
        color={isJammed ? 'var(--color-error)' : accentColor || (isLocked ? 'var(--color-success)' : 'var(--color-error)')}
      />
      {!hideLabel && (
        <span className="font-medium" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
          {label}
        </span>
      )}
      <span className="text-xs" style={{ color: confirming ? 'var(--color-warning)' : isLocked ? 'var(--color-success)' : 'var(--color-error)' }}>
        {confirming ? 'Tap again to unlock' : isJammed ? 'Jammed!' : isLocked ? 'Locked' : 'Unlocked'}
      </span>
    </button>
  );
}

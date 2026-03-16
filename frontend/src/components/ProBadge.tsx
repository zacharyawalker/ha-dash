import Icon from '@mdi/react';
import { mdiStar } from '@mdi/js';

/**
 * Small "PRO" badge shown next to premium features.
 * Only renders when the feature requires pro and user is on free tier.
 */
export function ProBadge({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'text-[9px] px-1 py-0.5' : 'text-[10px] px-1.5 py-0.5';
  return (
    <span className={`inline-flex items-center gap-0.5 ${s} rounded font-bold`}
      style={{ background: '#f59e0b20', color: '#f59e0b' }}>
      <Icon path={mdiStar} size={size === 'sm' ? 0.3 : 0.4} />
      PRO
    </span>
  );
}

/**
 * Overlay shown when a free user tries to use a pro feature.
 */
export function ProGate({ children, feature }: { children: React.ReactNode; feature: string }) {
  return (
    <div className="relative">
      <div style={{ opacity: 0.4, pointerEvents: 'none' }}>{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg"
          style={{ background: 'var(--color-surface-primary)', border: '1px solid #f59e0b30' }}>
          <ProBadge size="md" />
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {feature} requires Pro
          </span>
        </div>
      </div>
    </div>
  );
}

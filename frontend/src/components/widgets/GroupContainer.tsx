import Icon from '@mdi/react';
import { mdiViewGrid } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import type { WidgetProps } from '../../types/widget';

/**
 * Visual grouping container — provides a labeled card area
 * that other widgets can be placed on top of visually.
 * Acts as a decorative background section.
 */
export default function GroupContainer({ config }: WidgetProps) {
  const accent = (config.accentColor as string) || 'var(--color-accent)';
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const hideLabel = config.hideLabel as boolean;
  const title = String(config.label || 'Group');
  const showBorder = config.showBorder !== false;
  const bgOpacity = (config.bgOpacity as number) ?? 60;

  return (
    <div
      className="w-full h-full rounded-xl flex flex-col"
      style={{
        background: `var(--color-surface-secondary)`,
        opacity: bgOpacity / 100,
        border: showBorder ? `1px solid var(--color-border-secondary)` : 'none',
        boxShadow: showBorder ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
      }}
    >
      {!hideLabel && (
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: showBorder ? '1px solid var(--color-border-primary)' : 'none' }}>
          <Icon path={customIcon || mdiViewGrid} size={0.6} color={accent} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>
            {title}
          </span>
        </div>
      )}
    </div>
  );
}

import Icon from '@mdi/react';
import { getIconByName } from '../../utils/haIcons';
import type { WidgetProps } from '../../types/widget';

/**
 * Section header widget — title bar for organizing dashboard areas.
 * Supports custom icon, accent color, and alignment.
 */
export default function SectionHeader({ config }: WidgetProps) {
  const accent = (config.accentColor as string) || 'var(--color-accent)';
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const title = String(config.label || 'Section');
  const subtitle = String(config.subtitle || '');
  const align = (config.align as string) || 'left';
  const showLine = config.showLine !== false;
  const size = (config.fontSize as string) || 'medium';

  const sizeMap: Record<string, { title: string; subtitle: string; icon: number }> = {
    small: { title: '0.875rem', subtitle: '0.7rem', icon: 0.6 },
    medium: { title: '1.1rem', subtitle: '0.8rem', icon: 0.8 },
    large: { title: '1.5rem', subtitle: '0.9rem', icon: 1 },
  };
  const s = sizeMap[size] || sizeMap.medium;

  return (
    <div
      className="flex flex-col justify-center w-full h-full px-3"
      style={{ textAlign: align as CanvasTextAlign }}
    >
      <div className={`flex items-center gap-2 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : ''}`}>
        {customIcon && <Icon path={customIcon} size={s.icon} color={accent} />}
        <span className="font-bold" style={{ fontSize: s.title, color: 'var(--color-text-primary)' }}>
          {title}
        </span>
      </div>
      {subtitle && (
        <span style={{ fontSize: s.subtitle, color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
          {subtitle}
        </span>
      )}
      {showLine && (
        <div className="mt-2 h-px w-full" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      )}
    </div>
  );
}

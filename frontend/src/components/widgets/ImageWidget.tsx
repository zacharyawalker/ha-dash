import type { WidgetProps } from '../../types/widget';

/**
 * Static image widget — display floor plans, logos, backgrounds.
 */
export default function ImageWidget({ config }: WidgetProps) {
  const url = String(config.imageUrl || '');
  const fit = (config.objectFit as string) || 'cover';
  const borderRadius = (config.borderRadius as number) ?? 12;
  const opacity = (config.imageOpacity as number) ?? 100;
  const caption = String(config.label || '');
  const hideLabel = config.hideLabel as boolean;

  if (!url) {
    return (
      <div
        className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}
      >
        Set image URL in config
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: `${borderRadius}px` }}>
      <img
        src={url}
        alt={caption}
        className="w-full h-full"
        style={{
          objectFit: fit as 'cover' | 'contain' | 'fill',
          opacity: opacity / 100,
        }}
        draggable={false}
      />
      {caption && !hideLabel && (
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-2 text-xs font-medium"
          style={{
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            color: 'white',
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}

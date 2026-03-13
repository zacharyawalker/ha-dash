import type { WidgetProps } from '../../types/widget';

/**
 * Iframe embed widget — embed Grafana, external dashboards, etc.
 */
export default function IframeEmbed({ config, mode }: WidgetProps) {
  const url = String(config.url || '');
  const label = String(config.label || 'Embed');

  if (!url) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-widget-title)' }}>
        Set URL in config panel
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-card overflow-hidden" style={{ background: 'var(--color-surface-secondary)' }}>
      {mode === 'edit' ? (
        <div className="flex flex-col items-center justify-center w-full h-full gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{url}</span>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>(Preview in View mode)</span>
        </div>
      ) : (
        <iframe
          src={url}
          title={label}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      )}
    </div>
  );
}

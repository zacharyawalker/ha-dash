import type { WidgetProps } from '../../types/widget';

/**
 * Markdown / text block widget.
 * Renders plain text with basic formatting. No external markdown parser needed
 * for Phase 2 — just styled text content.
 */
export default function MarkdownBlock({ config }: WidgetProps) {
  const content = String(config.content || config.label || '');
  const fontSize = String(config.fontSize || '14');
  const textAlign = (config.textAlign as 'left' | 'center' | 'right') || 'center';
  const textColor = String(config.textColor || 'var(--color-text-primary)');
  const bgColor = String(config.bgColor || 'transparent');

  return (
    <div
      className="flex items-center justify-center w-full h-full rounded-card p-3 overflow-hidden"
      style={{
        background: bgColor === 'transparent' ? 'var(--color-surface-secondary)' : bgColor,
        textAlign,
      }}
    >
      <div
        className="w-full whitespace-pre-wrap break-words"
        style={{
          color: textColor,
          fontSize: `${fontSize}px`,
          lineHeight: '1.5',
        }}
      >
        {content || (
          <span style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
            Enter text in config panel
          </span>
        )}
      </div>
    </div>
  );
}

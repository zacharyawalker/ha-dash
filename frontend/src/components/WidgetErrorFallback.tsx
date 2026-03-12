import Icon from '@mdi/react';
import { mdiAlertCircle } from '@mdi/js';

/**
 * Fallback UI for a widget that errored.
 * Shows inline in the widget's space instead of breaking the whole dashboard.
 */
export default function WidgetErrorFallback({ error }: { error?: Error }) {
  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full rounded-card gap-2 p-3"
      style={{
        background: 'var(--color-error-muted)',
        border: '1px solid var(--color-error)',
      }}
    >
      <Icon path={mdiAlertCircle} size={1} color="var(--color-error)" />
      <span className="text-xs text-center" style={{ color: 'var(--color-error)' }}>
        Widget error
      </span>
      {error?.message && (
        <span className="text-xs text-center truncate w-full" style={{ color: 'var(--color-text-tertiary)' }}>
          {error.message}
        </span>
      )}
    </div>
  );
}

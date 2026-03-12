import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiRobot } from '../../utils/icons';
import type { WidgetProps } from '../../types/widget';

export default function AutomationToggle({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const isOn = entity?.state === 'on';
  const lastTriggered = entity?.attributes?.last_triggered as string | undefined;

  const handleToggle = async () => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('automation', 'toggle', { entity_id: config.entityId });
    } catch (e) {
      console.error('[AutomationToggle] Failed:', e);
    }
  };

  const formatLastTriggered = (iso: string): string => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
      return d.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Automation');

  return (
    <button
      onClick={handleToggle}
      className="flex flex-col items-center justify-center w-full h-full rounded-card transition-all"
      style={{
        background: isOn
          ? 'var(--color-success-muted)'
          : 'var(--color-surface-secondary)',
        border: isOn ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid transparent',
        cursor: mode === 'edit' ? 'grab' : 'pointer',
      }}
    >
      <Icon
        path={mdiRobot}
        size={1.6}
        color={isOn ? 'var(--color-success)' : 'var(--color-text-tertiary)'}
      />
      <span className="mt-2 font-medium" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
        {label}
      </span>
      <span className="mt-0.5" style={{ fontSize: 'var(--text-widget-label)', color: isOn ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
        {isOn ? 'Enabled' : 'Disabled'}
      </span>
      {lastTriggered && (
        <span className="mt-0.5" style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
          {formatLastTriggered(lastTriggered)}
        </span>
      )}
    </button>
  );
}

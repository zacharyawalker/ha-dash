import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiToggleSwitch, mdiToggleSwitchOff } from '../../utils/icons';
import type { WidgetProps } from '../../types/widget';

export default function SwitchToggle({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const isOn = entity?.state === 'on';
  const domain = config.entityId?.split('.')[0] || 'switch';

  const handleToggle = async () => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService(domain, 'toggle', { entity_id: config.entityId });
    } catch (e) {
      console.error('[SwitchToggle] Failed:', e);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="flex flex-col items-center justify-center w-full h-full rounded-card transition-all"
      style={{
        background: isOn
          ? 'var(--color-accent-muted)'
          : 'var(--color-surface-secondary)',
        border: isOn ? '1px solid var(--color-accent)' : '1px solid transparent',
        cursor: mode === 'edit' ? 'grab' : 'pointer',
      }}
    >
      <Icon
        path={isOn ? mdiToggleSwitch : mdiToggleSwitchOff}
        size={1.8}
        color={isOn ? 'var(--color-accent)' : 'var(--color-text-secondary)'}
      />
      <span
        className="mt-2 font-medium"
        style={{
          fontSize: 'var(--text-widget-title)',
          color: isOn ? 'var(--color-accent)' : 'var(--color-text-primary)',
        }}
      >
        {String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Switch')}
      </span>
    </button>
  );
}

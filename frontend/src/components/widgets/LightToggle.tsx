import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiLightbulb, mdiLightbulbOff } from '@mdi/js';
import type { WidgetProps } from '../../types/widget';

export default function LightToggle({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const isOn = entity?.state === 'on';

  const handleToggle = async () => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('light', 'toggle', { entity_id: config.entityId });
    } catch (e) {
      console.error('[LightToggle] Failed to toggle light:', e);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="flex flex-col items-center justify-center w-full h-full rounded-card transition-all"
      style={{
        background: isOn
          ? 'linear-gradient(135deg, #fbbf24 0%, var(--color-state-on) 100%)'
          : 'var(--color-surface-secondary)',
        cursor: mode === 'edit' ? 'grab' : 'pointer',
      }}
    >
      <Icon
        path={isOn ? mdiLightbulb : mdiLightbulbOff}
        size={1.8}
        color={isOn ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)'}
      />
      <span
        className="mt-2 font-medium"
        style={{
          fontSize: 'var(--text-widget-title)',
          color: isOn ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
        }}
      >
        {String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Light')}
      </span>
    </button>
  );
}

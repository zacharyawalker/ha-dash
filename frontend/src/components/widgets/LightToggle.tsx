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
      // No manual refetch needed — state update arrives via WebSocket
    } catch (e) {
      console.error('[LightToggle] Failed to toggle light:', e);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="flex flex-col items-center justify-center w-full h-full rounded-xl transition-all"
      style={{
        background: isOn
          ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
          : 'rgba(255,255,255,0.05)',
        cursor: mode === 'edit' ? 'grab' : 'pointer',
      }}
    >
      <Icon
        path={isOn ? mdiLightbulb : mdiLightbulbOff}
        size={1.8}
        color={isOn ? '#1c1c1c' : '#888'}
      />
      <span
        className="mt-2 text-sm font-medium"
        style={{ color: isOn ? '#1c1c1c' : '#ccc' }}
      >
        {String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Light')}
      </span>
    </button>
  );
}

import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiLightbulb, mdiLightbulbOff, mdiToggleSwitch, mdiToggleSwitchOff } from '@mdi/js';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

function EntityButton({ entityId, mode }: { entityId: string; mode: 'edit' | 'view' }) {
  const { entity } = useHaEntity(entityId);
  if (!entity) return null;

  const isOn = entity.state === 'on';
  const domain = entityId.split('.')[0];
  const name = (entity.attributes?.friendly_name as string) || entityId.split('.')[1];
  const isLight = domain === 'light';

  const toggle = async () => {
    if (mode === 'edit') return;
    try {
      await callService(domain, 'toggle', { entity_id: entityId });
    } catch (e) {
      console.error('[ButtonRow]', e);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={toggle}
      disabled={mode === 'edit'}
      className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all flex-1 min-w-0"
      style={{
        background: isOn ? 'var(--color-accent-muted)' : 'var(--color-surface-tertiary)',
        border: isOn ? '1px solid var(--color-accent)' : '1px solid transparent',
        cursor: mode === 'edit' ? 'grab' : 'pointer',
      }}
    >
      <Icon
        path={isLight ? (isOn ? mdiLightbulb : mdiLightbulbOff) : (isOn ? mdiToggleSwitch : mdiToggleSwitchOff)}
        size={0.7}
        color={isOn ? 'var(--color-accent)' : 'var(--color-text-tertiary)'}
      />
      <span className="text-xs truncate w-full text-center" style={{
        color: isOn ? 'var(--color-accent)' : 'var(--color-text-secondary)',
      }}>
        {name}
      </span>
    </motion.button>
  );
}

/**
 * Button Row — horizontal strip of toggleable entities.
 * Great for room light groups or quick scene-like layouts.
 */
export default function ButtonRow({ config, mode }: WidgetProps) {
  const hideLabel = config.hideLabel as boolean;
  const title = String(config.label || '');

  const entityIds = [
    config.entity1, config.entity2, config.entity3,
    config.entity4, config.entity5, config.entity6,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col w-full h-full rounded-card p-2 gap-1.5"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {!hideLabel && title && (
        <span className="text-xs font-medium px-1" style={{ color: 'var(--color-text-secondary)' }}>
          {title}
        </span>
      )}

      <div className="flex gap-1.5 flex-1">
        {entityIds.map((id) => (
          <EntityButton key={id} entityId={id} mode={mode} />
        ))}
      </div>
    </div>
  );
}

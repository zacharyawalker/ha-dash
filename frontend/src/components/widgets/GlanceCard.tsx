import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { getEntityIcon } from '../../utils/icons';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

function GlanceItem({ entityId, mode, accent }: { entityId: string; mode: 'edit' | 'view'; accent: string }) {
  const { entity } = useHaEntity(entityId);
  if (!entity) return null;

  const isOn = entity.state === 'on';
  const domain = entityId.split('.')[0];
  const name = (entity.attributes?.friendly_name as string) || entityId.split('.')[1];
  const unit = (entity.attributes?.unit_of_measurement as string) || '';
  const toggleable = ['light', 'switch', 'input_boolean', 'fan', 'automation'].includes(domain);

  const icon = getEntityIcon(domain, entity.attributes?.device_class as string | undefined, entity.state);
  const stateText = toggleable ? (isOn ? 'On' : 'Off') : `${entity.state}${unit ? ` ${unit}` : ''}`;

  const handleClick = async () => {
    if (mode === 'edit' || !toggleable) return;
    try {
      await callService(domain, 'toggle', { entity_id: entityId });
    } catch (e) {
      console.error('[GlanceCard]', e);
    }
  };

  return (
    <motion.button
      whileTap={toggleable ? { scale: 0.9 } : {}}
      onClick={handleClick}
      disabled={mode === 'edit' || !toggleable}
      className="flex flex-col items-center gap-0.5 flex-1 min-w-0 py-1"
      style={{ cursor: toggleable && mode !== 'edit' ? 'pointer' : 'default' }}
    >
      <Icon path={icon} size={0.8} color={isOn ? accent : 'var(--color-text-tertiary)'} />
      <span className="text-xs truncate w-full text-center" style={{ color: 'var(--color-text-secondary)' }}>
        {name}
      </span>
      <span className="text-xs font-semibold" style={{ color: isOn ? accent : 'var(--color-text-tertiary)' }}>
        {stateText}
      </span>
    </motion.button>
  );
}

/**
 * Glance card — compact multi-entity overview.
 * Each entity shows an icon + name + state in a row.
 * Toggleable entities can be clicked.
 */
export default function GlanceCard({ config, mode }: WidgetProps) {
  const accent = (config.accentColor as string) || 'var(--color-accent)';
  const hideLabel = config.hideLabel as boolean;
  const title = String(config.label || '');

  const entityIds = [
    config.entity1, config.entity2, config.entity3,
    config.entity4, config.entity5, config.entity6,
    config.entity7, config.entity8,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col w-full h-full rounded-card p-2 gap-1"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {!hideLabel && title && (
        <span className="text-xs font-semibold px-1" style={{ color: accent }}>
          {title}
        </span>
      )}

      <div className="flex items-center flex-1 gap-0.5">
        {entityIds.map((id) => (
          <GlanceItem key={id} entityId={id} mode={mode} accent={accent} />
        ))}
      </div>
    </div>
  );
}

import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { mdiInformation } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import { callService } from '../../api/client';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

/**
 * Universal state card — shows entity state with configurable appearance.
 * Works with ANY entity type. Highly configurable through the config panel.
 * Can toggle entities that support it.
 */
export default function StateCard({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accent = (config.accentColor as string) || 'var(--color-accent)';
  const hideLabel = config.hideLabel as boolean;
  const compact = config.compactMode as boolean;

  const state = entity?.state || '—';
  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Entity');
  const unit = String(config.unit || entity?.attributes?.unit_of_measurement || '');

  // Determine if entity is toggleable
  const domain = config.entityId?.split('.')[0];
  const toggleable = ['light', 'switch', 'input_boolean', 'fan', 'automation', 'script'].includes(domain || '');

  const handleTap = async () => {
    if (mode === 'edit' || !config.entityId || !toggleable) return;
    try {
      await callService(domain!, 'toggle', { entity_id: config.entityId });
    } catch (e) {
      console.error('[StateCard]', e);
    }
  };

  const isOn = state === 'on';
  const isActive = isOn || state === 'home' || state === 'open' || state === 'playing';

  return (
    <motion.div
      onClick={handleTap}
      whileTap={toggleable && mode !== 'edit' ? { scale: 0.95 } : undefined}
      className={`flex ${compact ? 'flex-row gap-3 px-4' : 'flex-col'} items-center justify-center w-full h-full rounded-card transition-all`}
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${typeof accent === 'string' && accent.startsWith('#') ? accent + '15' : 'var(--color-accent-muted)'} 0%, var(--color-surface-secondary) 100%)`
          : 'var(--color-surface-secondary)',
        cursor: toggleable && mode !== 'edit' ? 'pointer' : mode === 'edit' ? 'grab' : 'default',
        border: isActive ? `1px solid ${typeof accent === 'string' && accent.startsWith('#') ? accent + '33' : 'var(--color-accent)'}` : '1px solid transparent',
      }}
    >
      {customIcon && (
        <Icon
          path={customIcon}
          size={compact ? 1 : 1.5}
          color={isActive ? accent : 'var(--color-text-secondary)'}
        />
      )}
      {!customIcon && (
        <Icon
          path={mdiInformation}
          size={compact ? 1 : 1.5}
          color={isActive ? accent : 'var(--color-text-secondary)'}
        />
      )}
      <div className={`${compact ? '' : 'mt-2'} text-center`}>
        <span className="font-bold block" style={{ fontSize: 'var(--text-widget-value)', color: 'var(--color-text-primary)' }}>
          {state}{unit && <span className="text-sm ml-1" style={{ color: 'var(--color-text-tertiary)' }}>{unit}</span>}
        </span>
        {!hideLabel && (
          <span className="text-xs mt-0.5 block" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        )}
      </div>
    </motion.div>
  );
}

import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiRobot, mdiRobotOff } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

export default function AutomationToggle({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const isOn = entity?.state === 'on';
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accent = (config.accentColor as string) || 'var(--color-accent)';
  const hideLabel = config.hideLabel as boolean;
  const compact = config.compactMode as boolean;

  const handleToggle = async () => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('automation', 'toggle', { entity_id: config.entityId });
    } catch (e) {
      console.error('[AutomationToggle]', e);
    }
  };

  const iconPath = customIcon || (isOn ? mdiRobot : mdiRobotOff);
  const label = String(config.label || entity?.attributes?.friendly_name || config.entityId || 'Automation');

  return (
    <motion.button
      onClick={handleToggle}
      whileTap={mode !== 'edit' ? { scale: 0.95 } : undefined}
      className={`flex ${compact ? 'flex-row gap-3 px-4' : 'flex-col'} items-center justify-center w-full h-full rounded-card transition-all`}
      style={{
        background: isOn ? 'var(--color-surface-secondary)' : 'var(--color-surface-secondary)',
        cursor: mode === 'edit' ? 'grab' : 'pointer',
        border: isOn ? `1px solid ${typeof accent === 'string' && accent.startsWith('#') ? accent + '44' : 'rgba(74, 158, 255, 0.2)'}` : '1px solid transparent',
      }}
    >
      <motion.div
        animate={isOn ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Icon path={iconPath} size={compact ? 1.2 : 1.8} color={isOn ? accent : 'var(--color-text-tertiary)'} />
      </motion.div>
      {!hideLabel && (
        <div className={`${compact ? '' : 'mt-2'} text-center`}>
          <span className="font-medium" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>{label}</span>
          <span className="text-xs block mt-0.5" style={{ color: isOn ? accent : 'var(--color-text-tertiary)' }}>
            {isOn ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      )}
    </motion.button>
  );
}

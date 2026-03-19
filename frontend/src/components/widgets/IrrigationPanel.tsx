import { useCallback } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiSprinkler, mdiSprinklerFire, mdiStop, mdiWeatherRainy } from '@mdi/js';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

function ZoneButton({ entityId, mode, accent }: { entityId: string; mode: 'edit' | 'view'; accent: string }) {
  const { entity } = useHaEntity(entityId);
  if (!entity) return null;

  const isOn = entity.state === 'on';
  const name = (entity.attributes?.friendly_name as string) || entityId;
  const zoneNum = entity.attributes?.zone as number | undefined;
  const domain = entityId.split('.')[0];

  const toggle = async () => {
    if (mode === 'edit') return;
    try {
      await callService(domain, isOn ? 'turn_off' : 'turn_on', { entity_id: entityId });
    } catch (e) {
      console.error('[IrrigationPanel]', e);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      disabled={mode === 'edit'}
      className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all"
      style={{
        background: isOn ? `${accent}20` : 'var(--color-surface-tertiary)',
        border: `1px solid ${isOn ? accent + '50' : 'transparent'}`,
        cursor: mode === 'edit' ? 'grab' : 'pointer',
      }}
    >
      <motion.div animate={isOn ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1, repeat: Infinity }}>
        <Icon path={isOn ? mdiSprinklerFire : mdiSprinkler} size={0.8} color={isOn ? accent : 'var(--color-text-tertiary)'} />
      </motion.div>
      <span className="text-xs font-medium truncate w-full text-center"
        style={{ color: isOn ? accent : 'var(--color-text-secondary)' }}>
        {zoneNum != null ? `Zone ${zoneNum}` : name.replace(/^Rain Bird /, '')}
      </span>
      <span className="text-xs" style={{ color: isOn ? accent : 'var(--color-text-tertiary)' }}>
        {isOn ? 'ON' : 'OFF'}
      </span>
    </motion.button>
  );
}

/**
 * Multi-zone irrigation panel.
 * Shows all irrigation zones in a grid with quick toggle.
 * Auto-discovers zones or uses manually specified entities.
 */
export default function IrrigationPanel({ config, mode }: WidgetProps) {
  const accentColor = (config.accentColor as string) || '#22c55e';
  const hideLabel = config.hideLabel as boolean;
  const title = String(config.label || 'Irrigation');
  
  // Get rain sensor if configured
  const { entity: rainSensor } = useHaEntity(config.rainSensorId as string | undefined);
  const isRaining = rainSensor?.state === 'on';

  // Collect zone entity IDs from config
  const zoneIds = [
    config.zone1, config.zone2, config.zone3, config.zone4,
    config.zone5, config.zone6, config.zone7, config.zone8,
    config.zone9, config.zone10, config.zone11, config.zone12,
  ].filter(Boolean) as string[];

  const stopAll = useCallback(async () => {
    if (mode === 'edit') return;
    try {
      for (const id of zoneIds) {
        const domain = id.split('.')[0];
        await callService(domain, 'turn_off', { entity_id: id });
      }
    } catch (e) {
      console.error('[IrrigationPanel] Stop all failed:', e);
    }
  }, [zoneIds, mode]);

  return (
    <div className="flex flex-col w-full h-full rounded-card overflow-hidden"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
        <div className="flex items-center gap-2">
          <Icon path={mdiSprinkler} size={0.7} color={accentColor} />
          {!hideLabel && (
            <span className="text-sm font-semibold" style={{ color: accentColor }}>{title}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isRaining && (
            <div className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
              style={{ background: '#4a9eff20', color: '#4a9eff' }}>
              <Icon path={mdiWeatherRainy} size={0.4} />
              Rain
            </div>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={stopAll}
            disabled={mode === 'edit'}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
            style={{ background: '#ef444420', color: '#ef4444' }}
          >
            <Icon path={mdiStop} size={0.4} />
            Stop All
          </motion.button>
        </div>
      </div>

      {/* Zone grid */}
      <div className="flex-1 grid grid-cols-4 gap-1.5 p-2 overflow-y-auto"
        style={{ gridAutoRows: 'min-content' }}>
        {zoneIds.map((id) => (
          <ZoneButton key={id} entityId={id} mode={mode} accent={accentColor} />
        ))}
      </div>

      {zoneIds.length === 0 && (
        <div className="flex items-center justify-center flex-1 text-xs"
          style={{ color: 'var(--color-text-tertiary)' }}>
          Configure zone entities in settings
        </div>
      )}
    </div>
  );
}

import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiCalendarClock, mdiPlay, mdiStop, mdiToggleSwitch, mdiToggleSwitchOff } from '@mdi/js';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

/**
 * Irrigation schedule control.
 * Enable/disable schedule automation + manual run/stop.
 */
export default function IrrigationSchedule({ config, mode }: WidgetProps) {
  const { entity: scheduleEntity } = useHaEntity(config.entityId as string | undefined);
  const { entity: runningEntity } = useHaEntity(config.runningEntityId as string | undefined);
  const { entity: scheduleSelect } = useHaEntity(config.scheduleSelectId as string | undefined);
  const { entity: lastRunEntity } = useHaEntity(config.lastRunEntityId as string | undefined);
  const accentColor = (config.accentColor as string) || '#22c55e';
  const hideLabel = config.hideLabel as boolean;
  const title = String(config.label || 'Schedule');

  const isEnabled = scheduleEntity?.state === 'on';
  const isRunning = runningEntity?.state === 'on';
  const currentSchedule = scheduleSelect?.state || '';
  const lastRun = lastRunEntity?.state || '';

  const toggleSchedule = async () => {
    if (mode === 'edit' || !config.entityId) return;
    const entityId = config.entityId as string;
    const domain = entityId.split('.')[0];
    try {
      await callService(domain, isEnabled ? 'turn_off' : 'turn_on', { entity_id: entityId });
    } catch (e) {
      console.error('[IrrigationSchedule]', e);
    }
  };

  const runSchedule = async () => {
    if (mode === 'edit' || !config.runAutomationId) return;
    try {
      await callService('automation', 'trigger', { entity_id: config.runAutomationId as string });
    } catch (e) {
      console.error('[IrrigationSchedule] Run failed:', e);
    }
  };

  return (
    <div className="flex flex-col w-full h-full rounded-card p-3 gap-3"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon path={mdiCalendarClock} size={0.8} color={accentColor} />
        {!hideLabel && (
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</span>
        )}
      </div>

      {/* Schedule toggle */}
      {scheduleEntity && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleSchedule}
          disabled={mode === 'edit'}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg"
          style={{
            background: isEnabled ? `${accentColor}15` : 'var(--color-surface-tertiary)',
            border: `1px solid ${isEnabled ? accentColor + '30' : 'transparent'}`,
            cursor: mode === 'edit' ? 'grab' : 'pointer',
          }}
        >
          <div className="flex items-center gap-2">
            <Icon
              path={isEnabled ? mdiToggleSwitch : mdiToggleSwitchOff}
              size={1}
              color={isEnabled ? accentColor : 'var(--color-text-tertiary)'}
            />
            <div className="text-left">
              <span className="text-xs font-medium block" style={{ color: 'var(--color-text-primary)' }}>
                Auto Schedule
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </motion.button>
      )}

      {/* Current schedule */}
      {currentSchedule && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Program:</span>
          <span className="text-xs font-semibold" style={{ color: accentColor }}>{currentSchedule}</span>
        </div>
      )}

      {/* Running status */}
      {isRunning && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
            <Icon path={mdiPlay} size={0.6} color={accentColor} />
          </motion.div>
          <span className="text-xs font-semibold" style={{ color: accentColor }}>
            Program Running
          </span>
        </div>
      )}

      {/* Run / Stop buttons */}
      <div className="flex gap-2">
        {!!config.runAutomationId && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={runSchedule}
            disabled={mode === 'edit' || isRunning}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium"
            style={{
              background: `${accentColor}20`,
              color: accentColor,
              opacity: isRunning ? 0.5 : 1,
            }}
          >
            <Icon path={mdiPlay} size={0.5} />
            Run Now
          </motion.button>
        )}
        {isRunning && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleSchedule}
            disabled={mode === 'edit'}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium"
            style={{ background: '#ef444420', color: '#ef4444' }}
          >
            <Icon path={mdiStop} size={0.5} />
            Stop
          </motion.button>
        )}
      </div>

      {/* Last run */}
      {lastRun && lastRun !== 'unknown' && (
        <div className="text-xs px-2" style={{ color: 'var(--color-text-tertiary)' }}>
          Last run: {lastRun}
        </div>
      )}
    </div>
  );
}

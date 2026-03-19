import { useCallback } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import {
  mdiCalendarClock, mdiPlay, mdiStop, mdiToggleSwitch, mdiToggleSwitchOff,
  mdiWeatherRainy, mdiClockOutline, mdiHistory, mdiCalendarRemove,
} from '@mdi/js';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

/**
 * Redesigned irrigation schedule control.
 * Master schedule toggle, program selector, rain delay, run history.
 */
export default function IrrigationSchedule({ config, mode }: WidgetProps) {
  const { entity: scheduleEntity } = useHaEntity(config.entityId as string | undefined);
  const { entity: runningEntity } = useHaEntity(config.runningEntityId as string | undefined);
  const { entity: scheduleSelect } = useHaEntity(config.scheduleSelectId as string | undefined);
  const { entity: lastRunEntity } = useHaEntity(config.lastRunEntityId as string | undefined);
  const { entity: nextRunEntity } = useHaEntity(config.nextRunEntityId as string | undefined);
  const { entity: rainDelayEntity } = useHaEntity(config.rainDelayEntityId as string | undefined);
  const accentColor = (config.accentColor as string) || '#3b82f6';
  const hideLabel = config.hideLabel as boolean;
  const title = String(config.label || 'Irrigation Schedule');

  const isEnabled = scheduleEntity?.state === 'on';
  const isRunning = runningEntity?.state === 'on';
  const currentSchedule = scheduleSelect?.state || '';
  const scheduleOptions = (scheduleSelect?.attributes?.options as string[]) || [];
  const lastRun = lastRunEntity?.state || '';
  const nextRun = nextRunEntity?.state || '';
  const rainDelay = parseFloat(rainDelayEntity?.state || '0') || 0;

  const toggleSchedule = useCallback(async () => {
    if (mode === 'edit' || !config.entityId) return;
    const entityId = config.entityId as string;
    const domain = entityId.split('.')[0];
    try {
      await callService(domain, isEnabled ? 'turn_off' : 'turn_on', { entity_id: entityId });
    } catch (e) {
      console.error('[IrrigationSchedule]', e);
    }
  }, [config.entityId, mode, isEnabled]);

  const selectProgram = useCallback(async (program: string) => {
    if (mode === 'edit' || !config.scheduleSelectId) return;
    try {
      await callService('input_select', 'select_option', {
        entity_id: config.scheduleSelectId as string,
        option: program,
      });
    } catch (e) {
      console.error('[IrrigationSchedule]', e);
    }
  }, [config.scheduleSelectId, mode]);

  const runProgram = useCallback(async () => {
    if (mode === 'edit' || !config.runAutomationId) return;
    try {
      await callService('automation', 'trigger', { entity_id: config.runAutomationId as string });
    } catch (e) {
      console.error('[IrrigationSchedule]', e);
    }
  }, [config.runAutomationId, mode]);

  const setRainDelay = useCallback(async (days: number) => {
    if (mode === 'edit' || !config.rainDelayEntityId) return;
    try {
      await callService('number', 'set_value', {
        entity_id: config.rainDelayEntityId as string,
        value: days,
      });
    } catch (e) {
      console.error('[IrrigationSchedule]', e);
    }
  }, [config.rainDelayEntityId, mode]);

  return (
    <div className="flex flex-col w-full h-full rounded-card overflow-hidden"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5"
        style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
        <Icon path={mdiCalendarClock} size={0.7} color={accentColor} />
        {!hideLabel && (
          <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{title}</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* Master Schedule Toggle */}
        {scheduleEntity && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={toggleSchedule}
            disabled={mode === 'edit'}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl"
            style={{
              background: isEnabled ? `${accentColor}12` : 'var(--color-surface-tertiary)',
              border: `2px solid ${isEnabled ? accentColor + '30' : 'transparent'}`,
              cursor: mode === 'edit' ? 'grab' : 'pointer',
            }}
          >
            <div className="flex items-center gap-2.5">
              <Icon
                path={isEnabled ? mdiToggleSwitch : mdiToggleSwitchOff}
                size={1.2}
                color={isEnabled ? accentColor : 'var(--color-text-tertiary)'}
              />
              <div className="text-left">
                <span className="text-xs font-bold block" style={{ color: 'var(--color-text-primary)' }}>
                  Auto Schedule
                </span>
                <span className="text-[10px]" style={{ color: isEnabled ? accentColor : 'var(--color-text-tertiary)' }}>
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: isEnabled ? '#22c55e' : 'var(--color-text-tertiary)' }} />
          </motion.button>
        )}

        {/* Program Selector */}
        {scheduleOptions.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase px-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Program
            </span>
            <div className="flex gap-1.5">
              {scheduleOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => selectProgram(opt)}
                  disabled={mode === 'edit'}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: currentSchedule === opt ? `${accentColor}20` : 'var(--color-surface-tertiary)',
                    color: currentSchedule === opt ? accentColor : 'var(--color-text-secondary)',
                    border: `1px solid ${currentSchedule === opt ? accentColor + '40' : 'transparent'}`,
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Running indicator */}
        {isRunning && (
          <motion.div
            animate={{ borderColor: [`${accentColor}30`, `${accentColor}60`, `${accentColor}30`] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: `${accentColor}12`, border: `2px solid ${accentColor}30` }}
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              <Icon path={mdiPlay} size={0.6} color={accentColor} />
            </motion.div>
            <span className="text-xs font-bold" style={{ color: accentColor }}>Program Running</span>
          </motion.div>
        )}

        {/* Run / Stop */}
        <div className="flex gap-2">
          {!!config.runAutomationId && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={runProgram}
              disabled={mode === 'edit' || isRunning}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
              style={{
                background: accentColor,
                color: 'white',
                opacity: isRunning ? 0.4 : 1,
                cursor: mode === 'edit' || isRunning ? 'not-allowed' : 'pointer',
              }}
            >
              <Icon path={mdiPlay} size={0.5} />
              Run Now
            </motion.button>
          )}
          {isRunning && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleSchedule}
              disabled={mode === 'edit'}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
              style={{ background: '#ef4444', color: 'white' }}
            >
              <Icon path={mdiStop} size={0.5} />
              Stop
            </motion.button>
          )}
        </div>

        {/* Rain Delay */}
        {rainDelayEntity && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase px-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Rain Delay
            </span>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((days) => (
                <button
                  key={days}
                  onClick={() => setRainDelay(days)}
                  disabled={mode === 'edit'}
                  className="flex-1 flex flex-col items-center py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                  style={{
                    background: rainDelay === days ? '#3b82f620' : 'var(--color-surface-tertiary)',
                    color: rainDelay === days ? '#3b82f6' : 'var(--color-text-tertiary)',
                    border: `1px solid ${rainDelay === days ? '#3b82f640' : 'transparent'}`,
                  }}
                >
                  <Icon path={days === 0 ? mdiCalendarRemove : mdiWeatherRainy} size={0.4}
                    color={rainDelay === days ? '#3b82f6' : 'var(--color-text-tertiary)'} />
                  {days === 0 ? 'None' : `${days}d`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info footer */}
        <div className="space-y-1 pt-1" style={{ borderTop: '1px solid var(--color-border-primary)' }}>
          {nextRun && nextRun !== 'unknown' && (
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
              <Icon path={mdiClockOutline} size={0.35} />
              Next: {nextRun}
            </div>
          )}
          {lastRun && lastRun !== 'unknown' && (
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
              <Icon path={mdiHistory} size={0.35} />
              Last: {lastRun}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

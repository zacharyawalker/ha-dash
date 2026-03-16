import { useHaEntity } from '../../hooks/useHaEntities';
import Icon from '@mdi/react';
import { mdiEyeOff, mdiEye } from '@mdi/js';
import type { WidgetProps } from '../../types/widget';

/**
 * Conditional Card — shows different content based on entity state.
 * In edit mode, always visible with indicator. In view mode, shows/hides based on condition.
 * 
 * Use cases:
 * - Show "Door Open!" warning only when binary_sensor.front_door is on
 * - Show "Welcome Home" message when person.zach is home
 * - Show "Washing Done" when input_boolean.washer_done is on
 */
export default function ConditionalCard({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const accentColor = (config.accentColor as string) || 'var(--color-accent)';
  const hideLabel = config.hideLabel as boolean;

  const targetState = String(config.targetState || 'on');
  const invertCondition = config.invertCondition as boolean;
  const message = String(config.message || '');
  const label = String(config.label || entity?.attributes?.friendly_name || 'Conditional');

  const currentState = entity?.state || 'unavailable';
  const conditionMet = invertCondition ? currentState !== targetState : currentState === targetState;

  // In view mode, hide when condition not met
  if (mode === 'view' && !conditionMet) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full rounded-card gap-2 p-3"
      style={{
        background: conditionMet ? `${accentColor}10` : 'var(--color-surface-secondary)',
        border: conditionMet ? `2px solid ${accentColor}40` : `2px dashed var(--color-border-primary)`,
        opacity: mode === 'edit' && !conditionMet ? 0.5 : 1,
      }}>

      {mode === 'edit' && (
        <div className="absolute top-1 right-1 flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
          style={{ background: conditionMet ? `${accentColor}30` : 'var(--color-surface-tertiary)', color: conditionMet ? accentColor : 'var(--color-text-tertiary)' }}>
          <Icon path={conditionMet ? mdiEye : mdiEyeOff} size={0.4} />
          {conditionMet ? 'Shown' : 'Hidden'}
        </div>
      )}

      <Icon path={conditionMet ? mdiEye : mdiEyeOff} size={1.2} color={conditionMet ? accentColor : 'var(--color-text-tertiary)'} />

      {!hideLabel && (
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      )}

      {message && (
        <span className="text-sm font-semibold text-center" style={{ color: conditionMet ? accentColor : 'var(--color-text-tertiary)' }}>
          {message}
        </span>
      )}

      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
        {currentState} {invertCondition ? '≠' : '='} {targetState}
      </span>
    </div>
  );
}

import { useState } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import {
  mdiThermometer,
  mdiFire,
  mdiSnowflake,
  mdiPowerStandby,
  mdiFan,
  mdiWaterPercent,
  mdiChevronUp,
  mdiChevronDown,
} from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import type { WidgetProps } from '../../types/widget';

/** HVAC mode colors and icons */
const MODE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  heat: { icon: mdiFire, color: 'var(--color-hvac-heat)', label: 'Heat' },
  cool: { icon: mdiSnowflake, color: 'var(--color-hvac-cool)', label: 'Cool' },
  heat_cool: { icon: mdiThermometer, color: 'var(--color-hvac-auto)', label: 'Auto' },
  auto: { icon: mdiThermometer, color: 'var(--color-hvac-auto)', label: 'Auto' },
  dry: { icon: mdiWaterPercent, color: 'var(--color-info)', label: 'Dry' },
  fan_only: { icon: mdiFan, color: 'var(--color-success)', label: 'Fan' },
  off: { icon: mdiPowerStandby, color: 'var(--color-hvac-off)', label: 'Off' },
};

/** Raw hex for dynamic CSS (gradients need real values, not var()) */
const MODE_HEX: Record<string, string> = {
  heat: '#ef4444',
  cool: '#4a9eff',
  heat_cool: '#f59e0b',
  auto: '#f59e0b',
  dry: '#8b5cf6',
  fan_only: '#22c55e',
  off: '#6b6b6b',
};

const ACTION_LABELS: Record<string, string> = {
  heating: '🔥 Heating',
  cooling: '❄️ Cooling',
  idle: 'Idle',
  drying: 'Drying',
  fan: 'Fan running',
  off: 'Off',
};

export default function ClimateCard({ config, mode: widgetMode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const [pendingTemp, setPendingTemp] = useState<number | null>(null);
  const [pendingHigh, setPendingHigh] = useState<number | null>(null);
  const [pendingLow, setPendingLow] = useState<number | null>(null);

  // Read appearance config
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const accentColor = config.accentColor as string | undefined;
  const hideLabel = config.hideLabel as boolean;
  const showFan = config.showFan as boolean;
  const showHumidity = config.showHumidity !== false; // default true

  if (!entity) {
    return (
      <div
        className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-widget-title)' }}
      >
        {config.entityId ? 'Loading...' : 'No entity'}
      </div>
    );
  }

  const attrs = entity.attributes;
  const hvacMode = entity.state;
  const hvacModes = (attrs.hvac_modes as string[]) || [];
  const fanModes = (attrs.fan_modes as string[]) || [];
  const currentTemp = attrs.current_temperature as number | null;
  const currentHumidity = attrs.current_humidity as number | null;
  const hvacAction = attrs.hvac_action as string | undefined;
  const fanMode = attrs.fan_mode as string | undefined;

  const isDualSetpoint = hvacMode === 'heat_cool' || hvacMode === 'auto';
  const targetTemp = pendingTemp ?? (attrs.temperature as number | null);
  const targetHigh = pendingHigh ?? (attrs.target_temp_high as number | null);
  const targetLow = pendingLow ?? (attrs.target_temp_low as number | null);
  const minTemp = (attrs.min_temp as number) || 40;
  const maxTemp = (attrs.max_temp as number) || 90;

  const modeConfig = MODE_CONFIG[hvacMode] || MODE_CONFIG.off;
  // Use accent color override if set, otherwise use mode-based color
  const effectiveHex = accentColor || MODE_HEX[hvacMode] || MODE_HEX.off;
  const modeHex = effectiveHex;

  const setTemperature = async (data: Record<string, unknown>) => {
    if (widgetMode === 'edit' || !config.entityId) return;
    try {
      await callService('climate', 'set_temperature', { entity_id: config.entityId, ...data });
    } catch (e) {
      console.error('[ClimateCard] Failed to set temperature:', e);
    }
  };

  const setHvacMode = async (newMode: string) => {
    if (widgetMode === 'edit' || !config.entityId) return;
    try {
      await callService('climate', 'set_hvac_mode', { entity_id: config.entityId, hvac_mode: newMode });
    } catch (e) {
      console.error('[ClimateCard] Failed to set HVAC mode:', e);
    }
  };

  const setFanMode = async (newFan: string) => {
    if (widgetMode === 'edit' || !config.entityId) return;
    try {
      await callService('climate', 'set_fan_mode', { entity_id: config.entityId, fan_mode: newFan });
    } catch (e) {
      console.error('[ClimateCard] Failed to set fan mode:', e);
    }
  };

  const adjustTemp = (field: 'temperature' | 'target_temp_high' | 'target_temp_low', delta: number) => {
    if (field === 'temperature') {
      const next = Math.min(maxTemp, Math.max(minTemp, (targetTemp || 70) + delta));
      setPendingTemp(next);
      if (isDualSetpoint) {
        setTemperature({ target_temp_high: targetHigh, target_temp_low: targetLow, [field]: next });
      } else {
        setTemperature({ [field]: next });
      }
    } else if (field === 'target_temp_high') {
      const next = Math.min(maxTemp, Math.max(minTemp, (targetHigh || 73) + delta));
      setPendingHigh(next);
      setTemperature({ target_temp_high: next, target_temp_low: targetLow || 70 });
    } else {
      const next = Math.min(maxTemp, Math.max(minTemp, (targetLow || 70) + delta));
      setPendingLow(next);
      setTemperature({ target_temp_high: targetHigh || 73, target_temp_low: next });
    }
    setTimeout(() => { setPendingTemp(null); setPendingHigh(null); setPendingLow(null); }, 3000);
  };

  const label = String(config.label || attrs.friendly_name || config.entityId || 'Climate');

  return (
    <div
      className="flex flex-col w-full h-full rounded-card p-3 overflow-hidden"
      style={{
        background: hvacMode === 'off'
          ? 'var(--color-surface-secondary)'
          : `linear-gradient(135deg, ${modeHex}15 0%, ${modeHex}08 100%)`,
        cursor: widgetMode === 'edit' ? 'grab' : 'default',
        border: `1px solid ${modeHex}30`,
      }}
    >
      {/* Header */}
      {!hideLabel && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Icon path={customIcon || modeConfig.icon} size={0.7} color={accentColor || modeConfig.color} />
            <span style={{ fontSize: 'var(--text-widget-label)', color: 'var(--color-text-primary)' }} className="font-medium truncate">
              {label}
            </span>
          </div>
          {hvacAction && (
            <span style={{ fontSize: 'var(--text-widget-label)', color: 'var(--color-text-tertiary)' }} className="shrink-0">
              {ACTION_LABELS[hvacAction] || hvacAction}
            </span>
          )}
        </div>
      )}

      {/* Current temperature */}
      <div className="flex items-center justify-center flex-1">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {currentTemp != null ? `${currentTemp}°` : '—'}
          </div>
          {showHumidity && currentHumidity != null && (
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <Icon path={mdiWaterPercent} size={0.5} color={accentColor || 'var(--color-text-tertiary)'} />
              <span style={{ fontSize: 'var(--text-widget-label)', color: accentColor || 'var(--color-text-tertiary)' }}>
                {currentHumidity}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Setpoint controls */}
      {hvacMode !== 'off' && (
        <div className="flex justify-center gap-4 mb-2">
          {isDualSetpoint ? (
            <>
              <SetpointControl
                value={targetLow}
                label="Low"
                color="var(--color-hvac-cool)"
                onAdjust={(d) => adjustTemp('target_temp_low', d)}
                disabled={widgetMode === 'edit'}
              />
              <SetpointControl
                value={targetHigh}
                label="High"
                color="var(--color-hvac-heat)"
                onAdjust={(d) => adjustTemp('target_temp_high', d)}
                disabled={widgetMode === 'edit'}
              />
            </>
          ) : (
            <SetpointControl
              value={targetTemp}
              label="Target"
              color="var(--color-text-primary)"
              onAdjust={(d) => adjustTemp('temperature', d)}
              disabled={widgetMode === 'edit'}
              large
            />
          )}
        </div>
      )}

      {/* HVAC mode buttons */}
      <div className="flex justify-center gap-1 mb-1.5">
        {hvacModes.map((m) => {
          const mc = MODE_CONFIG[m] || { icon: mdiThermometer, color: 'var(--color-hvac-off)', label: m };
          const hex = accentColor || MODE_HEX[m] || MODE_HEX.off;
          const isActive = hvacMode === m;
          return (
            <button
              key={m}
              onClick={() => setHvacMode(m)}
              disabled={widgetMode === 'edit'}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                background: isActive ? `${hex}25` : 'transparent',
                border: isActive ? `1px solid ${hex}50` : '1px solid transparent',
              }}
              title={mc.label}
            >
              <Icon path={mc.icon} size={0.6} color={isActive ? mc.color : 'var(--color-text-tertiary)'} />
            </button>
          );
        })}
      </div>

      {/* Fan mode */}
      {showFan && fanModes.length > 0 && (
        <div className="flex items-center justify-center gap-1.5">
          <Icon path={mdiFan} size={0.5} color="var(--color-text-tertiary)" />
          <select
            value={fanMode || ''}
            onChange={(e) => setFanMode(e.target.value)}
            disabled={widgetMode === 'edit'}
            className="text-xs outline-none cursor-pointer"
            style={{ background: 'transparent', color: 'var(--color-text-secondary)' }}
          >
            {fanModes.map((f) => (
              <option key={f} value={f} style={{ background: 'var(--color-surface-primary)' }}>
                {f}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

/** Reusable setpoint up/down control */
function SetpointControl({
  value,
  label,
  color,
  onAdjust,
  disabled,
  large,
}: {
  value: number | null;
  label: string;
  color: string;
  onAdjust: (delta: number) => void;
  disabled: boolean;
  large?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onAdjust(-1)}
        className="p-0.5 rounded hover:bg-white/10 transition-colors"
        disabled={disabled}
      >
        <Icon path={mdiChevronDown} size={large ? 0.8 : 0.6} color="var(--color-text-secondary)" />
      </button>
      <div className="text-center" style={{ minWidth: large ? '50px' : '40px' }}>
        <div className={`font-semibold ${large ? 'text-lg' : 'text-sm'}`} style={{ color }}>
          {value != null ? `${value}°` : '—'}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{label}</div>
      </div>
      <button
        onClick={() => onAdjust(1)}
        className="p-0.5 rounded hover:bg-white/10 transition-colors"
        disabled={disabled}
      >
        <Icon path={mdiChevronUp} size={large ? 0.8 : 0.6} color="var(--color-text-secondary)" />
      </button>
    </div>
  );
}

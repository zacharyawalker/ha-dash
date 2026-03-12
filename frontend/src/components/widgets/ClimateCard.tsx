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
import type { WidgetProps } from '../../types/widget';

/** HVAC mode colors and icons */
const MODE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  heat: { icon: mdiFire, color: '#ef4444', label: 'Heat' },
  cool: { icon: mdiSnowflake, color: '#3b82f6', label: 'Cool' },
  heat_cool: { icon: mdiThermometer, color: '#f59e0b', label: 'Auto' },
  auto: { icon: mdiThermometer, color: '#f59e0b', label: 'Auto' },
  dry: { icon: mdiWaterPercent, color: '#8b5cf6', label: 'Dry' },
  fan_only: { icon: mdiFan, color: '#22c55e', label: 'Fan' },
  off: { icon: mdiPowerStandby, color: '#6b7280', label: 'Off' },
};

/** Hvac action indicators */
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

  if (!entity) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-xl bg-white/5 text-gray-500 text-sm">
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

  // Dual setpoint (heat_cool) vs single setpoint
  const isDualSetpoint = hvacMode === 'heat_cool' || hvacMode === 'auto';
  const targetTemp = pendingTemp ?? (attrs.temperature as number | null);
  const targetHigh = pendingHigh ?? (attrs.target_temp_high as number | null);
  const targetLow = pendingLow ?? (attrs.target_temp_low as number | null);
  const minTemp = (attrs.min_temp as number) || 40;
  const maxTemp = (attrs.max_temp as number) || 90;

  const modeConfig = MODE_CONFIG[hvacMode] || MODE_CONFIG.off;

  const setTemperature = async (data: Record<string, unknown>) => {
    if (widgetMode === 'edit' || !config.entityId) return;
    try {
      await callService('climate', 'set_temperature', {
        entity_id: config.entityId,
        ...data,
      });
    } catch (e) {
      console.error('[ClimateCard] Failed to set temperature:', e);
    }
  };

  const setHvacMode = async (newMode: string) => {
    if (widgetMode === 'edit' || !config.entityId) return;
    try {
      await callService('climate', 'set_hvac_mode', {
        entity_id: config.entityId,
        hvac_mode: newMode,
      });
    } catch (e) {
      console.error('[ClimateCard] Failed to set HVAC mode:', e);
    }
  };

  const setFanMode = async (newFan: string) => {
    if (widgetMode === 'edit' || !config.entityId) return;
    try {
      await callService('climate', 'set_fan_mode', {
        entity_id: config.entityId,
        fan_mode: newFan,
      });
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
    // Clear pending after WS update arrives
    setTimeout(() => {
      setPendingTemp(null);
      setPendingHigh(null);
      setPendingLow(null);
    }, 3000);
  };

  const label = String(config.label || attrs.friendly_name || config.entityId || 'Climate');

  return (
    <div
      className="flex flex-col w-full h-full rounded-xl p-3 overflow-hidden"
      style={{
        background: hvacMode === 'off'
          ? 'rgba(255,255,255,0.05)'
          : `linear-gradient(135deg, ${modeConfig.color}15 0%, ${modeConfig.color}08 100%)`,
        cursor: widgetMode === 'edit' ? 'grab' : 'default',
        border: `1px solid ${modeConfig.color}30`,
      }}
    >
      {/* Header: name + current temp */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon path={modeConfig.icon} size={0.7} color={modeConfig.color} />
          <span className="text-xs font-medium text-gray-300 truncate">{label}</span>
        </div>
        {hvacAction && (
          <span className="text-xs text-gray-500 shrink-0">
            {ACTION_LABELS[hvacAction] || hvacAction}
          </span>
        )}
      </div>

      {/* Current temperature (large) */}
      <div className="flex items-center justify-center flex-1">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">
            {currentTemp != null ? `${currentTemp}°` : '—'}
          </div>
          {currentHumidity != null && (
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <Icon path={mdiWaterPercent} size={0.5} color="#6b7280" />
              <span className="text-xs text-gray-500">{currentHumidity}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Setpoint controls */}
      {hvacMode !== 'off' && (
        <div className="flex justify-center gap-4 mb-2">
          {isDualSetpoint ? (
            <>
              {/* Low setpoint */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustTemp('target_temp_low', -1)}
                  className="p-0.5 rounded hover:bg-white/10 transition-colors"
                  disabled={widgetMode === 'edit'}
                >
                  <Icon path={mdiChevronDown} size={0.6} color="#9ca3af" />
                </button>
                <div className="text-center min-w-[40px]">
                  <div className="text-sm font-semibold text-blue-400">
                    {targetLow != null ? `${targetLow}°` : '—'}
                  </div>
                  <div className="text-[10px] text-gray-600">Low</div>
                </div>
                <button
                  onClick={() => adjustTemp('target_temp_low', 1)}
                  className="p-0.5 rounded hover:bg-white/10 transition-colors"
                  disabled={widgetMode === 'edit'}
                >
                  <Icon path={mdiChevronUp} size={0.6} color="#9ca3af" />
                </button>
              </div>
              {/* High setpoint */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustTemp('target_temp_high', -1)}
                  className="p-0.5 rounded hover:bg-white/10 transition-colors"
                  disabled={widgetMode === 'edit'}
                >
                  <Icon path={mdiChevronDown} size={0.6} color="#9ca3af" />
                </button>
                <div className="text-center min-w-[40px]">
                  <div className="text-sm font-semibold text-red-400">
                    {targetHigh != null ? `${targetHigh}°` : '—'}
                  </div>
                  <div className="text-[10px] text-gray-600">High</div>
                </div>
                <button
                  onClick={() => adjustTemp('target_temp_high', 1)}
                  className="p-0.5 rounded hover:bg-white/10 transition-colors"
                  disabled={widgetMode === 'edit'}
                >
                  <Icon path={mdiChevronUp} size={0.6} color="#9ca3af" />
                </button>
              </div>
            </>
          ) : (
            /* Single setpoint */
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustTemp('temperature', -1)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                disabled={widgetMode === 'edit'}
              >
                <Icon path={mdiChevronDown} size={0.8} color="#9ca3af" />
              </button>
              <div className="text-center min-w-[50px]">
                <div className="text-lg font-semibold text-white">
                  {targetTemp != null ? `${targetTemp}°` : '—'}
                </div>
                <div className="text-[10px] text-gray-600">Target</div>
              </div>
              <button
                onClick={() => adjustTemp('temperature', 1)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                disabled={widgetMode === 'edit'}
              >
                <Icon path={mdiChevronUp} size={0.8} color="#9ca3af" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* HVAC mode buttons */}
      <div className="flex justify-center gap-1 mb-1.5">
        {hvacModes.map((m) => {
          const mc = MODE_CONFIG[m] || { icon: mdiThermometer, color: '#6b7280', label: m };
          const isActive = hvacMode === m;
          return (
            <button
              key={m}
              onClick={() => setHvacMode(m)}
              disabled={widgetMode === 'edit'}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                background: isActive ? `${mc.color}25` : 'transparent',
                border: isActive ? `1px solid ${mc.color}50` : '1px solid transparent',
              }}
              title={mc.label}
            >
              <Icon path={mc.icon} size={0.6} color={isActive ? mc.color : '#6b7280'} />
            </button>
          );
        })}
      </div>

      {/* Fan mode */}
      {fanModes.length > 0 && (
        <div className="flex items-center justify-center gap-1.5">
          <Icon path={mdiFan} size={0.5} color="#6b7280" />
          <select
            value={fanMode || ''}
            onChange={(e) => setFanMode(e.target.value)}
            disabled={widgetMode === 'edit'}
            className="text-xs bg-transparent text-gray-400 outline-none cursor-pointer"
          >
            {fanModes.map((f) => (
              <option key={f} value={f} className="bg-neutral-800">
                {f}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

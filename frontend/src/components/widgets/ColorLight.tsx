import { useState, useCallback } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiLightbulb, mdiLightbulbOff, mdiPalette } from '@mdi/js';
import { getIconByName } from '../../utils/haIcons';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

/**
 * Color light widget — toggle + brightness slider + color temperature/HS picker.
 * Shows current color as background glow when on.
 */
export default function ColorLight({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const [showColor, setShowColor] = useState(false);
  const customIcon = config.customIcon ? getIconByName(config.customIcon as string) : undefined;
  const hideLabel = config.hideLabel as boolean;

  if (!entity) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>
        {config.entityId ? 'Loading...' : 'No entity'}
      </div>
    );
  }

  const isOn = entity.state === 'on';
  const brightness = (entity.attributes?.brightness as number) || 0;
  const brightnessPercent = Math.round((brightness / 255) * 100);
  const colorTemp = entity.attributes?.color_temp as number | undefined;
  const rgbColor = entity.attributes?.rgb_color as [number, number, number] | undefined;
  const label = String(config.label || entity.attributes?.friendly_name || 'Light');

  const supportsBrightness = (entity.attributes?.supported_color_modes as string[] || []).some(
    (m) => m !== 'onoff'
  );
  const supportsColor = (entity.attributes?.supported_color_modes as string[] || []).some(
    (m) => m === 'hs' || m === 'rgb' || m === 'xy' || m === 'rgbw' || m === 'rgbww'
  );
  const supportsTemp = (entity.attributes?.supported_color_modes as string[] || []).some(
    (m) => m === 'color_temp'
  );

  const bgColor = isOn && rgbColor
    ? `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, 0.15)`
    : isOn ? '#fbbf2418' : 'var(--color-surface-secondary)';

  const iconColor = isOn && rgbColor
    ? `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`
    : isOn ? '#fbbf24' : 'var(--color-text-tertiary)';

  const toggle = useCallback(async () => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('light', 'toggle', { entity_id: config.entityId });
    } catch (e) {
      console.error('[ColorLight]', e);
    }
  }, [config.entityId, mode]);

  const setBrightness = useCallback(async (value: number) => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('light', 'turn_on', {
        entity_id: config.entityId,
        brightness: Math.round((value / 100) * 255),
      });
    } catch (e) {
      console.error('[ColorLight]', e);
    }
  }, [config.entityId, mode]);

  const setColorTemp = useCallback(async (value: number) => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('light', 'turn_on', {
        entity_id: config.entityId,
        color_temp: value,
      });
    } catch (e) {
      console.error('[ColorLight]', e);
    }
  }, [config.entityId, mode]);

  const PRESET_COLORS: [number, number, number][] = [
    [255, 0, 0], [255, 127, 0], [255, 255, 0], [0, 255, 0],
    [0, 255, 255], [0, 127, 255], [0, 0, 255], [127, 0, 255],
    [255, 0, 255], [255, 0, 127], [255, 255, 255], [255, 200, 150],
  ];

  const setColor = useCallback(async (rgb: [number, number, number]) => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('light', 'turn_on', {
        entity_id: config.entityId,
        rgb_color: rgb,
      });
    } catch (e) {
      console.error('[ColorLight]', e);
    }
  }, [config.entityId, mode]);

  const minMireds = (entity.attributes?.min_mireds as number) || 153;
  const maxMireds = (entity.attributes?.max_mireds as number) || 500;

  return (
    <div className="flex flex-col items-center w-full h-full rounded-card p-3 gap-2"
      style={{ background: bgColor, border: isOn ? `1px solid ${iconColor}30` : '1px solid transparent' }}>

      {/* Icon + Toggle */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        disabled={mode === 'edit'}
        className="flex flex-col items-center gap-1"
        style={{ cursor: mode === 'edit' ? 'grab' : 'pointer' }}
      >
        <Icon path={customIcon || (isOn ? mdiLightbulb : mdiLightbulbOff)} size={1.5} color={iconColor} />
        {!hideLabel && (
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
        )}
        <span className="text-xs" style={{ color: isOn ? iconColor : 'var(--color-text-tertiary)' }}>
          {isOn ? `${brightnessPercent}%` : 'Off'}
        </span>
      </motion.button>

      {/* Brightness slider */}
      {isOn && supportsBrightness && (
        <input
          type="range" min={1} max={100} value={brightnessPercent}
          onChange={(e) => setBrightness(Number(e.target.value))}
          disabled={mode === 'edit'}
          className="w-full h-1.5 rounded-full appearance-none"
          style={{
            background: `linear-gradient(to right, ${iconColor} ${brightnessPercent}%, var(--color-surface-tertiary) ${brightnessPercent}%)`,
            accentColor: iconColor,
          }}
        />
      )}

      {/* Color/temp toggle */}
      {isOn && (supportsColor || supportsTemp) && (
        <button
          onClick={() => setShowColor(!showColor)}
          disabled={mode === 'edit'}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded"
          style={{ background: 'var(--color-surface-tertiary)', color: 'var(--color-text-secondary)' }}
        >
          <Icon path={mdiPalette} size={0.4} />
          {showColor ? 'Hide' : 'Color'}
        </button>
      )}

      {/* Color picker */}
      {showColor && supportsColor && (
        <div className="grid grid-cols-6 gap-1 w-full">
          {PRESET_COLORS.map((c, i) => (
            <button
              key={i}
              onClick={() => setColor(c)}
              disabled={mode === 'edit'}
              className="w-full aspect-square rounded-full border-2 transition-transform hover:scale-110"
              style={{
                background: `rgb(${c[0]}, ${c[1]}, ${c[2]})`,
                borderColor: rgbColor && rgbColor[0] === c[0] && rgbColor[1] === c[1] && rgbColor[2] === c[2]
                  ? 'white' : 'transparent',
              }}
            />
          ))}
        </div>
      )}

      {/* Color temp slider */}
      {showColor && supportsTemp && (
        <div className="w-full">
          <input
            type="range" min={minMireds} max={maxMireds}
            value={colorTemp || minMireds}
            onChange={(e) => setColorTemp(Number(e.target.value))}
            disabled={mode === 'edit'}
            className="w-full h-1.5 rounded-full appearance-none"
            style={{
              background: 'linear-gradient(to right, #b3d9ff, #fff5e0, #ffb366)',
            }}
          />
          <div className="flex justify-between text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            <span>Cool</span>
            <span>Warm</span>
          </div>
        </div>
      )}
    </div>
  );
}

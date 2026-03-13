import { useState } from 'react';
import { WIDGET_COLORS } from '../utils/haIcons';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

/**
 * Compact color picker with presets and custom hex input.
 */
export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="space-y-2">
      {/* Preset colors */}
      <div className="flex flex-wrap gap-1.5">
        {WIDGET_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => onChange(color.value)}
            className="w-7 h-7 rounded-full transition-all hover:scale-110 border-2"
            style={{
              background: color.value,
              borderColor: value === color.value ? 'var(--color-text-primary)' : 'transparent',
              boxShadow: value === color.value ? '0 0 0 2px var(--color-surface-primary), 0 0 0 4px var(--color-accent)' : 'none',
            }}
            title={color.name}
          />
        ))}
      </div>

      {/* Custom hex input */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="text-xs underline"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {showCustom ? 'Hide' : 'Custom color'}
        </button>
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg border"
            style={{ background: value || '#4a9eff', borderColor: 'var(--color-border-secondary)' }}
          />
          <input
            type="color"
            value={value || '#4a9eff'}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 cursor-pointer rounded"
          />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#hex"
            className="flex-1 px-2 py-1 text-xs rounded-lg outline-none"
            style={{ background: 'var(--color-surface-tertiary)', color: 'var(--color-text-primary)' }}
          />
        </div>
      )}
    </div>
  );
}

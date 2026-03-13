import { useState } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import {
  mdiArrowUp,
  mdiArrowDown,
  mdiStop,
  mdiBlindsHorizontal,
  mdiBlindsHorizontalClosed,
} from '@mdi/js';
import type { WidgetProps } from '../../types/widget';

export default function CoverControl({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const [pendingPos, setPendingPos] = useState<number | null>(null);

  if (!entity) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>
        {config.entityId ? 'Loading...' : 'No entity'}
      </div>
    );
  }

  const attrs = entity.attributes;
  const state = entity.state; // open, closed, opening, closing
  const position = pendingPos ?? (attrs.current_position as number | undefined);
  const isOpen = state === 'open' || state === 'opening';

  const label = String(config.label || attrs.friendly_name || config.entityId || 'Cover');

  const svc = async (service: string, data?: Record<string, unknown>) => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('cover', service, { entity_id: config.entityId, ...data });
    } catch (e) {
      console.error('[CoverControl]', e);
    }
  };

  const handlePosition = (value: number) => {
    setPendingPos(value);
    svc('set_cover_position', { position: value });
    setTimeout(() => setPendingPos(null), 3000);
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full rounded-card p-3"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {/* Header */}
      <div className="flex items-center gap-1.5">
        <Icon
          path={isOpen ? mdiBlindsHorizontal : mdiBlindsHorizontalClosed}
          size={0.8}
          color={isOpen ? 'var(--color-accent)' : 'var(--color-text-tertiary)'}
        />
        <span className="font-medium" style={{ fontSize: 'var(--text-widget-title)', color: 'var(--color-text-primary)' }}>
          {label}
        </span>
      </div>

      {/* Position */}
      <div className="text-center">
        <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {position != null ? `${position}%` : state}
        </div>
        <div className="text-xs capitalize" style={{ color: 'var(--color-text-tertiary)' }}>{state}</div>
      </div>

      {/* Controls */}
      <div className="w-full space-y-2">
        {/* Up / Stop / Down buttons */}
        <div className="flex justify-center gap-2">
          <button onClick={() => svc('open_cover')} disabled={mode === 'edit'}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--color-surface-tertiary)' }}>
            <Icon path={mdiArrowUp} size={0.7} color="var(--color-text-secondary)" />
          </button>
          <button onClick={() => svc('stop_cover')} disabled={mode === 'edit'}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--color-surface-tertiary)' }}>
            <Icon path={mdiStop} size={0.7} color="var(--color-text-secondary)" />
          </button>
          <button onClick={() => svc('close_cover')} disabled={mode === 'edit'}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--color-surface-tertiary)' }}>
            <Icon path={mdiArrowDown} size={0.7} color="var(--color-text-secondary)" />
          </button>
        </div>

        {/* Position slider */}
        {position != null && (
          <input
            type="range" min={0} max={100} value={position}
            onChange={(e) => handlePosition(Number(e.target.value))}
            disabled={mode === 'edit'}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${position}%, var(--color-surface-tertiary) ${position}%, var(--color-surface-tertiary) 100%)`,
              accentColor: 'var(--color-accent)',
            }}
          />
        )}
      </div>
    </div>
  );
}

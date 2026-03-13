import { useMemo } from 'react';
import { useEntityStore } from '../../store/entityStore';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiToggleSwitch, mdiToggleSwitchOff } from '@mdi/js';
import type { WidgetProps } from '../../types/widget';

/**
 * Entity list widget — shows multiple entities in a compact list.
 * Toggleable entities get a toggle button.
 * Configure a domain filter to show specific entity types.
 */
export default function EntityList({ config, mode }: WidgetProps) {
  const entities = useEntityStore((s) => s.entities);
  const domain = (config.filterDomain as string) || '';
  const maxItems = (config.maxItems as number) || 20;
  const hideLabel = config.hideLabel as boolean;
  const title = String(config.label || domain || 'Entities');

  const filtered = useMemo(() => {
    return Object.values(entities)
      .filter((e) => !domain || e.entity_id.startsWith(`${domain}.`))
      .filter((e) => e.state !== 'unavailable')
      .sort((a, b) => ((a.attributes?.friendly_name as string) || '').localeCompare((b.attributes?.friendly_name as string) || ''))
      .slice(0, maxItems);
  }, [entities, domain, maxItems]);

  const toggleable = ['light', 'switch', 'input_boolean', 'fan', 'automation'];

  const handleToggle = async (entityId: string) => {
    if (mode === 'edit') return;
    const d = entityId.split('.')[0];
    try {
      await callService(d, 'toggle', { entity_id: entityId });
    } catch (e) {
      console.error('[EntityList]', e);
    }
  };

  return (
    <div className="flex flex-col w-full h-full rounded-card overflow-hidden"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {!hideLabel && (
        <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
            {title}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {filtered.length}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto" data-scrollable>
        {filtered.map((e) => {
          const isOn = e.state === 'on';
          const d = e.entity_id.split('.')[0];
          const canToggle = toggleable.includes(d);
          const unit = (e.attributes?.unit_of_measurement as string) || '';

          return (
            <div
              key={e.entity_id}
              className="flex items-center justify-between px-3 py-2 transition-colors"
              style={{ borderBottom: '1px solid var(--color-border-primary)' }}
            >
              <span className="text-xs truncate flex-1 mr-2" style={{ color: 'var(--color-text-primary)' }}>
                {(e.attributes?.friendly_name as string) || e.entity_id}
              </span>
              {canToggle ? (
                <button
                  onClick={() => handleToggle(e.entity_id)}
                  disabled={mode === 'edit'}
                  className="shrink-0"
                >
                  <Icon
                    path={isOn ? mdiToggleSwitch : mdiToggleSwitchOff}
                    size={1}
                    color={isOn ? 'var(--color-accent)' : 'var(--color-text-tertiary)'}
                  />
                </button>
              ) : (
                <span className="text-xs font-mono shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                  {e.state}{unit && ` ${unit}`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import { mdiCheckboxMarked, mdiCheckboxBlankOutline, mdiPlus, mdiFormatListBulleted } from '@mdi/js';
import type { WidgetProps } from '../../types/widget';

interface TodoItem {
  uid: string;
  summary: string;
  status: 'needs_action' | 'completed';
}

/**
 * Todo / Shopping List widget.
 * Works with HA's todo domain (shopping_list, etc.)
 * Supports adding, checking, and unchecking items.
 */
export default function TodoList({ config, mode }: WidgetProps) {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);

  const entityId = config.entityId as string | undefined;
  const hideLabel = config.hideLabel as boolean;
  const accent = (config.accentColor as string) || 'var(--color-accent)';
  const label = String(config.label || 'To-Do');

  const fetchItems = useCallback(async () => {
    if (!entityId) return;
    try {
      const resp = await callService('todo', 'get_items', {
        entity_id: entityId,
      }, true);
      // HA returns { "entity.id": { items: [...] } }
      const data = resp as Record<string, unknown>;
      const entityData = data[entityId] as { items?: TodoItem[] } | undefined;
      if (entityData?.items) {
        setItems(entityData.items);
      }
    } catch (e) {
      console.error('[TodoList] fetch error:', e);
    }
  }, [entityId]);

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 30000);
    return () => clearInterval(interval);
  }, [fetchItems]);

  const toggleItem = async (uid: string, currentStatus: string) => {
    if (mode === 'edit') return;
    try {
      await callService('todo', currentStatus === 'completed' ? 'update_item' : 'update_item', {
        entity_id: entityId,
        item: uid,
        status: currentStatus === 'completed' ? 'needs_action' : 'completed',
      });
      fetchItems();
    } catch (e) {
      console.error('[TodoList]', e);
    }
  };

  const addItem = async () => {
    if (mode === 'edit' || !newItem.trim() || !entityId) return;
    setLoading(true);
    try {
      await callService('todo', 'add_item', {
        entity_id: entityId,
        item: newItem.trim(),
      });
      setNewItem('');
      fetchItems();
    } catch (e) {
      console.error('[TodoList]', e);
    }
    setLoading(false);
  };

  const active = items.filter((i) => i.status === 'needs_action');
  const completed = items.filter((i) => i.status === 'completed');

  return (
    <div className="flex flex-col w-full h-full rounded-card overflow-hidden"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {!hideLabel && (
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
          <Icon path={mdiFormatListBulleted} size={0.6} color={accent} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
            {label}
          </span>
          <span className="ml-auto text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {active.length} remaining
          </span>
        </div>
      )}

      {/* Add new item */}
      <div className="flex items-center gap-1 px-2 py-1.5" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Add item..."
          disabled={mode === 'edit'}
          className="flex-1 px-2 py-1 text-xs rounded outline-none"
          style={{ background: 'var(--color-surface-tertiary)', color: 'var(--color-text-primary)' }}
        />
        <button onClick={addItem} disabled={mode === 'edit' || loading || !newItem.trim()}
          className="p-1 rounded" style={{ background: accent, color: 'white', opacity: newItem.trim() ? 1 : 0.4 }}>
          <Icon path={mdiPlus} size={0.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" data-scrollable>
        {active.map((item) => (
          <button
            key={item.uid}
            onClick={() => toggleItem(item.uid, item.status)}
            disabled={mode === 'edit'}
            className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
            style={{ borderBottom: '1px solid var(--color-border-primary)' }}
          >
            <Icon path={mdiCheckboxBlankOutline} size={0.6} color="var(--color-text-tertiary)" />
            <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>{item.summary}</span>
          </button>
        ))}
        {completed.length > 0 && (
          <>
            <div className="px-3 py-1 text-xs" style={{ color: 'var(--color-text-tertiary)', background: 'var(--color-surface-tertiary)' }}>
              Completed ({completed.length})
            </div>
            {completed.map((item) => (
              <button
                key={item.uid}
                onClick={() => toggleItem(item.uid, item.status)}
                disabled={mode === 'edit'}
                className="w-full flex items-center gap-2 px-3 py-2 text-left opacity-50 transition-colors"
                style={{ borderBottom: '1px solid var(--color-border-primary)' }}
              >
                <Icon path={mdiCheckboxMarked} size={0.6} color={accent} />
                <span className="text-xs line-through" style={{ color: 'var(--color-text-tertiary)' }}>{item.summary}</span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

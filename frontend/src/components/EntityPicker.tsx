import { useState, useMemo } from 'react';
import { useHaEntities } from '../hooks/useHaEntities';
import Icon from '@mdi/react';
import { mdiMagnify, mdiClose } from '@mdi/js';

interface EntityPickerProps {
  value: string;
  onChange: (entityId: string) => void;
  domain?: string | string[];
  placeholder?: string;
}

export default function EntityPicker({
  value,
  onChange,
  domain,
  placeholder = 'Search entities...',
}: EntityPickerProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { entities } = useHaEntities(domain);

  const filtered = useMemo(() => {
    if (!search) return entities;
    const q = search.toLowerCase();
    return entities.filter((e) => {
      const name = (e.attributes.friendly_name as string || '').toLowerCase();
      return name.includes(q) || e.entity_id.toLowerCase().includes(q);
    });
  }, [entities, search]);

  const selectedEntity = entities.find((e) => e.entity_id === value);
  const displayName = selectedEntity
    ? (selectedEntity.attributes.friendly_name as string || selectedEntity.entity_id)
    : value;

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left"
        style={{
          background: 'var(--color-surface-tertiary)',
          color: value ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
          border: '1px solid var(--color-border-primary)',
        }}
      >
        <span>{value ? displayName : placeholder}</span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setSearch('');
            }}
            className="ml-2 hover:opacity-80"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Icon path={mdiClose} size={0.6} />
          </button>
        )}
      </button>

      {/* Entity ID subtitle */}
      {value && selectedEntity && (
        <div className="mt-0.5 text-xs px-1" style={{ color: 'var(--color-text-tertiary)' }}>{value}</div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-xl z-50 max-h-64 overflow-hidden flex flex-col"
          style={{ background: 'var(--color-surface-secondary)', border: '1px solid var(--color-border-secondary)' }}
        >
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
            <Icon path={mdiMagnify} size={0.7} color="var(--color-text-tertiary)" className="shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className="w-full text-sm outline-none"
              style={{ background: 'transparent', color: 'var(--color-text-primary)' }}
            />
          </div>

          <div className="overflow-y-auto max-h-56">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                No entities found
              </div>
            ) : (
              filtered.slice(0, 100).map((e) => {
                const isActive = e.entity_id === value;
                return (
                  <button
                    key={e.entity_id}
                    onClick={() => {
                      onChange(e.entity_id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className="w-full text-left px-3 py-2 text-sm transition-colors"
                    style={{
                      background: isActive ? 'var(--color-accent-muted)' : 'transparent',
                      color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    }}
                    onMouseEnter={(ev) => { if (!isActive) ev.currentTarget.style.background = 'var(--color-surface-hover)'; }}
                    onMouseLeave={(ev) => { ev.currentTarget.style.background = isActive ? 'var(--color-accent-muted)' : 'transparent'; }}
                  >
                    <div className="font-medium">
                      {(e.attributes.friendly_name as string) || e.entity_id}
                    </div>
                    <div className="text-xs flex items-center gap-2" style={{ color: 'var(--color-text-tertiary)' }}>
                      <span>{e.entity_id}</span>
                      <span>•</span>
                      <span>{e.state}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setIsOpen(false); setSearch(''); }}
        />
      )}
    </div>
  );
}

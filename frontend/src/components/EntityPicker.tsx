import { useState, useMemo } from 'react';
import { useHaEntities } from '../hooks/useHaEntities';
import Icon from '@mdi/react';
import { mdiMagnify, mdiClose } from '@mdi/js';

interface EntityPickerProps {
  /** Currently selected entity ID */
  value: string;
  /** Called when an entity is selected */
  onChange: (entityId: string) => void;
  /** Filter to specific domain(s) (e.g., 'light', 'sensor') */
  domain?: string;
  /** Placeholder text */
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
      {/* Selected value / trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm bg-neutral-700 text-white rounded-lg border border-neutral-600 hover:border-neutral-500 transition-colors text-left"
      >
        <span className={value ? 'text-white' : 'text-gray-400'}>
          {value ? displayName : placeholder}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setSearch('');
            }}
            className="ml-2 text-gray-400 hover:text-white"
          >
            <Icon path={mdiClose} size={0.6} />
          </button>
        )}
      </button>

      {/* Entity ID subtitle */}
      {value && selectedEntity && (
        <div className="mt-0.5 text-xs text-gray-500 px-1">{value}</div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 z-50 max-h-64 overflow-hidden flex flex-col">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-700">
            <Icon path={mdiMagnify} size={0.7} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className="w-full text-sm bg-transparent text-white placeholder-gray-400 outline-none"
            />
          </div>

          {/* Entity list */}
          <div className="overflow-y-auto max-h-56">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No entities found
              </div>
            ) : (
              filtered.slice(0, 100).map((e) => (
                <button
                  key={e.entity_id}
                  onClick={() => {
                    onChange(e.entity_id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-700 transition-colors ${
                    e.entity_id === value ? 'bg-neutral-700 text-blue-400' : 'text-gray-200'
                  }`}
                >
                  <div className="font-medium">
                    {(e.attributes.friendly_name as string) || e.entity_id}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{e.entity_id}</span>
                    <span className="text-gray-600">•</span>
                    <span>{e.state}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Close dropdown on outside click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearch('');
          }}
        />
      )}
    </div>
  );
}

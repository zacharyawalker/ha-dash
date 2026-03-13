import { useState, useMemo } from 'react';
import Icon from '@mdi/react';
import { mdiMagnify, mdiClose } from '@mdi/js';
import { HA_ICON_LIBRARY, getIconByName } from '../utils/haIcons';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  onClose: () => void;
}

/**
 * Modal icon picker with categorized HA icons and search.
 */
export default function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search) return HA_ICON_LIBRARY;
    const q = search.toLowerCase();
    return HA_ICON_LIBRARY
      .map((cat) => ({
        ...cat,
        icons: cat.icons.filter(
          (icon) =>
            icon.name.includes(q) ||
            icon.keywords.some((k) => k.includes(q)) ||
            cat.label.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.icons.length > 0);
  }, [search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div
        className="w-[420px] max-h-[80vh] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border-primary)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Choose Icon</h2>
          <button onClick={onClose} className="hover:opacity-80" style={{ color: 'var(--color-text-secondary)' }}>
            <Icon path={mdiClose} size={0.8} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--color-surface-tertiary)' }}>
            <Icon path={mdiMagnify} size={0.7} color="var(--color-text-tertiary)" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons..."
              autoFocus
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        {/* Icon grid */}
        <div className="flex-1 overflow-y-auto px-4 py-3" data-scrollable>
          {filteredCategories.map((cat) => (
            <div key={cat.label} className="mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                {cat.label}
              </h3>
              <div className="grid grid-cols-8 gap-1">
                {cat.icons.map((icon) => (
                  <button
                    key={icon.name}
                    onClick={() => { onChange(icon.name); onClose(); }}
                    className="p-2 rounded-lg transition-all hover:scale-110"
                    style={{
                      background: value === icon.name ? 'var(--color-accent-muted)' : 'transparent',
                      border: value === icon.name ? '1px solid var(--color-accent)' : '1px solid transparent',
                    }}
                    title={icon.name}
                  >
                    <Icon
                      path={icon.path}
                      size={0.8}
                      color={value === icon.name ? 'var(--color-accent)' : 'var(--color-text-secondary)'}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-sm text-center py-8" style={{ color: 'var(--color-text-tertiary)' }}>
              No icons found for "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Inline icon picker button that opens the modal.
 */
export function IconPickerButton({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const iconPath = getIconByName(value);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-full"
        style={{ background: 'var(--color-surface-tertiary)', border: '1px solid var(--color-border-secondary)' }}
      >
        {iconPath ? (
          <Icon path={iconPath} size={0.8} color="var(--color-accent)" />
        ) : (
          <div className="w-5 h-5 rounded border border-dashed" style={{ borderColor: 'var(--color-text-tertiary)' }} />
        )}
        <span className="text-sm" style={{ color: iconPath ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>
          {value || 'Choose icon...'}
        </span>
      </button>
      {open && <IconPicker value={value} onChange={onChange} onClose={() => setOpen(false)} />}
    </>
  );
}

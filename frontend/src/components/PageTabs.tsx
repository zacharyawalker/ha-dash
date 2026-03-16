import { useState, useRef, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import Icon from '@mdi/react';
import { mdiPlus, mdiClose, mdiCheck, mdiCog, mdiImage, mdiPalette } from '@mdi/js';

export default function PageTabs() {
  const { mode, activePage, setActivePage, addPage, removePage, renamePage, updatePage, getPages } = useDashboardStore();
  const pages = getPages();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [settingsIndex, setSettingsIndex] = useState<number | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings popover on outside click
  useEffect(() => {
    if (settingsIndex == null) return;
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsIndex(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [settingsIndex]);

  if (pages.length <= 1 && mode !== 'edit') return null;

  const startRename = (index: number) => {
    setEditingIndex(index);
    setEditName(pages[index].name);
  };

  const confirmRename = () => {
    if (editingIndex != null && editName.trim()) {
      renamePage(editingIndex, editName.trim());
    }
    setEditingIndex(null);
  };

  return (
    <div
      className="flex items-center gap-1 px-4 py-1.5 overflow-x-auto"
      style={{ background: 'var(--color-surface-primary)', borderBottom: '1px solid var(--color-border-primary)' }}
    >
      {pages.map((page, i) => (
        <div
          key={page.id}
          className="flex items-center gap-1 shrink-0"
        >
          {editingIndex === i ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmRename();
                  if (e.key === 'Escape') setEditingIndex(null);
                }}
                autoFocus
                className="px-2 py-1 text-xs rounded outline-none w-24"
                style={{
                  background: 'var(--color-surface-tertiary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-focus)',
                }}
              />
              <button onClick={confirmRename} className="p-0.5">
                <Icon path={mdiCheck} size={0.5} color="var(--color-success)" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActivePage(i)}
              onDoubleClick={() => mode === 'edit' && startRename(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors"
              style={{
                background: i === activePage ? 'var(--color-accent-muted)' : 'transparent',
                color: i === activePage ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                border: i === activePage ? '1px solid var(--color-accent)' : '1px solid transparent',
              }}
            >
              {page.name}
              {mode === 'edit' && pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePage(i);
                  }}
                  className="ml-1 hover:opacity-80"
                >
                  <Icon path={mdiClose} size={0.4} color="var(--color-text-tertiary)" />
                </button>
              )}
            </button>
          )}
        </div>
      ))}

      {mode === 'edit' && (
        <>
          {/* Page settings gear for active page */}
          <div className="relative">
            <button
              onClick={() => setSettingsIndex(settingsIndex === activePage ? null : activePage)}
              className="p-1.5 rounded-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--color-text-tertiary)' }}
              title="Page settings"
            >
              <Icon path={mdiCog} size={0.5} />
            </button>

            {settingsIndex != null && (
              <div
                ref={settingsRef}
                className="absolute top-full left-0 mt-1 w-64 rounded-xl shadow-xl z-50 p-3 flex flex-col gap-3"
                style={{
                  background: 'var(--color-surface-primary)',
                  border: '1px solid var(--color-border-primary)',
                }}
              >
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Page: {pages[settingsIndex]?.name}
                </span>

                {/* Background Image */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                    <Icon path={mdiImage} size={0.4} /> Background Image URL
                  </label>
                  <input
                    type="text"
                    value={pages[settingsIndex]?.backgroundImage || ''}
                    onChange={(e) => updatePage(settingsIndex, { backgroundImage: e.target.value || undefined })}
                    placeholder="https://..."
                    className="w-full px-2 py-1.5 text-xs rounded-lg outline-none"
                    style={{
                      background: 'var(--color-surface-tertiary)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border-primary)',
                    }}
                  />
                </div>

                {/* Background Color */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                    <Icon path={mdiPalette} size={0.4} /> Background Color
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={pages[settingsIndex]?.backgroundColor || '#1a1a2e'}
                      onChange={(e) => updatePage(settingsIndex, { backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={pages[settingsIndex]?.backgroundColor || ''}
                      onChange={(e) => updatePage(settingsIndex, { backgroundColor: e.target.value || undefined })}
                      placeholder="#1a1a2e"
                      className="flex-1 px-2 py-1.5 text-xs rounded-lg outline-none"
                      style={{
                        background: 'var(--color-surface-tertiary)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border-primary)',
                      }}
                    />
                  </div>
                </div>

                {/* Clear button */}
                <button
                  onClick={() => {
                    updatePage(settingsIndex, { backgroundImage: undefined, backgroundColor: undefined });
                  }}
                  className="text-xs px-2 py-1 rounded-lg self-start"
                  style={{ background: 'var(--color-surface-tertiary)', color: 'var(--color-text-tertiary)' }}
                >
                  Clear Background
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => addPage()}
            className="flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg transition-colors"
            style={{ color: 'var(--color-text-tertiary)' }}
            title="Add page"
          >
            <Icon path={mdiPlus} size={0.5} />
          </button>
        </>
      )}
    </div>
  );
}

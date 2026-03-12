import { useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import Icon from '@mdi/react';
import { mdiPlus, mdiClose, mdiCheck } from '@mdi/js';

export default function PageTabs() {
  const { mode, activePage, setActivePage, addPage, removePage, renamePage, getPages } = useDashboardStore();
  const pages = getPages();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

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
        <button
          onClick={() => addPage()}
          className="flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg transition-colors"
          style={{ color: 'var(--color-text-tertiary)' }}
          title="Add page"
        >
          <Icon path={mdiPlus} size={0.5} />
        </button>
      )}
    </div>
  );
}

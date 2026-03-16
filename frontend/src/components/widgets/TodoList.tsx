import { useState, useCallback } from 'react';
import Icon from '@mdi/react';
import { mdiCheckboxMarked, mdiCheckboxBlankOutline, mdiPlus, mdiDelete } from '@mdi/js';
import { motion, AnimatePresence } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

/**
 * Local todo list widget — simple task tracking.
 * Data stored in widget config (persisted with dashboard).
 * No HA entity required.
 */
export default function TodoList({ config, mode }: WidgetProps) {
  const accentColor = (config.accentColor as string) || 'var(--color-accent)';
  const hideLabel = config.hideLabel as boolean;
  const title = String(config.label || 'To Do');

  // Todos stored in config as JSON string
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      return JSON.parse(String(config.todos || '[]'));
    } catch {
      return [];
    }
  });
  const [newText, setNewText] = useState('');

  const addTodo = useCallback(() => {
    if (!newText.trim() || mode === 'edit') return;
    const item: TodoItem = { id: Date.now().toString(), text: newText.trim(), done: false };
    setTodos((prev) => [...prev, item]);
    setNewText('');
  }, [newText, mode]);

  const toggleTodo = useCallback((id: string) => {
    if (mode === 'edit') return;
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }, [mode]);

  const removeTodo = useCallback((id: string) => {
    if (mode === 'edit') return;
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, [mode]);

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div className="flex flex-col w-full h-full rounded-card overflow-hidden"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {/* Header */}
      {!hideLabel && (
        <div className="flex items-center justify-between px-3 py-2"
          style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
          <span className="text-sm font-semibold" style={{ color: accentColor }}>{title}</span>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {doneCount}/{todos.length}
          </span>
        </div>
      )}

      {/* Todo items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <AnimatePresence>
          {todos.map((todo) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg group"
              style={{ background: todo.done ? `${accentColor}08` : 'transparent' }}
            >
              <button onClick={() => toggleTodo(todo.id)} disabled={mode === 'edit'}>
                <Icon
                  path={todo.done ? mdiCheckboxMarked : mdiCheckboxBlankOutline}
                  size={0.7}
                  color={todo.done ? accentColor : 'var(--color-text-tertiary)'}
                />
              </button>
              <span className="flex-1 text-xs" style={{
                color: todo.done ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                textDecoration: todo.done ? 'line-through' : 'none',
              }}>
                {todo.text}
              </span>
              <button onClick={() => removeTodo(todo.id)} disabled={mode === 'edit'}
                className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon path={mdiDelete} size={0.5} color="var(--color-text-tertiary)" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add input */}
      {mode === 'view' && (
        <div className="flex gap-1 p-2" style={{ borderTop: '1px solid var(--color-border-primary)' }}>
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add task..."
            className="flex-1 text-xs px-2 py-1.5 rounded-lg outline-none"
            style={{
              background: 'var(--color-surface-tertiary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-primary)',
            }}
          />
          <button onClick={addTodo} className="p-1.5 rounded-lg" style={{ background: `${accentColor}20` }}>
            <Icon path={mdiPlus} size={0.5} color={accentColor} />
          </button>
        </div>
      )}
    </div>
  );
}

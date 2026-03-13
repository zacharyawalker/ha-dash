import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiClose, mdiKeyboard } from '@mdi/js';

const SHORTCUTS = [
  { keys: ['Ctrl', 'Z'], desc: 'Undo' },
  { keys: ['Ctrl', 'Y'], desc: 'Redo' },
  { keys: ['Ctrl', 'C'], desc: 'Copy widget' },
  { keys: ['Ctrl', 'V'], desc: 'Paste widget' },
  { keys: ['Ctrl', 'G'], desc: 'Toggle grid snap' },
  { keys: ['Delete'], desc: 'Delete selected widget' },
  { keys: ['Escape'], desc: 'Deselect / close panels' },
  { keys: ['F11'], desc: 'Toggle fullscreen' },
  { keys: ['Swipe L/R'], desc: 'Navigate pages (view mode)' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ShortcutHelp({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-96 rounded-xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border-primary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
              <div className="flex items-center gap-2">
                <Icon path={mdiKeyboard} size={0.8} color="var(--color-accent)" />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Keyboard Shortcuts</h2>
              </div>
              <button onClick={onClose} className="hover:opacity-80" style={{ color: 'var(--color-text-secondary)' }}>
                <Icon path={mdiClose} size={0.8} />
              </button>
            </div>

            <div className="px-4 py-3 space-y-2">
              {SHORTCUTS.map((s) => (
                <div key={s.desc} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{s.desc}</span>
                  <div className="flex gap-1">
                    {s.keys.map((key) => (
                      <kbd
                        key={key}
                        className="px-2 py-0.5 text-xs font-mono rounded"
                        style={{
                          background: 'var(--color-surface-tertiary)',
                          border: '1px solid var(--color-border-secondary)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

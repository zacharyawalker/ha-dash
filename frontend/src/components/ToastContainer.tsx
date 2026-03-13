import { useToastStore } from '../store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiCheck, mdiAlertCircle, mdiInformation, mdiClose } from '@mdi/js';

const ICONS = {
  success: mdiCheck,
  error: mdiAlertCircle,
  info: mdiInformation,
};

const COLORS = {
  success: 'var(--color-success)',
  error: 'var(--color-error)',
  info: 'var(--color-accent)',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none" style={{ maxWidth: '360px' }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg pointer-events-auto"
            style={{
              background: 'var(--color-surface-primary)',
              border: `1px solid ${COLORS[toast.type]}33`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <Icon path={ICONS[toast.type]} size={0.7} color={COLORS[toast.type]} />
            <span className="flex-1 text-sm" style={{ color: 'var(--color-text-primary)' }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <Icon path={mdiClose} size={0.5} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

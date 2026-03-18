import { useEntityStore } from '../store/entityStore';
import Icon from '@mdi/react';
import { mdiWifiOff } from '@mdi/js';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Full-width banner that shows when WebSocket connection is lost.
 * Auto-dismisses when reconnected.
 */
export default function ConnectionBanner() {
  const initialized = useEntityStore((s) => s.initialized);
  const haConnected = useEntityStore((s) => s.haConnected);

  // Only show banner if entities never loaded (REST failed too)
  // Don't show for WebSocket flapping — REST polling handles state updates
  const showBanner = !initialized && !haConnected;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm"
            style={{
              background: status === 'error' ? 'var(--color-error)' : 'var(--color-warning)',
              color: 'white',
            }}
          >
            <Icon path={mdiWifiOff} size={0.6} />
            <span>
              {status === 'error'
                ? 'Connection error — retrying...'
                : status === 'disconnected'
                  ? 'Disconnected — reconnecting...'
                  : 'Home Assistant connection lost'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

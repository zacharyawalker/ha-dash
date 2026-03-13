import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiHome, mdiClose, mdiArrowRight } from '@mdi/js';

const STEPS = [
  {
    title: 'Welcome to HA Dash! 🏠',
    body: 'A free-form drag-and-drop dashboard for Home Assistant. Drop widgets anywhere — no grid constraints.',
  },
  {
    title: 'Edit Mode ✏️',
    body: 'Click "Edit" to enter edit mode. Add widgets, drag them around, resize with corner handles, and customize in the config panel.',
  },
  {
    title: 'Widget Library 📦',
    body: '43 widget types: lights, climate, media, cameras, gauges, charts, and more. Use Templates for quick room layouts.',
  },
  {
    title: 'Customize Everything 🎨',
    body: 'Click any widget in edit mode to open its config panel. Change icons, accent colors, labels, and layout options.',
  },
  {
    title: 'Keyboard Shortcuts ⌨️',
    body: 'Press ? for shortcuts. Ctrl+Z/Y for undo/redo, Ctrl+C/V to copy/paste widgets, Ctrl+G for grid snap.',
  },
];

interface Props {
  onDismiss: () => void;
}

export default function WelcomeOverlay({ onDismiss }: Props) {
  const [step, setStep] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-96 rounded-xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border-primary)' }}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
          <div className="flex items-center gap-2">
            <Icon path={mdiHome} size={0.8} color="var(--color-accent)" />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {STEPS[step].title}
            </span>
          </div>
          <button onClick={onDismiss} style={{ color: 'var(--color-text-tertiary)' }}>
            <Icon path={mdiClose} size={0.7} />
          </button>
        </div>

        <div className="px-4 py-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {STEPS[step].body}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress dots + navigation */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--color-border-primary)' }}>
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-colors"
                style={{ background: i === step ? 'var(--color-accent)' : 'var(--color-surface-tertiary)' }}
              />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg"
              style={{ background: 'var(--color-accent)', color: 'white' }}
            >
              Next
              <Icon path={mdiArrowRight} size={0.5} />
            </button>
          ) : (
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 text-xs font-medium rounded-lg"
              style={{ background: 'var(--color-accent)', color: 'white' }}
            >
              Get Started!
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

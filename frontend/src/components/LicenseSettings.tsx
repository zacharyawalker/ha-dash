import { useState } from 'react';
import { useLicenseStore } from '../store/licenseStore';
import Icon from '@mdi/react';
import { mdiShieldCheck, mdiShieldOff, mdiKey, mdiLoading, mdiClose, mdiStar } from '@mdi/js';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LicenseSettings({ open, onClose }: Props) {
  const { tier, valid, email, error, loading, activate, deactivate } = useLicenseStore();
  const [key, setKey] = useState('');
  const [activateError, setActivateError] = useState('');

  const handleActivate = async () => {
    if (!key.trim()) return;
    setActivateError('');
    const result = await activate(key.trim());
    if (!result.success) {
      setActivateError(result.error || 'Activation failed');
    } else {
      setKey('');
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          className="w-[440px] rounded-xl shadow-2xl overflow-hidden"
          style={{ background: 'var(--color-surface-primary)', border: '1px solid var(--color-border-primary)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
            <div className="flex items-center gap-2">
              <Icon path={mdiStar} size={0.8} color={tier === 'pro' ? '#f59e0b' : 'var(--color-text-tertiary)'} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                License & Subscription
              </span>
            </div>
            <button onClick={onClose}>
              <Icon path={mdiClose} size={0.6} color="var(--color-text-tertiary)" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Current status */}
            <div className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background: tier === 'pro' ? '#f59e0b12' : 'var(--color-surface-tertiary)',
                border: `1px solid ${tier === 'pro' ? '#f59e0b30' : 'var(--color-border-primary)'}`,
              }}>
              <Icon
                path={tier === 'pro' ? mdiShieldCheck : mdiShieldOff}
                size={1.2}
                color={tier === 'pro' ? '#f59e0b' : 'var(--color-text-tertiary)'}
              />
              <div>
                <div className="text-sm font-semibold" style={{ color: tier === 'pro' ? '#f59e0b' : 'var(--color-text-primary)' }}>
                  {tier === 'pro' ? 'HA Dash Pro' : 'HA Dash Free'}
                </div>
                {tier === 'pro' && email && (
                  <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    Licensed to {email}
                  </div>
                )}
                {tier === 'free' && (
                  <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    19 widgets • 1 dashboard • 3 pages
                  </div>
                )}
              </div>
            </div>

            {/* Pro features list */}
            {tier === 'free' && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>
                  Upgrade to Pro for:
                </span>
                {[
                  '50+ widgets (all types)',
                  'Unlimited dashboards & pages',
                  'Widget palette sidebar',
                  'Quick search (Ctrl+K)',
                  'Auto-arrange & templates',
                  'Dashboard import/export',
                  'Custom themes',
                  'Priority support',
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: '#f59e0b' }}>★</span> {feat}
                  </div>
                ))}
              </div>
            )}

            {/* Activate / Deactivate */}
            {tier === 'free' ? (
              <div className="space-y-2">
                <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  License Key
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: 'var(--color-surface-tertiary)', border: '1px solid var(--color-border-primary)' }}>
                    <Icon path={mdiKey} size={0.5} color="var(--color-text-tertiary)" />
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="flex-1 bg-transparent outline-none text-sm font-mono"
                      style={{ color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <button
                    onClick={handleActivate}
                    disabled={loading || !key.trim()}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity"
                    style={{
                      background: '#f59e0b',
                      color: 'white',
                      opacity: loading || !key.trim() ? 0.5 : 1,
                    }}
                  >
                    {loading ? <Icon path={mdiLoading} size={0.6} spin={0.8} /> : 'Activate'}
                  </button>
                </div>
                {(activateError || error) && (
                  <div className="text-xs" style={{ color: 'var(--color-error)' }}>
                    {activateError || error}
                  </div>
                )}
                <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Get a license at <a href="https://hadash.dev" target="_blank" rel="noopener"
                    style={{ color: '#f59e0b', textDecoration: 'underline' }}>hadash.dev</a>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {valid ? 'License active' : 'License cached (offline)'}
                </span>
                <button
                  onClick={deactivate}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--color-surface-tertiary)', color: 'var(--color-text-tertiary)' }}
                >
                  Deactivate
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

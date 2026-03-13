import { useState } from 'react';
import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import {
  mdiShieldHome, mdiShieldLock, mdiShieldCheck, mdiShieldOff,
  mdiShield, mdiBellRing,
} from '@mdi/js';
import { motion } from 'framer-motion';
import type { WidgetProps } from '../../types/widget';

const STATE_CONFIG: Record<string, { icon: string; color: string; label: string; bg: string }> = {
  armed_home: { icon: mdiShieldHome, color: '#22c55e', label: 'Armed Home', bg: '#22c55e15' },
  armed_away: { icon: mdiShieldLock, color: '#3b82f6', label: 'Armed Away', bg: '#3b82f615' },
  armed_night: { icon: mdiShield, color: '#6366f1', label: 'Armed Night', bg: '#6366f115' },
  armed_vacation: { icon: mdiShieldCheck, color: '#8b5cf6', label: 'Vacation', bg: '#8b5cf615' },
  disarmed: { icon: mdiShieldOff, color: 'var(--color-text-tertiary)', label: 'Disarmed', bg: 'var(--color-surface-secondary)' },
  triggered: { icon: mdiBellRing, color: '#ef4444', label: 'TRIGGERED', bg: '#ef444425' },
  arming: { icon: mdiShield, color: '#f59e0b', label: 'Arming...', bg: '#f59e0b15' },
  pending: { icon: mdiShield, color: '#f59e0b', label: 'Pending...', bg: '#f59e0b15' },
};

export default function AlarmPanel({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);
  const [code, setCode] = useState('');
  const [showKeypad, setShowKeypad] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const state = entity?.state || 'disarmed';
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.disarmed;
  const label = String(config.label || entity?.attributes?.friendly_name || 'Alarm');
  const codeRequired = entity?.attributes?.code_arm_required !== false;

  const arm = async (armState: string) => {
    if (mode === 'edit' || !config.entityId) return;
    if (codeRequired && !code) {
      setPendingAction(armState);
      setShowKeypad(true);
      return;
    }
    try {
      await callService('alarm_control_panel', armState, {
        entity_id: config.entityId,
        ...(code ? { code } : {}),
      });
      setCode('');
      setShowKeypad(false);
      setPendingAction(null);
    } catch (e) {
      console.error('[AlarmPanel]', e);
    }
  };

  const submitCode = async () => {
    if (pendingAction) {
      await arm(pendingAction);
    }
  };

  const isTriggered = state === 'triggered';

  return (
    <motion.div
      animate={isTriggered ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.5, repeat: isTriggered ? Infinity : 0 }}
      className="flex flex-col items-center w-full h-full rounded-card p-3 gap-2"
      style={{ background: cfg.bg }}
    >
      {/* Status */}
      <div className="flex items-center gap-2">
        <motion.div
          animate={isTriggered ? { rotate: [0, -15, 15, 0] } : {}}
          transition={{ duration: 0.3, repeat: isTriggered ? Infinity : 0 }}
        >
          <Icon path={cfg.icon} size={1.5} color={cfg.color} />
        </motion.div>
        <div className="text-center">
          <span className="font-bold block" style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>{label}</span>
          <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
        </div>
      </div>

      {/* Action buttons */}
      {!showKeypad ? (
        <div className="grid grid-cols-2 gap-1.5 w-full flex-1">
          {[
            { action: 'alarm_arm_home', label: 'Home', icon: mdiShieldHome, color: '#22c55e' },
            { action: 'alarm_arm_away', label: 'Away', icon: mdiShieldLock, color: '#3b82f6' },
            { action: 'alarm_arm_night', label: 'Night', icon: mdiShield, color: '#6366f1' },
            { action: 'alarm_disarm', label: 'Disarm', icon: mdiShieldOff, color: 'var(--color-text-secondary)' },
          ].map((btn) => (
            <button
              key={btn.action}
              onClick={() => arm(btn.action)}
              disabled={mode === 'edit'}
              className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all text-xs font-medium"
              style={{
                background: 'var(--color-surface-tertiary)',
                color: btn.color,
                cursor: mode === 'edit' ? 'grab' : 'pointer',
              }}
            >
              <Icon path={btn.icon} size={0.7} color={btn.color} />
              {btn.label}
            </button>
          ))}
        </div>
      ) : (
        /* Keypad */
        <div className="w-full flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              className="flex-1 px-3 py-2 text-sm text-center rounded-lg outline-none font-mono tracking-widest"
              style={{ background: 'var(--color-surface-tertiary)', color: 'var(--color-text-primary)' }}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'ok'].map((key, i) => (
              <button
                key={i}
                onClick={() => {
                  if (key === 'ok') submitCode();
                  else if (key !== null) setCode((c) => c + key);
                }}
                disabled={key === null}
                className="py-2 text-sm font-bold rounded-lg transition-colors"
                style={{
                  background: key === 'ok' ? 'var(--color-success)' : 'var(--color-surface-tertiary)',
                  color: key === 'ok' ? 'white' : 'var(--color-text-primary)',
                  visibility: key === null ? 'hidden' : 'visible',
                }}
              >
                {key === 'ok' ? '✓' : key}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setShowKeypad(false); setCode(''); setPendingAction(null); }}
            className="text-xs py-1"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Cancel
          </button>
        </div>
      )}
    </motion.div>
  );
}

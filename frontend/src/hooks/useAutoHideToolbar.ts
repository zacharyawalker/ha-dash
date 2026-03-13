import { useState, useEffect, useCallback } from 'react';

/**
 * Auto-hide toolbar in view mode after inactivity.
 * Shows on mouse move, hides after 3 seconds of no activity.
 * Always visible in edit mode.
 */
export function useAutoHideToolbar(mode: 'edit' | 'view') {
  const [visible, setVisible] = useState(true);

  const show = useCallback(() => setVisible(true), []);

  useEffect(() => {
    if (mode === 'edit') {
      setVisible(true);
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;

    const handleActivity = () => {
      setVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setVisible(false), 3000);
    };

    // Start hidden timer
    timeout = setTimeout(() => setVisible(false), 3000);

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [mode]);

  return { toolbarVisible: visible, showToolbar: show };
}

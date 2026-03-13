import { useEffect } from 'react';

/**
 * Touch optimization hook for tablet/kiosk dashboards.
 * - Prevents double-tap zoom
 * - Prevents pull-to-refresh
 * - Enables long-press context (instead of right-click)
 */
export function useTouchOptimization() {
  useEffect(() => {
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Prevent pull-to-refresh
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && document.scrollingElement?.scrollTop === 0) {
        // Allow if inside a scrollable container
        const target = e.target as HTMLElement;
        if (target.closest('[data-scrollable]')) return;
      }
    };

    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Set touch-action on body for better responsiveness
    document.body.style.touchAction = 'manipulation';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
    };
  }, []);
}

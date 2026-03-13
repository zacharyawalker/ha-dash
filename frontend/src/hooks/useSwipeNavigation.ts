import { useEffect, useRef } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

/**
 * Swipe left/right to navigate between dashboard pages.
 * Only active in view mode. Uses touch events.
 */
export function useSwipeNavigation() {
  const mode = useDashboardStore((s) => s.mode);
  const activePage = useDashboardStore((s) => s.activePage);
  const setActivePage = useDashboardStore((s) => s.setActivePage);
  const getPages = useDashboardStore((s) => s.getPages);
  const startX = useRef(0);
  const startY = useRef(0);

  useEffect(() => {
    if (mode === 'edit') return;

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;

      // Only trigger on horizontal swipes (not vertical scrolls)
      if (Math.abs(dx) < 80 || Math.abs(dy) > Math.abs(dx) * 0.5) return;

      const pages = getPages();
      if (dx < 0 && activePage < pages.length - 1) {
        setActivePage(activePage + 1);
      } else if (dx > 0 && activePage > 0) {
        setActivePage(activePage - 1);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [mode, activePage, setActivePage, getPages]);
}

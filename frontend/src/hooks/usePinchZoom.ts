import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Pinch-to-zoom for the dashboard canvas on touch devices.
 * Returns the current zoom level and handlers to attach to the canvas.
 */
export function usePinchZoom(minZoom = 0.3, maxZoom = 2.0) {
  const [zoom, setZoom] = useState(1);
  const lastDistRef = useRef(0);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDistRef.current = Math.hypot(dx, dy);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);

      if (lastDistRef.current > 0) {
        const scaleFactor = dist / lastDistRef.current;
        setZoom((prev) => Math.min(maxZoom, Math.max(minZoom, prev * scaleFactor)));
      }
      lastDistRef.current = dist;
    }
  }, [minZoom, maxZoom]);

  const handleTouchEnd = useCallback(() => {
    lastDistRef.current = 0;
  }, []);

  const bindCanvas = useCallback((el: HTMLDivElement | null) => {
    if (canvasRef.current) {
      canvasRef.current.removeEventListener('touchstart', handleTouchStart);
      canvasRef.current.removeEventListener('touchmove', handleTouchMove);
      canvasRef.current.removeEventListener('touchend', handleTouchEnd);
    }
    canvasRef.current = el;
    if (el) {
      el.addEventListener('touchstart', handleTouchStart, { passive: false });
      el.addEventListener('touchmove', handleTouchMove, { passive: false });
      el.addEventListener('touchend', handleTouchEnd);
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Ctrl+scroll wheel zoom for desktop
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.95 : 1.05;
        setZoom((prev) => Math.min(maxZoom, Math.max(minZoom, prev * delta)));
      }
    };
    window.addEventListener('wheel', handler, { passive: false });
    return () => window.removeEventListener('wheel', handler);
  }, [minZoom, maxZoom]);

  const resetZoom = useCallback(() => setZoom(1), []);

  return { zoom, setZoom, resetZoom, bindCanvas };
}

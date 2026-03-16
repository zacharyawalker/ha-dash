import { useState, useEffect } from 'react';

/**
 * Returns a scale factor for the canvas based on viewport width.
 * Desktop (1920+): 1.0
 * Laptop (1280-1919): 0.85
 * Tablet (768-1279): 0.65
 * Phone (< 768): 0.45
 *
 * Used to scale the entire dashboard canvas on smaller screens.
 */
export function useResponsiveScale(): { scale: number; width: number; height: number; breakpoint: string } {
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handler = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  let scale = 1;
  let breakpoint = 'desktop';

  if (dims.width < 768) {
    scale = 0.45;
    breakpoint = 'phone';
  } else if (dims.width < 1280) {
    scale = 0.65;
    breakpoint = 'tablet';
  } else if (dims.width < 1920) {
    scale = 0.85;
    breakpoint = 'laptop';
  }

  return { scale, width: dims.width, height: dims.height, breakpoint };
}

/**
 * Mobile Detection Hook
 * Eliminates duplicate mobile detection code across 6+ components
 */

import { useState, useEffect } from 'react';

/**
 * Detects if viewport is mobile size
 * @param {number} breakpoint - Width breakpoint in pixels (default: 640 for Tailwind sm)
 * @returns {boolean} - True if mobile viewport
 */
export const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
};

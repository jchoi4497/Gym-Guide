import { useState, useEffect } from 'react';

/**
 * Hook to detect if screen is mobile size
 * @param {number} breakpoint - Width in pixels (default 640 for Tailwind sm)
 * @returns {boolean} true if screen width is below breakpoint
 */
export const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
};

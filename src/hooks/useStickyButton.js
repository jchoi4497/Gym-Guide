import { useState, useEffect } from 'react';

/**
 * Custom hook to manage sticky button behavior on mobile
 * Unsticks button when user scrolls near bottom of page
 */
export function useStickyButton(isWorkoutConfigured) {
  const [isButtonSticky, setIsButtonSticky] = useState(true);

  useEffect(() => {
    if (!isWorkoutConfigured) return; // Only run when workout is configured

    let animationFrameId;
    let lastScrollY = -1;
    let lastDocHeight = -1;

    const checkScroll = () => {
      // Only on mobile (screen width < 640px - Tailwind's sm breakpoint)
      if (window.innerWidth >= 640) {
        setIsButtonSticky(false);
        animationFrameId = requestAnimationFrame(checkScroll);
        return;
      }

      // Try multiple ways to get scroll position
      const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

      // Try multiple ways to get document height (body.scrollHeight works better on some mobile browsers)
      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.offsetHeight
      );

      // Check if scroll position OR document height changed
      if (currentScrollY !== lastScrollY || documentHeight !== lastDocHeight) {
        lastScrollY = currentScrollY;
        lastDocHeight = documentHeight;

        const scrollPosition = currentScrollY + window.innerHeight;
        const distanceFromBottom = documentHeight - scrollPosition;

        // If page content hasn't loaded yet (too short), default to sticky
        if (documentHeight < 1000) {
          setIsButtonSticky(true);
        } else {
          // Use hysteresis to prevent flickering:
          // - Unstick when within 150px of bottom
          // - Re-stick when scrolling back up beyond 400px from bottom
          setIsButtonSticky((prevSticky) => {
            if (prevSticky) {
              // Currently sticky - unstick only if very close to bottom
              return distanceFromBottom >= 150;
            } else {
              // Currently not sticky - stick only if far enough from bottom
              return distanceFromBottom >= 400;
            }
          });
        }
      }

      animationFrameId = requestAnimationFrame(checkScroll);
    };

    // Start the animation frame loop
    animationFrameId = requestAnimationFrame(checkScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isWorkoutConfigured]);

  return isButtonSticky;
}

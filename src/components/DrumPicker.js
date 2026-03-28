import { useEffect, useRef, useState } from 'react';

function DrumPicker({
  value,
  onChange,
  min = 0,
  max = 500,
  step = 0.5,
  label = '',
  unit = ''
}) {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastValue, setLastValue] = useState(value);
  const [, forceUpdate] = useState(0); // For forcing re-renders
  const animationRef = useRef(null);
  const lastTouchTime = useRef(Date.now());
  const lastTouchY = useRef(0);

  const ITEM_HEIGHT = 44; // Height of each item in pixels
  const VISIBLE_ITEMS = 5; // Number of visible items

  // Generate the list of values
  const coreValues = [];
  for (let i = min; i <= max; i += step) {
    coreValues.push(Math.round(i * 10) / 10); // Round to 1 decimal place
  }

  // Add wrap-around values for infinite scroll illusion
  // 3 full rotations for best infinite feel
  const values = [...coreValues, ...coreValues, ...coreValues];
  const wrapOffset = coreValues.length; // Offset to start at middle copy

  // Find current index in core values, then add offset for wrapped values
  const coreIndex = coreValues.findIndex(v => v === value);
  const validIndex = coreIndex >= 0 ? coreIndex + wrapOffset : wrapOffset;

  // Haptic feedback
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // 10ms vibration
    }
  };

  // Scroll to specific index
  const scrollToIndex = (index, smooth = true) => {
    if (!scrollRef.current) return;
    const targetScroll = index * ITEM_HEIGHT;
    if (smooth) {
      scrollRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    } else {
      scrollRef.current.scrollTop = targetScroll;
    }
  };

  // Initialize scroll position
  useEffect(() => {
    scrollToIndex(validIndex, false);
    setLastValue(value);
  }, []);

  // Handle scroll and snap to nearest value
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(values.length - 1, index));

    // Always update to the value at the center position
    if (values[clampedIndex] !== value) {
      onChange(values[clampedIndex]);
      setLastValue(values[clampedIndex]);
      triggerHaptic();
    }
  };

  // Momentum scrolling with velocity
  const applyMomentum = () => {
    if (Math.abs(velocity) < 1) {
      setVelocity(0);
      // Snap to nearest when momentum stops
      if (scrollRef.current) {
        const index = Math.round(scrollRef.current.scrollTop / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
        scrollToIndex(clampedIndex, true);
      }
      return;
    }

    if (!scrollRef.current) return;

    const newScrollTop = scrollRef.current.scrollTop + velocity;
    scrollRef.current.scrollTop = newScrollTop;

    // Faster deceleration for snappier feel
    setVelocity(velocity * 0.92);

    animationRef.current = requestAnimationFrame(applyMomentum);
  };

  useEffect(() => {
    if (velocity !== 0 && !isDragging) {
      animationRef.current = requestAnimationFrame(applyMomentum);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [velocity, isDragging]);

  // Touch handlers for momentum
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setVelocity(0);
    setStartY(e.touches[0].clientY);
    setScrollTop(scrollRef.current.scrollTop);
    lastTouchTime.current = Date.now();
    lastTouchY.current = e.touches[0].clientY;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const deltaY = startY - currentY;
    scrollRef.current.scrollTop = scrollTop + deltaY;

    // Calculate velocity for momentum
    const currentTime = Date.now();
    const timeDelta = currentTime - lastTouchTime.current;
    if (timeDelta > 0) {
      const yDelta = lastTouchY.current - currentY;
      setVelocity(yDelta / timeDelta * 16); // Convert to ~60fps
    }

    lastTouchTime.current = currentTime;
    lastTouchY.current = currentY;

    // Trigger haptic on value change during drag
    const currentScrollTop = scrollRef.current.scrollTop;
    const index = Math.round(currentScrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
    if (values[clampedIndex] !== lastValue) {
      setLastValue(values[clampedIndex]);
      triggerHaptic();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Momentum will be applied via useEffect
  };

  // Snap to nearest after momentum stops
  useEffect(() => {
    if (!isDragging && Math.abs(velocity) < 1) {
      const timer = setTimeout(() => {
        if (!scrollRef.current) return;
        const index = Math.round(scrollRef.current.scrollTop / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
        scrollToIndex(clampedIndex, true);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isDragging, velocity]);

  return (
    <div className="flex flex-col items-center" style={{ background: 'transparent', backgroundColor: 'transparent' }}>
      {label && <div className="text-sm text-gray-600 mb-2 font-medium">{label}</div>}
      <div
        ref={containerRef}
        className="relative w-24 overflow-hidden"
        style={{
          height: '350px', // Much taller to fill white space and show more numbers
          background: 'transparent',
          backgroundColor: 'transparent',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      >

        {/* Scrollable drum */}
        <div
          ref={scrollRef}
          className="h-full overflow-y-scroll scrollbar-hide"
          style={{
            background: 'transparent',
            backgroundColor: 'transparent',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onScroll={() => {
            handleScroll();
            forceUpdate(prev => prev + 1); // Force re-render to update highlighting
          }}
        >
          {/* Top padding - aligned to center selected value in highlight box */}
          <div style={{ height: `${ITEM_HEIGHT * 3}px`, background: 'transparent' }} />

          {/* Values */}
          {values.map((val, index) => {
            // Calculate which value is at the center of the viewport
            const scrollTop = scrollRef.current?.scrollTop || 0;
            const centerIndex = Math.round(scrollTop / ITEM_HEIGHT);
            const isAtCenter = index === centerIndex;

            return (
              <div
                key={index}
                className={`flex items-center justify-center transition-all duration-150 ${
                  isAtCenter ? 'text-2xl font-bold text-gray-900' : 'text-lg text-gray-400'
                }`}
                style={{ height: `${ITEM_HEIGHT}px`, background: 'transparent', backgroundColor: 'transparent' }}
              >
                {val}{unit}
              </div>
            );
          })}

          {/* Bottom padding - matches top for symmetry */}
          <div style={{ height: `${ITEM_HEIGHT * 3}px`, background: 'transparent' }} />
        </div>
      </div>
    </div>
  );
}

export default DrumPicker;

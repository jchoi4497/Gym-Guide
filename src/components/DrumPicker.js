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
  const animationRef = useRef(null);
  const lastTouchTime = useRef(Date.now());
  const lastTouchY = useRef(0);

  const ITEM_HEIGHT = 44; // Height of each item in pixels
  const VISIBLE_ITEMS = 5; // Number of visible items

  // Generate the list of values
  const values = [];
  for (let i = min; i <= max; i += step) {
    values.push(Math.round(i * 10) / 10); // Round to 1 decimal place
  }

  // Find current index
  const currentIndex = values.findIndex(v => v === value);
  const validIndex = currentIndex >= 0 ? currentIndex : 0;

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
    if (!scrollRef.current || isDragging) return;

    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(values.length - 1, index));

    if (values[clampedIndex] !== lastValue) {
      onChange(values[clampedIndex]);
      setLastValue(values[clampedIndex]);
      triggerHaptic();
    }
  };

  // Momentum scrolling with velocity
  const applyMomentum = () => {
    if (Math.abs(velocity) < 0.5) {
      setVelocity(0);
      handleScroll();
      return;
    }

    if (!scrollRef.current) return;

    const newScrollTop = scrollRef.current.scrollTop + velocity;
    scrollRef.current.scrollTop = newScrollTop;

    // Deceleration
    setVelocity(velocity * 0.95);

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
    if (!isDragging && Math.abs(velocity) < 0.5) {
      const timer = setTimeout(() => {
        if (!scrollRef.current) return;
        const index = Math.round(scrollRef.current.scrollTop / ITEM_HEIGHT);
        scrollToIndex(index, true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isDragging, velocity]);

  return (
    <div className="flex flex-col items-center">
      {label && <div className="text-sm text-gray-600 mb-2 font-medium">{label}</div>}
      <div
        ref={containerRef}
        className="relative w-24 h-56 overflow-hidden"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
          maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
        }}
      >
        {/* Selection highlight */}
        <div
          className="absolute left-0 right-0 bg-blue-100 border-t-2 border-b-2 border-blue-400 pointer-events-none z-10"
          style={{
            top: `${ITEM_HEIGHT * 2}px`,
            height: `${ITEM_HEIGHT}px`,
          }}
        />

        {/* Scrollable drum */}
        <div
          ref={scrollRef}
          className="h-full overflow-y-scroll scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onScroll={handleScroll}
        >
          {/* Top padding */}
          <div style={{ height: `${ITEM_HEIGHT * 2}px` }} />

          {/* Values */}
          {values.map((val, index) => {
            const isSelected = val === value;
            return (
              <div
                key={index}
                className={`flex items-center justify-center transition-all duration-150 ${
                  isSelected ? 'text-2xl font-bold text-blue-600' : 'text-lg text-gray-500'
                }`}
                style={{ height: `${ITEM_HEIGHT}px` }}
              >
                {val}{unit}
              </div>
            );
          })}

          {/* Bottom padding */}
          <div style={{ height: `${ITEM_HEIGHT * 2}px` }} />
        </div>
      </div>
    </div>
  );
}

export default DrumPicker;

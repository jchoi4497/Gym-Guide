import { useState, useEffect, useRef } from 'react';
import { formatTime, WORKOUT_SETTINGS } from '../config/workoutSettings';

function RestTimer({
  isActive,
  duration = WORKOUT_SETTINGS.DEFAULT_REST_DURATION,
  onTimerEnd,
  onSkip,
}) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

  useEffect(() => {
    if (isActive && !isPaused) {
      // Initialize start time on first render
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
        const remaining = duration - elapsed;

        if (remaining <= 0) {
          setTimeRemaining(0);
          clearInterval(interval);
          playSound();
          if (onTimerEnd) onTimerEnd();
        } else {
          setTimeRemaining(remaining);
        }
      }, 100); // Update every 100ms for smooth countdown

      return () => clearInterval(interval);
    }
  }, [isActive, isPaused, duration, onTimerEnd]);

  useEffect(() => {
    // Reset when timer becomes active
    if (isActive) {
      setTimeRemaining(duration);
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setIsPaused(false);
    }
  }, [isActive, duration]);

  const playSound = () => {
    if (WORKOUT_SETTINGS.SOUND_ENABLED && audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const handlePause = () => {
    if (!isPaused) {
      pausedTimeRef.current += Date.now() - (startTimeRef.current + pausedTimeRef.current);
    }
    setIsPaused(!isPaused);
  };

  const handleExtend = (seconds) => {
    const newDuration = duration + seconds;
    const elapsed = duration - timeRemaining;
    const newRemaining = newDuration - elapsed;
    setTimeRemaining(newRemaining);
  };

  const handleSkip = () => {
    setTimeRemaining(0);
    if (onSkip) onSkip();
  };

  if (!isActive) return null;

  const isEnded = timeRemaining <= 0;
  const progressPercent = ((duration - timeRemaining) / duration) * 100;

  return (
    <>
      {/* Audio element for timer end sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuAy/DPgjMOEWGu6OScTgwNUKfh8LhjHAU7k9n0yXkhBSd+y/LajkALFGS56OekUhINR6Hh77ZpIQUrhM3v0IU2DhNmrurojUcND1Cn4e+2YhwFOpPY9Ml5IQUnf8zy2o5ACxRku+vnpFISjUeh4e+2aSEFK4TN8NKFNg4TZq7o6I1HDQ9Qp+HwtmIcBTqT2PTJeSEFJ4HM8tqOQAsUZLvr56RSEo1Ioe+3aSEFK4TN8NKFNg4TZq7o6I1HDQ9Qp+HwtmIcBTqT2PTJeSEFJ4HM8tqOQAsUZLvr56RSEo1Ioe+3aSEFK4TN8NKFNg4TZq7o6I1HDQ9Qp+HwtmIcBTqT2PTJeSEFJ4HM8tqOQAsUZLvr56RSEo1Ioe+3aSEFK4TN8NKFNg4TZq7o6I1HDQ9Qp+HwtmIcBTqT2PTJeSEFJ4HM8tqOQAsUZLvr56RSEo1Ioe+3aSEFK4TN8NKFNg4=" type="audio/wav" />
      </audio>

      {/* Rest Timer Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          {/* Header */}
          <h2 className="text-2xl font-bold text-center mb-6">
            {isEnded ? '✅ Rest Complete!' : '⏱️ Rest Timer'}
          </h2>

          {/* Circular Progress */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="transform -rotate-90 w-48 h-48">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke={isEnded ? "#10b981" : "#3b82f6"}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progressPercent / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-5xl font-bold ${isEnded ? 'text-green-600' : 'text-gray-800'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          {/* Status Message */}
          {isEnded && (
            <p className="text-center text-gray-600 mb-6">
              Ready for your next set!
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {!isEnded && (
              <>
                {/* Pause/Resume */}
                <button
                  onClick={handlePause}
                  className="w-full py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors"
                >
                  {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                </button>

                {/* Extend Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExtend(30)}
                    className="flex-1 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors text-sm"
                  >
                    +30s
                  </button>
                  <button
                    onClick={() => handleExtend(60)}
                    className="flex-1 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors text-sm"
                  >
                    +60s
                  </button>
                </div>
              </>
            )}

            {/* Skip/Continue Button */}
            <button
              onClick={handleSkip}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                isEnded
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isEnded ? '→ Continue to Next Set' : 'Skip Rest'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default RestTimer;

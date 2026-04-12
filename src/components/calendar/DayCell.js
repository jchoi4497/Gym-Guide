import { useState, useEffect, useRef } from 'react';
import AddWorkoutWizard from './AddWorkoutWizard';

function DayCell({ date, workouts, isToday, isSelected, onClick, templates, onAddWorkout }) {
  const [isAddMode, setIsAddMode] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState({});
  const cellRef = useRef(null);
  const popoverRef = useRef(null);

  // Reset add mode when popover closes
  useEffect(() => {
    if (!isSelected) {
      setIsAddMode(false);
    }
  }, [isSelected]);

  // Dynamic positioning to prevent overflow
  useEffect(() => {
    if (!isSelected || !cellRef.current || !popoverRef.current) {
      return;
    }

    const updatePosition = () => {
      const cellRect = cellRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const MARGIN = 8; // Margin from viewport edges
      const style = {};

      // Horizontal positioning
      // Try to position left-aligned first
      let left = cellRect.left;

      // If it overflows right, align to the right edge of the cell
      if (left + popoverRect.width > viewportWidth - MARGIN) {
        left = cellRect.right - popoverRect.width;
      }

      // If still overflows left (on very small screens), push it right
      if (left < MARGIN) {
        left = MARGIN;
      }

      style.left = `${left}px`;

      // Vertical positioning
      // Try below first
      let top = cellRect.bottom + 8;

      // If it overflows bottom, show above
      if (top + popoverRect.height > viewportHeight - MARGIN) {
        top = cellRect.top - popoverRect.height - 8;
      }

      // If still overflows top, position at top of viewport
      if (top < MARGIN) {
        top = MARGIN;
      }

      style.top = `${top}px`;

      setPopoverStyle(style);
    };

    // Initial position calculation
    updatePosition();

    // Recalculate on scroll or resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isSelected, isAddMode]);

  if (!date) {
    return <div className="min-h-16 sm:min-h-20 p-1 sm:p-2 rounded-lg bg-transparent" />;
  }

  return (
    <>
      <div
        ref={cellRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`
          min-h-16 sm:min-h-20 p-1 sm:p-2 rounded-lg cursor-pointer transition-all duration-200
          bg-gray-50 hover:bg-blue-50
          ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
          ${isSelected ? 'ring-2 ring-green-500 bg-green-50 z-10' : ''}
        `}
      >
        <div className={`text-xs sm:text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
          {date.getDate()}
        </div>
        <div className="flex flex-wrap gap-1">
          {workouts.map((workout, idx) => (
            <div
              key={idx}
              className="w-2 h-2 rounded-full bg-blue-500"
              title={workout.muscleGroup}
            />
          ))}
        </div>
      </div>

      {/* Expanded Popover - Fixed positioning to prevent overflow */}
      {isSelected && (
        <div
          ref={popoverRef}
          className="fixed bg-white rounded-xl shadow-2xl p-4 z-50 animate-fadeIn border-2 border-green-500 max-h-96 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 'min(270px, 90vw)',
            maxWidth: '90vw',
            ...popoverStyle,
          }}
        >
          {!isAddMode ? (
            /* View Mode */
            <>
              <div className="mb-3">
                <p className="font-bold text-gray-800 mb-1">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-gray-500">
                  {date.toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
              </div>

              {workouts.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {workouts.map((workout, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-2">
                      <p className="font-bold text-sm text-gray-800">{workout.muscleGroup}</p>
                      <p className="text-xs text-gray-600">
                        {workout.customSetCount || workout.numberOfSets}x{workout.customRepCount || '8-12'}
                      </p>
                      {workout.label && (
                        <p className="text-xs text-gray-500 italic mt-1">{workout.label}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic mb-3">No workouts scheduled</p>
              )}

              <button
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                onClick={() => setIsAddMode(true)}
              >
                + Add Workout
              </button>
            </>
          ) : (
            /* Add Mode - Wizard */
            <AddWorkoutWizard
              templates={templates}
              onComplete={(workoutData) => {
                onAddWorkout(date, workoutData);
                setIsAddMode(false);
              }}
              onCancel={() => setIsAddMode(false)}
            />
          )}
        </div>
      )}
    </>
  );
}

export default DayCell;

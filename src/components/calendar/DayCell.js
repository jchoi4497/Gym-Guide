import { useState, useEffect, useRef } from 'react';
import AddWorkoutWizard from './AddWorkoutWizard';

function DayCell({ date, workouts, isToday, isSelected, onClick, templates, onAddWorkout, onDeleteWorkout }) {
  const [isAddMode, setIsAddMode] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [popoverStyle, setPopoverStyle] = useState({});
  const cellRef = useRef(null);
  const popoverRef = useRef(null);

  // Reset modes when popover closes
  useEffect(() => {
    if (!isSelected) {
      setIsAddMode(false);
      setEditingWorkout(null);
      setShowDeleteConfirm(null);
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
              className="w-2 h-2 rounded-full bg-green-500"
              title={workout.templateName || workout.muscleGroup}
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
          {!isAddMode && !editingWorkout ? (
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
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 relative">
                      {showDeleteConfirm === workout.id ? (
                        /* Delete Confirmation */
                        <div className="text-center">
                          <p className="text-sm text-gray-800 font-semibold mb-2">Delete this workout?</p>
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteWorkout(date, workout.id);
                                setShowDeleteConfirm(null);
                              }}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(null);
                              }}
                              className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs font-semibold rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal Display */
                        <>
                          <div className="flex gap-1 absolute top-2 right-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingWorkout(workout);
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Edit workout"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(workout.id);
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Delete workout"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <p className="font-bold text-sm text-gray-800 pr-12">
                            {workout.templateName || workout.muscleGroup}
                          </p>
                          {workout.templateName && workout.muscleGroup && (
                            <p className="text-xs text-blue-600 font-semibold">{workout.muscleGroup}</p>
                          )}
                          <p className="text-xs text-gray-600">
                            {workout.customSetCount || workout.numberOfSets}x{workout.customRepCount || '8-12'}
                          </p>
                          {workout.label && (
                            <p className="text-xs text-gray-500 italic mt-1">{workout.label}</p>
                          )}
                        </>
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
          ) : editingWorkout ? (
            /* Edit Mode - Wizard */
            <AddWorkoutWizard
              templates={templates}
              initialData={editingWorkout}
              onComplete={(workoutData) => {
                // Update the workout while preserving its ID
                onAddWorkout(date, { ...workoutData, id: editingWorkout.id });
                setEditingWorkout(null);
              }}
              onCancel={() => setEditingWorkout(null)}
            />
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

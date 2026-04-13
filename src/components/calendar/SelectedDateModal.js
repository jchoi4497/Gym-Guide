import { useEffect, useRef } from 'react';
import { getWorkoutSetsRepsDisplay } from '../../utils/workoutDisplay';

function SelectedDateModal({ date, workouts, onClose }) {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!date) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {date.toLocaleDateString('en-US', { weekday: 'long' })}
        </p>

        {workouts.length > 0 ? (
          <div className="space-y-3 mb-4">
            {workouts.map((workout, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-lg text-gray-800">
                  {workout.muscleGroup || 'Workout'}
                </h3>
                <p className="text-sm text-gray-600">
                  {getWorkoutSetsRepsDisplay(workout)}
                </p>
                {workout.label && (
                  <p className="text-sm text-gray-500 italic">{workout.label}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic mb-4">No workouts scheduled for this day</p>
        )}

        <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
          + Add Workout
        </button>
      </div>
    </div>
  );
}

export default SelectedDateModal;

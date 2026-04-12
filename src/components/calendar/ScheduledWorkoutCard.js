import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ScheduledWorkoutCard({ workout, onDeleteWorkout }) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStart = () => {
    navigate('/Create', { state: { scheduledWorkout: workout } });
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      {showDeleteConfirm ? (
        /* Delete Confirmation */
        <div className="text-center">
          <p className="text-base text-gray-800 font-semibold mb-3">Delete this workout?</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                onDeleteWorkout(workout.id);
                setShowDeleteConfirm(false);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Normal Display */
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800">
              {workout.templateName || workout.muscleGroup || 'Workout'}
            </h3>
            {workout.templateName && workout.muscleGroup && (
              <p className="text-sm text-blue-600 font-semibold">{workout.muscleGroup}</p>
            )}
            <p className="text-sm text-gray-600">
              {workout.customSetCount || workout.numberOfSets}x{workout.customRepCount || '8-12'}
            </p>
            {workout.label && (
              <p className="text-sm text-gray-500 italic">{workout.label}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete workout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Start
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduledWorkoutCard;

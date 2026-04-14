import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkoutSetsRepsDisplay } from '../../utils/workoutDisplay';
import { useTheme } from '../../contexts/ThemeContext';

function ScheduledWorkoutCard({ workout, onDeleteWorkout }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStart = () => {
    navigate('/Create', { state: { scheduledWorkout: workout } });
  };

  return (
    <div className={`${theme.cardBgSecondary} rounded-lg p-4 transition-shadow`}>
      {showDeleteConfirm ? (
        /* Delete Confirmation */
        <div className="text-center">
          <p className={`text-base ${theme.cardText} font-semibold mb-3`}>Delete this workout?</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                onDeleteWorkout(workout.id);
                setShowDeleteConfirm(false);
              }}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] border-t border-l border-red-600 border-b-2 border-r-2 border-b-red-900 border-r-red-900 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] active:translate-y-0.5 transition-all"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className={`px-4 py-2 ${theme.btnSecondary} ${theme.btnSecondaryText} text-sm font-semibold rounded-lg transition-all`}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Normal Display */
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className={`font-bold text-lg ${theme.cardText}`}>
              {workout.templateName || workout.muscleGroup || 'Workout'}
            </h3>
            {workout.templateName && workout.muscleGroup && (
              <p className={`text-sm ${theme.cardText} font-semibold opacity-80`}>{workout.muscleGroup}</p>
            )}
            <p className={`text-sm ${theme.cardTextSecondary}`}>
              {getWorkoutSetsRepsDisplay(workout)}
            </p>
            {workout.label && (
              <p className={`text-sm ${theme.cardTextSecondary} italic`}>{workout.label}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-2 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete workout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] border-t border-l border-green-600 border-b-2 border-r-2 border-b-green-900 border-r-green-900 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] active:translate-y-0.5 transition-all"
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

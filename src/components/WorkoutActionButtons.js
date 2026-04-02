import { Link } from 'react-router-dom';

/**
 * WorkoutActionButtons - Save, Start, and View Workouts buttons
 * Becomes sticky on mobile when scrolling
 */
function WorkoutActionButtons({
  isWorkoutConfigured,
  isButtonSticky,
  isSaving,
  isGeneratingSummary,
  onStartWorkout,
  onSaveWorkout,
}) {
  if (!isWorkoutConfigured) {
    return null;
  }

  return (
    <>
      {/* View Workouts button - not sticky */}
      <div className="m-6 px-4 sm:px-20">
        <Link to="/SavedWorkouts">
          <button
            disabled={isSaving}
            className={`px-6 py-3 w-full sm:w-auto rounded-3xl shadow-lg text-sky-50 transition-all duration-300 ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gray-800 hover:bg-blue-600 active:bg-gray-600 active:scale-95'
            }`}
          >
            View Workouts
          </button>
        </Link>
      </div>

      {/* Action buttons - sticky on mobile when not at bottom */}
      <div
        className={`flex flex-col justify-end space-y-4 ${
          isButtonSticky
            ? 'fixed bottom-0 left-0 right-0 bg-gradient-to-t from-sky-300 via-sky-300 to-transparent pt-6 pb-4 px-4 m-0 z-50'
            : 'm-6 px-4 sm:px-20'
        } sm:m-6 sm:px-20 sm:relative sm:bg-none sm:pt-0 sm:pb-0`}
      >
        {isGeneratingSummary && (
          <div className="text-blue-600 font-semibold animate-pulse">
            🤖 Generating AI summary...
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={onStartWorkout}
            disabled={isSaving}
            className={`px-6 py-3 rounded-3xl shadow-lg text-white font-semibold transition-all duration-300 ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 active:bg-green-500 active:scale-95'
            }`}
          >
            ▶️ Start Workout
          </button>

          <button
            onClick={onSaveWorkout}
            disabled={isSaving}
            className={`px-6 py-3 rounded-3xl shadow-lg text-sky-50 transition-all duration-300 ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-700 hover:bg-blue-800 active:bg-blue-600 active:scale-95'
            }`}
          >
            {isSaving ? (isGeneratingSummary ? 'Generating Summary...' : 'Saving...') : 'Save Workout'}
          </button>
        </div>
      </div>
    </>
  );
}

export default WorkoutActionButtons;

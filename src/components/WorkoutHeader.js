/**
 * WorkoutHeader - Displays the workout title and loading state
 * Shows different headers based on workflow mode (choose/custom/template)
 */
function WorkoutHeader({
  workflowMode,
  selectedMuscleGroup,
  actualMuscleGroup,
  loadedTemplate,
  isLoadingTemplate,
  onReset,
  exerciseData,
}) {
  const showResetButton = selectedMuscleGroup || Object.keys(exerciseData).length > 0 || workflowMode !== 'choose';

  return (
    <>
      {/* Title based on workflow mode */}
      {workflowMode === 'choose' && (
        <>
          <h1 className="text-5xl font-extrabold mb-4 text-gray-800">Create Workout</h1>
          <p className="text-lg text-gray-700 italic mb-10">
            Choose your training style and start logging your workout.
          </p>
        </>
      )}

      {workflowMode === 'custom' && selectedMuscleGroup && (
        <>
          <h1 className="text-4xl font-extrabold mb-2 text-gray-800">
            {actualMuscleGroup ? `${actualMuscleGroup.charAt(0).toUpperCase() + actualMuscleGroup.slice(1)} Day` : 'Workout'}
          </h1>
          <p className="text-sm text-gray-600 italic mb-8">
            Following Jonathan's Hypertrophy Program
          </p>
        </>
      )}

      {workflowMode === 'template' && loadedTemplate && (
        <>
          <h1 className="text-4xl font-extrabold mb-2 text-gray-800">
            {loadedTemplate.name}
          </h1>
          {loadedTemplate.category && (
            <p className="text-sm text-gray-600 italic mb-8">
              {loadedTemplate.category} Training
            </p>
          )}
        </>
      )}

      {/* Loading indicator */}
      {isLoadingTemplate && (
        <div className="bg-gray-100 p-3 mb-6 rounded-lg text-center">
          <p className="text-gray-700 text-sm">Loading template...</p>
        </div>
      )}

      {/* Reset button */}
      {showResetButton && (
        <div className="flex justify-start mb-6">
          <button
            onClick={onReset}
            className="text-sm font-medium text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors border border-gray-400 rounded-lg px-3 py-1 bg-white/50 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Restart Session
          </button>
        </div>
      )}
    </>
  );
}

export default WorkoutHeader;

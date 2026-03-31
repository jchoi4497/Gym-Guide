import { useState, useMemo } from 'react';
import { formatDuration } from '../config/workoutSettings';

function WorkoutSummary({
  workoutName,
  startTime,
  endTime,
  exercises,
  onSave,
  onDiscard,
}) {
  // Total duration in seconds (editable)
  const calculatedDuration = Math.floor((endTime - startTime) / 1000);
  const [duration, setDuration] = useState(calculatedDuration);
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [editDurationMinutes, setEditDurationMinutes] = useState(Math.floor(calculatedDuration / 60));

  // Calculate statistics
  const stats = useMemo(() => {
    let totalSets = 0;
    let completedSets = 0;
    let totalRestTime = 0;
    let restCount = 0;

    exercises.forEach(exercise => {
      totalSets += exercise.totalSets;
      completedSets += exercise.completedSets.length;

      // Calculate rest times between sets
      for (let i = 1; i < exercise.completedSets.length; i++) {
        const prevSet = exercise.completedSets[i - 1];
        const currentSet = exercise.completedSets[i];
        const restDuration = Math.floor((currentSet.completedAt - prevSet.completedAt) / 1000);

        // Only count reasonable rest times (between 10s and 10min)
        if (restDuration >= 10 && restDuration <= 600) {
          totalRestTime += restDuration;
          restCount++;
        }
      }
    });

    const averageRest = restCount > 0 ? Math.round(totalRestTime / restCount) : 0;

    return {
      totalSets,
      completedSets,
      averageRest,
    };
  }, [exercises]);

  const handleSaveDuration = () => {
    setDuration(editDurationMinutes * 60);
    setIsEditingDuration(false);
  };

  const handleSave = () => {
    onSave({
      duration,
      averageRest: stats.averageRest,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <h2 className="text-3xl font-bold mb-2">🎉 Workout Complete!</h2>
          <p className="text-blue-100">{workoutName}</p>
        </div>

        {/* Stats Cards */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Duration */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <p className="text-xs text-blue-600 font-medium mb-1">Duration</p>
              {isEditingDuration ? (
                <div className="flex flex-col items-center gap-1">
                  <input
                    type="number"
                    value={editDurationMinutes}
                    onChange={(e) => setEditDurationMinutes(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-center text-xl font-bold text-blue-600 border-2 border-blue-300 rounded"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveDuration}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditDurationMinutes(Math.floor(duration / 60));
                    setIsEditingDuration(true);
                  }}
                  className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  title="Click to edit"
                >
                  {formatDuration(duration)}
                </button>
              )}
            </div>

            {/* Sets Completed */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <p className="text-xs text-green-600 font-medium mb-1">Sets</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.completedSets}/{stats.totalSets}
              </p>
            </div>

            {/* Average Rest */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
              <p className="text-xs text-purple-600 font-medium mb-1">Avg Rest</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.averageRest > 0 ? formatDuration(stats.averageRest) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Exercise Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Exercise Breakdown</h3>
            <div className="space-y-3">
              {exercises.map((exercise, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{exercise.exerciseName}</h4>
                    <span className="text-sm font-medium text-gray-600">
                      {exercise.completedSets.length}/{exercise.totalSets} sets
                    </span>
                  </div>

                  {/* Set Details */}
                  <div className="space-y-1">
                    {exercise.completedSets.map((set, setIdx) => (
                      <div key={setIdx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Set {set.setNumber}</span>
                        <span className="font-medium text-gray-800">
                          {set.weight && `${set.weight} lbs × `}{set.reps} reps
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onDiscard}
              className="flex-1 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-colors shadow-lg"
            >
              Save Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkoutSummary;

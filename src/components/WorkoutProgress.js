import { useMemo, useState, useEffect } from 'react';

function WorkoutProgress({ exercises, currentSetIndex, onUpdateSet, onOpenPicker, onReorderExercise }) {
  const [expandedExerciseIndex, setExpandedExerciseIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  // Calculate progress statistics
  const stats = useMemo(() => {
    let totalSets = 0;
    let completedSets = 0;

    exercises.forEach(exercise => {
      totalSets += exercise.totalSets;
      completedSets += exercise.completedSets.length;
    });

    return {
      totalSets,
      completedSets,
      percentComplete: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0,
    };
  }, [exercises]);

  // Build exercise breakdown
  const exerciseBreakdown = useMemo(() => {
    return exercises.map(exercise => ({
      name: exercise.exerciseName,
      completed: exercise.completedSets.length,
      total: exercise.totalSets,
      isComplete: exercise.completedSets.length === exercise.totalSets,
    }));
  }, [exercises]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      {/* Overall Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Progress</h3>
          <span className="text-2xl font-bold text-blue-600">
            {stats.completedSets}/{stats.totalSets}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats.percentComplete}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">{stats.percentComplete}% Complete</p>
      </div>

      {/* Exercise Breakdown */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Exercises</h4>
        <div className="space-y-2">
          {exercises.map((exercise, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Exercise Header */}
              <div className="flex items-center bg-gray-50">
                {/* Reorder Buttons */}
                {onReorderExercise && (
                  <div className="flex flex-col border-r border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderExercise(idx, 'up');
                      }}
                      disabled={idx === 0}
                      className={`px-2 py-1 ${idx === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      ▲
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderExercise(idx, 'down');
                      }}
                      disabled={idx === exercises.length - 1}
                      className={`px-2 py-1 ${idx === exercises.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      ▼
                    </button>
                  </div>
                )}

                {/* Exercise Info - Clickable */}
                <button
                  onClick={() => setExpandedExerciseIndex(expandedExerciseIndex === idx ? null : idx)}
                  className="flex-1 flex items-center justify-between py-2 px-3 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {exercise.completedSets.length === exercise.totalSets ? (
                      <span className="text-green-600 text-lg">✓</span>
                    ) : (
                      <span className="text-gray-400 text-lg">○</span>
                    )}
                    <span className={`text-sm font-medium ${
                      exercise.completedSets.length === exercise.totalSets ? 'text-gray-500 line-through' : 'text-gray-800'
                    }`}>
                      {exercise.exerciseName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${
                      exercise.completedSets.length === exercise.totalSets ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {exercise.completedSets.length}/{exercise.totalSets}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {expandedExerciseIndex === idx ? '▼' : '▶'}
                    </span>
                  </div>
                </button>
              </div>

              {/* Expanded Table View */}
              {expandedExerciseIndex === idx && (
                <div className="bg-gray-50 p-3 border-t border-gray-200">
                  <div className="space-y-2">
                    {Array.from({ length: exercise.totalSets }).map((_, setIdx) => {
                      const setNumber = setIdx + 1;
                      const completedSet = exercise.completedSets.find(s => s.setNumber === setNumber);
                      const previousSet = setIdx > 0 ? exercise.completedSets.find(s => s.setNumber === setNumber - 1) : null;
                      const hasPreviousSet = previousSet && (previousSet.weight || previousSet.reps);
                      const hasCurrentData = completedSet?.weight || completedSet?.reps;

                      // Check if this is a cardio exercise
                      const isCardioExercise = exercise.key?.startsWith('cardio') || exercise.key?.startsWith('custom_cardio');
                      const weightLabel = isCardioExercise ? 'mi' : 'lbs';
                      const repsLabel = isCardioExercise ? 'min' : 'reps';

                      return (
                        <div key={setIdx} className="relative bg-white border border-gray-200 rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            {!isCardioExercise && (
                              <span className="text-xs font-medium text-gray-600 min-w-[45px]">Set {setNumber}</span>
                            )}
                            <div className="flex-1 flex items-center gap-2">
                              {isMobile ? (
                                <>
                                  <button
                                    onClick={() => onOpenPicker && onOpenPicker(idx, setNumber, 'weight', completedSet?.weight || '', completedSet?.reps || '')}
                                    className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-center"
                                  >
                                    {completedSet?.weight || <span className="text-gray-400">{weightLabel}</span>}
                                  </button>
                                  <span className="text-gray-400 font-bold">{isCardioExercise ? '' : '×'}</span>
                                  <button
                                    onClick={() => onOpenPicker && onOpenPicker(idx, setNumber, 'reps', completedSet?.weight || '', completedSet?.reps || '')}
                                    className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-center"
                                  >
                                    {completedSet?.reps || <span className="text-gray-400">{repsLabel}</span>}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <input
                                    type="number"
                                    step={isCardioExercise ? "0.1" : "0.5"}
                                    value={completedSet?.weight || ''}
                                    onChange={(e) => onUpdateSet && onUpdateSet(idx, setNumber, 'weight', e.target.value)}
                                    placeholder={weightLabel}
                                    className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-center"
                                  />
                                  <span className="text-gray-400 font-bold">{isCardioExercise ? '' : '×'}</span>
                                  <input
                                    type="number"
                                    step={isCardioExercise ? "0.1" : "1"}
                                    value={completedSet?.reps || ''}
                                    onChange={(e) => onUpdateSet && onUpdateSet(idx, setNumber, 'reps', e.target.value)}
                                    placeholder={repsLabel}
                                    className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-center"
                                  />
                                </>
                              )}
                            </div>

                            {/* Copy Previous Set Button */}
                            {hasPreviousSet && !hasCurrentData && (
                              <button
                                onClick={() => {
                                  if (onUpdateSet && previousSet) {
                                    onUpdateSet(idx, setNumber, 'weight', previousSet.weight);
                                    onUpdateSet(idx, setNumber, 'reps', previousSet.reps);
                                  }
                                }}
                                className="w-7 h-7 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xs font-bold transition-all active:scale-90 flex items-center justify-center shadow-sm"
                                title="Copy previous set"
                              >
                                ↑
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorkoutProgress;

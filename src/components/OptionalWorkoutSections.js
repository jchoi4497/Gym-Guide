import { useState } from 'react';
import { getExercisesByCategory, EXERCISE_CATEGORIES } from '../config/exerciseConfig';

/**
 * Optional workout sections (Cardio & Abs) that appear below main workout
 */
function OptionalWorkoutSections({
  numberOfSets,
  setRangeLabel,
  exerciseData,
  onExerciseDataChange,
}) {
  const [showCardio, setShowCardio] = useState(false);
  const [showAbs, setShowAbs] = useState(false);
  const [cardioExercises, setCardioExercises] = useState([
    {
      id: 'cardio_section',
      selected: 'treadmill',
      options: getExercisesByCategory(EXERCISE_CATEGORIES.CARDIO),
      isCustom: false,
    },
  ]);
  const [absExercises, setAbsExercises] = useState([
    {
      id: 'abs_section',
      selected: 'abcrunchmachine',
      options: getExercisesByCategory(EXERCISE_CATEGORIES.ABS),
      isCustom: false,
    },
  ]);

  // Add custom cardio exercise
  const addCustomCardio = () => {
    const customId = `custom_cardio_${Date.now()}`;
    setCardioExercises([
      ...cardioExercises,
      {
        id: customId,
        selected: '',
        options: [],
        isCustom: true,
      },
    ]);
  };

  // Add custom abs exercise
  const addCustomAbs = () => {
    const customId = `custom_abs_${Date.now()}`;
    setAbsExercises([
      ...absExercises,
      {
        id: customId,
        selected: '',
        options: [],
        isCustom: true,
      },
    ]);
  };

  // Remove cardio exercise
  const removeCardio = (rowId) => {
    setCardioExercises(cardioExercises.filter((ex) => ex.id !== rowId));
  };

  // Remove abs exercise
  const removeAbs = (rowId) => {
    setAbsExercises(absExercises.filter((ex) => ex.id !== rowId));
  };

  const handleCardioChange = (rowId, newValue) => {
    onExerciseDataChange(rowId, newValue, -1);
  };

  const handleAbsChange = (rowId, newValue) => {
    onExerciseDataChange(rowId, newValue, -1);
  };

  const handleCardioInput = (rowId, selected, index, inputValue) => {
    onExerciseDataChange(rowId, selected, index, inputValue);
  };

  const handleAbsInput = (rowId, selected, index, inputValue) => {
    onExerciseDataChange(rowId, selected, index, inputValue);
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Cardio Section Toggle */}
      <div className="border-t-2 border-gray-300 pt-6">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={showCardio}
            onChange={(e) => setShowCardio(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-xl font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
            Add Cardio
          </span>
        </label>

        {showCardio && (
          <div className="mt-4">
            <div className="rounded-2xl shadow-lg bg-sky-50 mb-8 p-4">
              <div className="text-xl font-bold mb-4 py-3 bg-blue-50 rounded-md text-center">
                Cardio
              </div>
              <div className="flex flex-col">
                {cardioExercises.map((exercise) => (
                  <div key={exercise.id} className="relative flex flex-col sm:flex-row sm:items-center gap-4 border border-gray-300 rounded-md p-4 bg-sky-50 shadow-sm mb-4">
                    {/* Remove button for custom exercises */}
                    {exercise.isCustom && (
                      <button
                        onClick={() => removeCardio(exercise.id)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 z-10 cursor-pointer"
                        title="Remove Exercise"
                      >
                        <span className="text-xs font-bold">✕</span>
                      </button>
                    )}

                    <div className="w-full sm:w-1/3">
                      {exercise.isCustom ? (
                        <input
                          type="text"
                          placeholder="Enter cardio name..."
                          className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 outline-none transition-all"
                          value={exerciseData[exercise.id]?.exerciseName || exercise.selected}
                          onChange={(e) => handleCardioChange(exercise.id, e.target.value)}
                        />
                      ) : (
                        <select
                          value={exerciseData[exercise.id]?.exerciseName || exercise.selected}
                          onChange={(e) => handleCardioChange(exercise.id, e.target.value)}
                          className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 outline-none transition-all"
                        >
                          {exercise.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:gap-2 w-full">
                      {/* Specific labels for cardio: Level, Time (min), Speed (mph) */}
                      {['Level', 'Time (min)', 'Speed (mph)'].map((label, idx) => (
                        <input
                          key={idx}
                          placeholder={label}
                          className="px-3 py-2 w-full rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 placeholder-gray-400 text-gray-900 mb-2 sm:mb-0"
                          type="text"
                          value={(exerciseData[exercise.id]?.sets || [])[idx] || ''}
                          onChange={(e) => handleCardioInput(exercise.id, exerciseData[exercise.id]?.exerciseName || exercise.selected, idx, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addCustomCardio}
                className="w-full mt-4 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-md transition-all active:scale-95"
              >
                + Add Custom Cardio
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Abs Section Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={showAbs}
            onChange={(e) => setShowAbs(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-xl font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
            Add Abs/Core
          </span>
        </label>

        {showAbs && (
          <div className="mt-4">
            <div className="rounded-2xl shadow-lg bg-sky-50 mb-8 p-4">
              <div className="text-xl font-bold mb-4 py-3 bg-blue-50 rounded-md text-center">
                Abs
              </div>
              <div className="flex flex-col">
                {absExercises.map((exercise) => (
                  <div key={exercise.id} className="relative flex flex-col sm:flex-row sm:items-center gap-4 border border-gray-300 rounded-md p-4 bg-sky-50 shadow-sm mb-4">
                    {/* Remove button for custom exercises */}
                    {exercise.isCustom && (
                      <button
                        onClick={() => removeAbs(exercise.id)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 z-10 cursor-pointer"
                        title="Remove Exercise"
                      >
                        <span className="text-xs font-bold">✕</span>
                      </button>
                    )}

                    <div className="w-full sm:w-1/3">
                      {exercise.isCustom ? (
                        <input
                          type="text"
                          placeholder="Enter abs exercise name..."
                          className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 outline-none transition-all"
                          value={exerciseData[exercise.id]?.exerciseName || exercise.selected}
                          onChange={(e) => handleAbsChange(exercise.id, e.target.value)}
                        />
                      ) : (
                        <select
                          value={exerciseData[exercise.id]?.exerciseName || exercise.selected}
                          onChange={(e) => handleAbsChange(exercise.id, e.target.value)}
                          className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 outline-none transition-all"
                        >
                          {exercise.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:gap-2 w-full">
                      {Array.from({ length: numberOfSets }).map((_, idx) => (
                        <input
                          key={idx}
                          placeholder="Weight x Reps"
                          className="px-3 py-2 w-full rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 placeholder-gray-400 text-gray-900 mb-2 sm:mb-0"
                          type="text"
                          value={(exerciseData[exercise.id]?.sets || [])[idx] || ''}
                          onChange={(e) => handleAbsInput(exercise.id, exerciseData[exercise.id]?.exerciseName || exercise.selected, idx, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addCustomAbs}
                className="w-full mt-4 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-md transition-all active:scale-95"
              >
                + Add Custom Abs Exercise
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OptionalWorkoutSections;

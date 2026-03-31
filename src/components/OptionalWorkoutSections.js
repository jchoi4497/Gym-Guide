import { useState, useEffect, useRef } from 'react';
import { getExercisesByCategory, EXERCISE_CATEGORIES, getPlaceholderForExercise, getExerciseName } from '../config/exerciseConfig';

// Field templates for different cardio exercise types
const CARDIO_FIELD_TEMPLATES = {
  treadmill: ['Incline', 'Time (min)', 'Speed (mph)'],
  bike: ['Resistance', 'Time (min)', 'Speed (mph)'],
  elliptical: ['Resistance', 'Time (min)'],
  stairmaster: ['Level', 'Time (min)'],
  running: ['Distance (mi)', 'Time (min)', 'Pace (min/mi)'],
  // Default for custom cardio
  default: ['Metric 1', 'Metric 2', 'Metric 3'],
};

// Helper function to get fields for a cardio exercise
const getCardioFields = (exerciseId) => {
  return CARDIO_FIELD_TEMPLATES[exerciseId] || CARDIO_FIELD_TEMPLATES.default;
};

/**
 * Optional workout sections (Cardio & Abs) that can appear above or below main workout
 */
function OptionalWorkoutSections({
  numberOfSets,
  exerciseData,
  onExerciseDataChange,
  onRemoveSet,
  cardioAtTop,
  absAtTop,
  onToggleCardioPosition,
  onToggleAbsPosition,
  showCardio,
  setShowCardio,
  showAbs,
  setShowAbs,
  position, // "top" or "bottom"
}) {
  const [absEditMode, setAbsEditMode] = useState({}); // Track edit mode per abs exercise

  // Warn user if they try to refresh/leave while in abs edit mode
  useEffect(() => {
    const isAnyAbsInEditMode = Object.values(absEditMode).some(mode => mode === true);

    const handleBeforeUnload = (event) => {
      if (isAnyAbsInEditMode) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    if (isAnyAbsInEditMode) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [absEditMode]);

  const [cardioExercises, setCardioExercises] = useState([]);
  const [absExercises, setAbsExercises] = useState([]);
  const cardioInitialized = useRef(false);
  const absInitialized = useRef(false);

  // Populate cardio exercises from existing exerciseData when cardio is enabled
  useEffect(() => {
    if (showCardio && !cardioInitialized.current && exerciseData) {
      // Check if there's existing cardio data in exerciseData
      const existingCardioKeys = Object.keys(exerciseData).filter(key =>
        key.startsWith('cardio') || key.startsWith('custom_cardio')
      );

      if (existingCardioKeys.length > 0) {
        // Restore from existing data
        const restoredCardio = existingCardioKeys.map(key => ({
          id: key,
          selected: exerciseData[key]?.exerciseName || exerciseData[key]?.selection || '',
          options: key.startsWith('custom_cardio') ? [] : getExercisesByCategory(EXERCISE_CATEGORIES.CARDIO),
          isCustom: key.startsWith('custom_cardio'),
        }));
        setCardioExercises(restoredCardio);
      } else {
        // No existing data, add default and initialize in exerciseData
        const defaultCardio = {
          id: 'cardio_section',
          selected: 'treadmill',
          options: getExercisesByCategory(EXERCISE_CATEGORIES.CARDIO),
          isCustom: false,
        };
        setCardioExercises([defaultCardio]);
        // Initialize the default cardio exercise in exerciseData with proper name
        const cardioName = getExerciseName('treadmill');
        onExerciseDataChange('cardio_section', cardioName, -1, null, null);
      }
      cardioInitialized.current = true;
    } else if (!showCardio) {
      setCardioExercises([]);
      cardioInitialized.current = false;
    }
  }, [showCardio, exerciseData]);

  // Populate abs exercises from existing exerciseData when abs is enabled
  useEffect(() => {
    if (showAbs && !absInitialized.current && exerciseData) {
      // Check if there's existing abs data in exerciseData
      const existingAbsKeys = Object.keys(exerciseData).filter(key =>
        key.startsWith('abs') || key.startsWith('custom_abs')
      );

      if (existingAbsKeys.length > 0) {
        // Restore from existing data
        const restoredAbs = existingAbsKeys.map(key => ({
          id: key,
          selected: exerciseData[key]?.exerciseName || exerciseData[key]?.selection || '',
          options: key.startsWith('custom_abs') ? [] : getExercisesByCategory(EXERCISE_CATEGORIES.ABS),
          isCustom: key.startsWith('custom_abs'),
        }));
        setAbsExercises(restoredAbs);
      } else {
        // No existing data, add default and initialize in exerciseData
        const defaultAbs = {
          id: 'abs_section',
          selected: 'abcrunchmachine',
          options: getExercisesByCategory(EXERCISE_CATEGORIES.ABS),
          isCustom: false,
        };
        setAbsExercises([defaultAbs]);
        // Initialize the default abs exercise in exerciseData with proper name
        const absName = getExerciseName('abcrunchmachine');
        onExerciseDataChange('abs_section', absName, -1, null, null);
      }
      absInitialized.current = true;
    } else if (!showAbs) {
      setAbsExercises([]);
      absInitialized.current = false;
    }
  }, [showAbs, exerciseData]);

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
    // Initialize in exerciseData with empty values
    onExerciseDataChange(customId, '', -1, null, null);
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
    // Initialize in exerciseData with empty values
    onExerciseDataChange(customId, '', -1, null, null);
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
    // Convert exercise ID to display name if it's a preset exercise
    const exerciseName = getExerciseName(newValue) || newValue;
    onExerciseDataChange(rowId, exerciseName, -1, null, null);
  };

  const handleAbsChange = (rowId, newValue) => {
    // Convert exercise ID to display name if it's a preset exercise
    const exerciseName = getExerciseName(newValue) || newValue;
    onExerciseDataChange(rowId, exerciseName, -1, null, null);
  };

  const handleCardioInput = (rowId, selected, index, inputValue) => {
    onExerciseDataChange(rowId, selected, index, inputValue, null);
  };

  const handleAbsInput = (rowId, selected, index, inputValue) => {
    onExerciseDataChange(rowId, selected, index, inputValue, null);
  };

  const toggleAbsEditMode = (exerciseId) => {
    setAbsEditMode(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const handleAbsAddSet = (rowId, selected) => {
    const currentSets = exerciseData[rowId]?.sets || [];
    const currentSetCount = currentSets.length || Number(numberOfSets);
    onExerciseDataChange(rowId, selected, currentSetCount, '', null);
  };

  const handleAbsRemoveSet = (rowId) => {
    const currentSets = exerciseData[rowId]?.sets || [];
    const currentSetCount = currentSets.length || Number(numberOfSets);
    if (currentSetCount > 1 && onRemoveSet) {
      onRemoveSet(rowId, currentSetCount - 1);
    }
  };

  // Determine which sections to show based on position
  const showCardioHere = (position === "top" && cardioAtTop) || (position === "bottom" && !cardioAtTop);
  const showAbsHere = (position === "top" && absAtTop) || (position === "bottom" && !absAtTop);

  // Don't render anything if no sections should appear at this position
  if (!showCardioHere && !showAbsHere) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Cardio Section Toggle */}
      {showCardioHere && (
        <div>
          <div className="flex items-center justify-between mb-2">
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
              <button
                onClick={onToggleCardioPosition}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
                title={cardioAtTop ? "Move to bottom" : "Move to top"}
              >
                {cardioAtTop ? "↓ Move to Bottom" : "↑ Move to Top"}
              </button>
            )}
          </div>

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
                          value={(() => {
                            // Find the option that matches the stored exercise name
                            const currentName = exerciseData[exercise.id]?.exerciseName;
                            const matchingOption = exercise.options.find(opt =>
                              opt.label === currentName || opt.value === currentName || opt.value === exercise.selected
                            );
                            return matchingOption ? matchingOption.value : exercise.selected;
                          })()}
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
                      {/* Dynamic fields based on cardio type */}
                      {getCardioFields(exerciseData[exercise.id]?.exerciseName || exercise.selected).map((label, idx) => (
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
      )}

      {/* Abs Section Toggle */}
      {showAbsHere && (
        <div>
          <div className="flex items-center justify-between mb-2">
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
              <button
                onClick={onToggleAbsPosition}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
                title={absAtTop ? "Move to bottom" : "Move to top"}
              >
                {absAtTop ? "↓ Move to Bottom" : "↑ Move to Top"}
              </button>
            )}
          </div>

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
                          value={(() => {
                            // Find the option that matches the stored exercise name
                            const currentName = exerciseData[exercise.id]?.exerciseName;
                            const matchingOption = exercise.options.find(opt =>
                              opt.label === currentName || opt.value === currentName || opt.value === exercise.selected
                            );
                            return matchingOption ? matchingOption.value : exercise.selected;
                          })()}
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
                    <div className="flex flex-col sm:flex-row sm:gap-2 w-full items-center">
                      {(() => {
                        const baseSetCount = Number(numberOfSets);
                        const currentSetCount = exerciseData[exercise.id]?.sets?.length || baseSetCount;
                        const isEditMode = absEditMode[exercise.id];
                        const selectedExercise = exerciseData[exercise.id]?.exerciseName || exercise.selected;
                        const placeholder = getPlaceholderForExercise(selectedExercise);

                        return (
                          <>
                            {Array.from({ length: currentSetCount }).map((_, idx) => (
                              <input
                                key={idx}
                                placeholder={placeholder}
                                className="px-3 py-2 w-full rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 placeholder-gray-400 text-gray-900 mb-2 sm:mb-0"
                                type="text"
                                value={(exerciseData[exercise.id]?.sets || [])[idx] || ''}
                                onChange={(e) => handleAbsInput(exercise.id, selectedExercise, idx, e.target.value)}
                              />
                            ))}

                            <div className="ml-2 flex-shrink-0 flex flex-row gap-1 sm:gap-2">
                              {isEditMode && (
                                <>
                                  <button
                                    onClick={() => handleAbsAddSet(exercise.id, exerciseData[exercise.id]?.exerciseName || exercise.selected)}
                                    className="px-2 sm:px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-bold transition-colors cursor-pointer whitespace-nowrap text-sm sm:text-base order-1"
                                    title="Add another set"
                                  >
                                    + Add
                                  </button>
                                  <button
                                    onClick={() => handleAbsRemoveSet(exercise.id)}
                                    disabled={currentSetCount <= 1}
                                    className={`px-2 sm:px-4 py-2 rounded-md font-bold transition-colors whitespace-nowrap text-sm sm:text-base order-3 sm:order-2 ${
                                      currentSetCount <= 1
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-red-500 hover:bg-red-600 text-white cursor-pointer active:bg-red-700'
                                    }`}
                                    title="Remove last set"
                                  >
                                    - Remove
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => toggleAbsEditMode(exercise.id)}
                                className="px-2 sm:px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm sm:text-base order-2 sm:order-3"
                                title={isEditMode ? "Done editing sets" : "Edit set count"}
                              >
                                {isEditMode ? '✓ Done' : 'Edit Sets'}
                              </button>
                            </div>
                          </>
                        );
                      })()}
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
      )}
    </div>
  );
}

export default OptionalWorkoutSections;

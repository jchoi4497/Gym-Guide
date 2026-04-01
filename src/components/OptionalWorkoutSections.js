import { useState, useEffect, useRef } from 'react';
import { getExercisesByCategory, EXERCISE_CATEGORIES, getPlaceholderForExercise, getExerciseName, getExerciseById, getExerciseIdByName } from '../config/exerciseConfig';
import WeightRepsPicker from './WeightRepsPicker';
import ExerciseAutocomplete from './ExerciseAutocomplete';
import { useIsMobile } from '../hooks/useIsMobile';
import { parseSet, combineSet } from '../utils/setHelpers';

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
  sectionOrder,
  onCardioMoveUp,
  onCardioMoveDown,
  onAbsMoveUp,
  onAbsMoveDown,
  showCardio,
  setShowCardio,
  showAbs,
  setShowAbs,
  position, // "top" or "bottom"
  isEditingSets = false, // Control visibility of remove buttons
  previousCustomExercises = [], // For autocomplete suggestions
  disableCheckboxes = false, // Disable checkboxes (for saved workouts in view mode)
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

  // Mobile picker state for abs
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerExerciseId, setPickerExerciseId] = useState(null);
  const [pickerSetIndex, setPickerSetIndex] = useState(null);
  const [pickerInitialField, setPickerInitialField] = useState('weight');

  // Mobile picker state for cardio
  const [cardioPickerOpen, setCardioPickerOpen] = useState(false);
  const [cardioPickerExerciseId, setCardioPickerExerciseId] = useState(null);
  const [cardioPickerFieldIndex, setCardioPickerFieldIndex] = useState(null);
  const [cardioPickerValue, setCardioPickerValue] = useState('');
  const [cardioPickerLabel, setCardioPickerLabel] = useState('');

  const isMobile = useIsMobile();

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
          // Try selection ID first, then reverse lookup from name, then fallback to empty
          selected: exerciseData[key]?.selection || getExerciseIdByName(exerciseData[key]?.exerciseName) || '',
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
          // Try selection ID first, then reverse lookup from name, then fallback to empty
          selected: exerciseData[key]?.selection || getExerciseIdByName(exerciseData[key]?.exerciseName) || '',
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

    // Update the cardioExercises state with new selected value
    setCardioExercises(prev => prev.map(ex =>
      ex.id === rowId ? { ...ex, selected: newValue } : ex
    ));

    onExerciseDataChange(rowId, exerciseName, -1, null, newValue);
  };

  const handleAbsChange = (rowId, newValue) => {
    // Convert exercise ID to display name if it's a preset exercise
    const exerciseName = getExerciseName(newValue) || newValue;

    // Update the absExercises state with new selected value
    setAbsExercises(prev => prev.map(ex =>
      ex.id === rowId ? { ...ex, selected: newValue } : ex
    ));

    onExerciseDataChange(rowId, exerciseName, -1, null, newValue);
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

  // Handle opening picker modal for abs
  const handleOpenAbsPicker = (exerciseId, setIndex, field = 'weight') => {
    setPickerExerciseId(exerciseId);
    setPickerSetIndex(setIndex);
    setPickerInitialField(field);
    setPickerOpen(true);
  };

  // Handle saving from picker modal for abs
  const handleAbsPickerSave = (weight, reps) => {
    if (pickerExerciseId && pickerSetIndex !== null) {
      const combined = combineSet(weight, reps);
      const selectedExercise = exerciseData[pickerExerciseId]?.exerciseName || absExercises.find(ex => ex.id === pickerExerciseId)?.selected;
      onExerciseDataChange(pickerExerciseId, selectedExercise, pickerSetIndex, combined, null);
    }
  };

  // Handle opening picker modal for cardio
  const handleOpenCardioPicker = (exerciseId, fieldIndex, label) => {
    const currentValue = (exerciseData[exerciseId]?.sets || [])[fieldIndex] || '';
    setCardioPickerExerciseId(exerciseId);
    setCardioPickerFieldIndex(fieldIndex);
    setCardioPickerValue(currentValue);
    setCardioPickerLabel(label);
    setCardioPickerOpen(true);
  };

  // Handle saving from picker modal for cardio
  const handleCardioPickerSave = (weight, reps) => {
    // For cardio, we only use the reps field as a single value
    const value = reps;
    if (cardioPickerExerciseId && cardioPickerFieldIndex !== null) {
      const exercise = cardioExercises.find(ex => ex.id === cardioPickerExerciseId);
      if (exercise) {
        handleCardioInput(cardioPickerExerciseId, exercise.selected, cardioPickerFieldIndex, value);
      }
    }
    setCardioPickerOpen(false);
  };

  // Determine which sections to show based on position
  const showCardioHere = (position === "top" && cardioAtTop) || (position === "bottom" && !cardioAtTop);
  const showAbsHere = (position === "top" && absAtTop) || (position === "bottom" && !absAtTop);

  // Don't render anything if no sections should appear at this position
  if (!showCardioHere && !showAbsHere) {
    return null;
  }

  // Determine display order when both are in the same position
  const showAbsFirst = sectionOrder === 'abs-first';
  const sections = [];

  if (showCardioHere && showAbsHere) {
    // Both sections here - respect order
    if (showAbsFirst) {
      sections.push('abs', 'cardio');
    } else {
      sections.push('cardio', 'abs');
    }
  } else if (showAbsHere) {
    sections.push('abs');
  } else if (showCardioHere) {
    sections.push('cardio');
  }

  return (
    <div className="mt-8 space-y-6">
      {sections.map((section) => section === 'abs' ? (
        /* Abs Section */
        <div key="abs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <label className={`flex items-center gap-3 ${disableCheckboxes ? 'cursor-not-allowed' : 'cursor-pointer'} group`}>
                <input
                  type="checkbox"
                  checked={showAbs}
                  onChange={(e) => setShowAbs(e.target.checked)}
                  disabled={disableCheckboxes}
                  className={`w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 ${disableCheckboxes ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                />
                <span className={`text-xl font-semibold text-gray-700 ${disableCheckboxes ? 'opacity-50' : 'group-hover:text-blue-600'} transition-colors`}>
                  Add Abs/Core
                </span>
              </label>
              {showAbs && isEditingSets && (
                <div className="flex gap-1">
                  <button
                    onClick={onAbsMoveUp}
                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={onAbsMoveDown}
                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              )}
            </div>
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
                    {/* Remove button - show when editing sets */}
                    {isEditingSets && (
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
                        <ExerciseAutocomplete
                          value={exerciseData[exercise.id]?.exerciseName || exercise.selected}
                          onChange={(value) => handleAbsChange(exercise.id, value)}
                          onSelect={(exerciseObj) => {
                            handleAbsChange(exercise.id, exerciseObj.name);
                          }}
                          previousCustomExercises={previousCustomExercises}
                          placeholder="Enter abs exercise name..."
                          className={`w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 outline-none transition-all ${disableCheckboxes ? 'opacity-60 cursor-not-allowed' : ''}`}
                          disabled={disableCheckboxes}
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
                          disabled={disableCheckboxes}
                          className={`w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 outline-none transition-all ${disableCheckboxes ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                        const exerciseById = getExerciseById(exercise.selected);
                        const placeholder = getPlaceholderForExercise(exercise.selected);

                        // Determine exercise type
                        const isBodyweight = exerciseById?.metricType === 'bodyweight' || placeholder === 'Reps';
                        const isTimed = exerciseById?.metricType === 'timed' || placeholder.includes('Duration') || placeholder.includes('sec');
                        const showWeightInput = !isBodyweight && !isTimed;

                        return (
                          <>
                            {Array.from({ length: currentSetCount }).map((_, idx) => {
                              const currentSet = parseSet((exerciseData[exercise.id]?.sets || [])[idx] || '');

                              return (
                                <div key={idx} className="flex items-center gap-1 mb-2 sm:mb-0">
                                  {isMobile ? (
                                    // MOBILE: Buttons that open picker
                                    <>
                                      {showWeightInput && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => !disableCheckboxes && handleOpenAbsPicker(exercise.id, idx, 'weight')}
                                            disabled={disableCheckboxes}
                                            className={`px-2 py-2 w-16 sm:w-20 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm ${disableCheckboxes ? 'cursor-not-allowed opacity-60' : 'hover:bg-blue-200 active:scale-95'}`}
                                          >
                                            {currentSet.weight || <span className="text-gray-400">lbs</span>}
                                          </button>
                                          <span className="text-gray-500 font-bold text-xs">×</span>
                                        </>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => !disableCheckboxes && handleOpenAbsPicker(exercise.id, idx, 'reps')}
                                        disabled={disableCheckboxes}
                                        className={`px-2 py-2 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm ${disableCheckboxes ? 'cursor-not-allowed opacity-60' : 'hover:bg-blue-200 active:scale-95'} ${showWeightInput ? 'w-14 sm:w-16' : 'w-16 sm:w-20'}`}
                                      >
                                        {currentSet.reps || <span className="text-gray-400">{isTimed ? "sec" : "reps"}</span>}
                                      </button>
                                    </>
                                  ) : (
                                    // DESKTOP: Regular inputs
                                    <>
                                      {showWeightInput && (
                                        <>
                                          <input
                                            type="number"
                                            step="0.5"
                                            value={currentSet.weight}
                                            onChange={(e) => {
                                              const combined = combineSet(e.target.value, currentSet.reps);
                                              handleAbsInput(exercise.id, selectedExercise, idx, combined);
                                            }}
                                            placeholder="lbs"
                                            readOnly={disableCheckboxes}
                                            className={`px-2 py-2 w-16 sm:w-20 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm ${disableCheckboxes ? 'cursor-not-allowed opacity-60' : ''}`}
                                          />
                                          <span className="text-gray-500 font-bold text-xs">×</span>
                                        </>
                                      )}
                                      <input
                                        type="number"
                                        step="1"
                                        value={currentSet.reps}
                                        onChange={(e) => {
                                          const combined = combineSet(currentSet.weight, e.target.value);
                                          handleAbsInput(exercise.id, selectedExercise, idx, combined);
                                        }}
                                        placeholder={isTimed ? "sec" : "reps"}
                                        readOnly={disableCheckboxes}
                                        className={`px-2 py-2 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm ${disableCheckboxes ? 'cursor-not-allowed opacity-60' : ''} ${showWeightInput ? 'w-14 sm:w-16' : 'w-16 sm:w-20'}`}
                                      />
                                    </>
                                  )}
                                </div>
                              );
                            })}

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
      ) : (
        /* Cardio Section */
        <div key="cardio">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <label className={`flex items-center gap-3 ${disableCheckboxes ? 'cursor-not-allowed' : 'cursor-pointer'} group`}>
                <input
                  type="checkbox"
                  checked={showCardio}
                  onChange={(e) => setShowCardio(e.target.checked)}
                  disabled={disableCheckboxes}
                  className={`w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 ${disableCheckboxes ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                />
                <span className={`text-xl font-semibold text-gray-700 ${disableCheckboxes ? 'opacity-50' : 'group-hover:text-blue-600'} transition-colors`}>
                  Add Cardio
                </span>
              </label>
              {showCardio && isEditingSets && (
                <div className="flex gap-1">
                  <button
                    onClick={onCardioMoveUp}
                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={onCardioMoveDown}
                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              )}
            </div>
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
                    {/* Remove button - show when editing sets */}
                    {isEditingSets && (
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
                        <ExerciseAutocomplete
                          value={exerciseData[exercise.id]?.exerciseName || exercise.selected}
                          onChange={(value) => handleCardioChange(exercise.id, value)}
                          onSelect={(exerciseObj) => {
                            handleCardioChange(exercise.id, exerciseObj.name);
                          }}
                          previousCustomExercises={previousCustomExercises}
                          placeholder="Enter cardio exercise name..."
                          className={`w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 outline-none transition-all ${disableCheckboxes ? 'opacity-60 cursor-not-allowed' : ''}`}
                          disabled={disableCheckboxes}
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
                          disabled={disableCheckboxes}
                          className={`w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 outline-none transition-all ${disableCheckboxes ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                        const selectedExerciseId = exercise.selected || '';
                        const cardioFields = getCardioFields(selectedExerciseId);

                        return (
                          <div className="flex flex-wrap gap-2">
                            {cardioFields.map((label, idx) => {
                              const value = (exerciseData[exercise.id]?.sets || [])[idx] || '';

                              return (
                                <div key={idx} className="flex flex-col">
                                  <label className="text-xs text-gray-600 mb-1">{label}</label>
                                  {isMobile ? (
                                    // MOBILE: Button that opens picker
                                    <button
                                      type="button"
                                      onClick={() => !disableCheckboxes && handleOpenCardioPicker(exercise.id, idx, label)}
                                      disabled={disableCheckboxes}
                                      className={`px-2 py-2 w-24 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm ${disableCheckboxes ? 'cursor-not-allowed opacity-60' : 'hover:bg-blue-200 active:scale-95'}`}
                                    >
                                      {value || <span className="text-gray-400">{label}</span>}
                                    </button>
                                  ) : (
                                    // DESKTOP: Regular input
                                    <input
                                      type="number"
                                      step="0.1"
                                      placeholder={label}
                                      value={value}
                                      onChange={(e) => handleCardioInput(exercise.id, exercise.selected, idx, e.target.value)}
                                      readOnly={disableCheckboxes}
                                      className={`px-2 py-2 w-24 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm ${disableCheckboxes ? 'cursor-not-allowed opacity-60' : ''}`}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addCustomCardio}
                className="w-full mt-4 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-md transition-all active:scale-95"
              >
                + Add Custom Cardio Exercise
              </button>
            </div>
          </div>
        )}
        </div>
      )
      )}

      {/* Weight/Reps Picker Modal for Abs (Mobile) */}
      {pickerOpen && pickerExerciseId && (() => {
        const exercise = absExercises.find(ex => ex.id === pickerExerciseId);
        if (!exercise) return null;

        const currentSet = pickerSetIndex !== null ? parseSet((exerciseData[pickerExerciseId]?.sets || [])[pickerSetIndex] || '') : { weight: '', reps: '' };
        const exerciseById = getExerciseById(exercise.selected);
        const placeholder = getPlaceholderForExercise(exercise.selected);

        const isBodyweight = exerciseById?.metricType === 'bodyweight' || placeholder === 'Reps';
        const isTimed = exerciseById?.metricType === 'timed' || placeholder.includes('Duration') || placeholder.includes('sec');

        let exerciseType = 'weight';
        if (isTimed) exerciseType = 'timed';
        else if (isBodyweight) exerciseType = 'bodyweight';

        return (
          <WeightRepsPicker
            isOpen={pickerOpen}
            onClose={() => setPickerOpen(false)}
            weight={currentSet.weight}
            reps={currentSet.reps}
            onSave={handleAbsPickerSave}
            exerciseType={exerciseType}
            initialField={pickerInitialField}
          />
        );
      })()}

      {/* Picker Modal for Cardio (Mobile) */}
      {cardioPickerOpen && (
        <WeightRepsPicker
          isOpen={cardioPickerOpen}
          onClose={() => setCardioPickerOpen(false)}
          weight=""
          reps={cardioPickerValue}
          onSave={handleCardioPickerSave}
          exerciseType="bodyweight"
          initialField="reps"
          customLabel={cardioPickerLabel}
        />
      )}
    </div>
  );
}

export default OptionalWorkoutSections;

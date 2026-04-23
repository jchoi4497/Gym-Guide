import { useState, useEffect, useRef } from 'react';
import { getExercisesByCategory, EXERCISE_CATEGORIES, getPlaceholderForExercise, getExerciseName, getExerciseById, getExerciseIdByName } from '../config/exerciseConfig';
import WeightRepsPicker from './WeightRepsPicker';
import ExerciseAutocomplete from './ExerciseAutocomplete';
import DropDown from './DropDown';
import DataChart from './DataChart';
import { useIsMobile } from '../hooks/useIsMobile';
import { parseSet, combineSet, getPreviousSet } from '../utils/setHelpers';
import { useSettings } from '../contexts/SettingsContext';
import { displayWeight, saveWeight } from '../utils/weightConversion';
import { useTheme } from '../contexts/ThemeContext';

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
  expandAll = true, // Control expand/collapse from parent
  absExpanded: absExpandedProp, // Controlled state from parent (optional)
  setAbsExpanded: setAbsExpandedProp,
  cardioExpanded: cardioExpandedProp, // Controlled state from parent (optional)
  setCardioExpanded: setCardioExpandedProp,
  previousWorkoutData, // For graph comparison
  monthlyWorkoutData = [], // For monthly graph view
  graphView = 'previous', // 'previous' or 'monthly'
  isSavedWorkoutEditMode = false, // Special flag for SavedWorkout edit mode styling
}) {
  const { theme } = useTheme();

  // Use controlled state from parent if provided, otherwise use local state
  const [absExpandedLocal, setAbsExpandedLocal] = useState(true);
  const [cardioExpandedLocal, setCardioExpandedLocal] = useState(true);

  const absExpanded = absExpandedProp !== undefined ? absExpandedProp : absExpandedLocal;
  const setAbsExpanded = setAbsExpandedProp || setAbsExpandedLocal;
  const cardioExpanded = cardioExpandedProp !== undefined ? cardioExpandedProp : cardioExpandedLocal;
  const setCardioExpanded = setCardioExpandedProp || setCardioExpandedLocal;

  const [cardioExercises, setCardioExercises] = useState([]);
  const [absExercises, setAbsExercises] = useState([]);

  // Individual exercise expanded states
  const [exerciseExpandedStates, setExerciseExpandedStates] = useState({});

  // Sync with expandAll prop
  useEffect(() => {
    if (expandAll !== undefined) {
      setAbsExpanded(expandAll);
      setCardioExpanded(expandAll);
      // Update all individual exercise states
      const newStates = {};
      [...absExercises, ...cardioExercises].forEach(ex => {
        newStates[ex.id] = expandAll;
      });
      setExerciseExpandedStates(newStates);
    }
  }, [expandAll, setAbsExpanded, setCardioExpanded, absExercises, cardioExercises]);
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
  const { settings } = useSettings();

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
    console.log('🏋️ [handleOpenAbsPicker]', { exerciseId, setIndex, field });
    console.log('🏋️ [handleOpenAbsPicker] Current exerciseData[exerciseId]:', exerciseData[exerciseId]);
    console.log('🏋️ [handleOpenAbsPicker] Current sets:', exerciseData[exerciseId]?.sets);
    setPickerExerciseId(exerciseId);
    setPickerSetIndex(setIndex);
    setPickerInitialField(field);
    setPickerOpen(true);
  };

  // Handle saving from picker modal for abs
  const handleAbsPickerSave = (weight, reps) => {
    console.log('💾 [handleAbsPickerSave] BEFORE save', {
      pickerExerciseId,
      pickerSetIndex,
      weight,
      reps,
      currentData: exerciseData[pickerExerciseId],
      currentSets: exerciseData[pickerExerciseId]?.sets
    });

    if (pickerExerciseId && pickerSetIndex !== null) {
      const combined = combineSet(weight, reps);
      const selectedExercise = exerciseData[pickerExerciseId]?.exerciseName || absExercises.find(ex => ex.id === pickerExerciseId)?.selected;
      console.log('💾 [handleAbsPickerSave] Calling onExerciseDataChange with:', {
        exerciseId: pickerExerciseId,
        exerciseName: selectedExercise,
        setIndex: pickerSetIndex,
        combined
      });
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
            <label className={`flex items-center gap-3 ${disableCheckboxes ? 'cursor-not-allowed' : 'cursor-pointer'} group`}>
              <input
                type="checkbox"
                checked={showAbs}
                onChange={(e) => setShowAbs(e.target.checked)}
                disabled={disableCheckboxes}
                className={`w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 ${disableCheckboxes ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              />
              <span className={`text-xl ${disableCheckboxes ? 'font-normal' : 'font-semibold'} ${theme.headerText} ${disableCheckboxes ? 'opacity-50' : ''} transition-colors drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]`}>
                Core
              </span>
            </label>
          </div>

        {showAbs && (
          <div className="rounded-2xl bg-sky-50 mb-8 p-2 sm:p-4 overflow-visible">
            <div className="space-y-4">
              {absExercises.map((exercise, index) => {
              const exerciseExpanded = exerciseExpandedStates[exercise.id] !== undefined
                ? exerciseExpandedStates[exercise.id]
                : true;

              const setExerciseExpanded = (value) => {
                setExerciseExpandedStates(prev => ({
                  ...prev,
                  [exercise.id]: value
                }));
              };

              return (
                <div key={exercise.id} className="relative rounded-lg bg-white mb-3 overflow-visible">
                  {/* Remove button - show when editing */}
                  {isEditingSets && (
                    <button
                      onClick={() => removeAbs(exercise.id)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 z-30 cursor-pointer"
                      title="Remove Exercise"
                    >
                      <span className="text-xs font-bold">✕</span>
                    </button>
                  )}

                  {/* Header - Always Visible */}
                  <div className="flex items-center justify-between bg-sky-50 transition-colors rounded-t-lg pr-2">
                    <div className="flex-1 flex items-center gap-2 py-2 sm:py-3 pl-8 sm:pl-3 min-w-0">
                      <div className="flex-1 min-w-0">
                        {disableCheckboxes ? (
                          // VIEW MODE: Show exercise name as plain text
                          <div className="text-2xl font-bold text-gray-900">
                            {getExerciseName(exerciseData[exercise.id]?.exerciseName || exerciseData[exercise.id]?.selection || exercise.selected) || exerciseData[exercise.id]?.exerciseName || exerciseData[exercise.id]?.selection || exercise.selected}
                          </div>
                        ) : isSavedWorkoutEditMode ? (
                          // SAVEDWORKOUT EDIT MODE: Autocomplete styled like main exercises (bold text with underline on focus)
                          <div className="text-2xl font-bold">
                            <ExerciseAutocomplete
                              value={exercise.selected === 'custom' ? '' : (getExerciseName(exerciseData[exercise.id]?.exerciseName || exerciseData[exercise.id]?.selection || exercise.selected))}
                              onChange={(value) => {
                                handleAbsChange(exercise.id, value, -1, null, value);
                              }}
                              onSelect={(exerciseObj) => {
                                handleAbsChange(exercise.id, exerciseObj.name, -1, null, exerciseObj.isPreset ? exerciseObj.id : exerciseObj.name);
                              }}
                              previousCustomExercises={previousCustomExercises}
                              placeholder="Exercise Name"
                              className="bg-transparent border-b-2 border-sky-200 focus:border-sky-500 outline-none px-1 w-full"
                            />
                          </div>
                        ) : exercise.isCustom || exercise.selected === 'custom' || !exercise.options.find(opt => opt.value === exercise.selected) ? (
                          // CREATE NEW WORKOUT MODE - Custom exercise: Use autocomplete
                          <ExerciseAutocomplete
                            value={exercise.selected === 'custom' ? '' : (getExerciseName(exerciseData[exercise.id]?.exerciseName || exerciseData[exercise.id]?.selection || exercise.selected))}
                            onChange={(value) => {
                              handleAbsChange(exercise.id, value, -1, null, value);
                            }}
                            onSelect={(exerciseObj) => {
                              handleAbsChange(exercise.id, exerciseObj.name, -1, null, exerciseObj.isPreset ? exerciseObj.id : exerciseObj.name);
                            }}
                            previousCustomExercises={previousCustomExercises}
                            placeholder="Enter exercise name..."
                            className="w-full px-2 sm:px-3 py-1 border border-blue-200 rounded-md focus:border-blue-500 outline-none transition-all text-sm"
                          />
                        ) : (
                          // CREATE NEW WORKOUT MODE - Preset exercise: Use dropdown
                          <DropDown
                            options={[...exercise.options, { label: 'Custom', value: 'custom' }]}
                            onChange={(value) => handleAbsChange(exercise.id, value, -1, null, value)}
                            value={exercise.selected}
                          />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setExerciseExpanded(!exerciseExpanded)}
                      className="p-2 hover:bg-sky-100 transition-colors flex-shrink-0 z-10"
                      type="button"
                    >
                      <span className="text-gray-600 font-bold">{exerciseExpanded ? '▼' : '▶'}</span>
                    </button>
                  </div>

                  {/* Expandable Content */}
                  {exerciseExpanded && (
                  <div className="p-4 bg-sky-50 rounded-b-lg">
                    <div className="flex flex-col lg:flex-row w-full gap-6">
                      {/* Inputs section */}
                      <div className={`flex flex-col w-full ${monthlyWorkoutData && monthlyWorkoutData.length > 0 ? 'lg:w-1/2' : ''}`}>

                      {(() => {
                        const baseSetCount = Number(numberOfSets);
                        const currentSetCount = exerciseData[exercise.id]?.sets?.length || baseSetCount;
                        const selectedExercise = exerciseData[exercise.id]?.exerciseName || exercise.selected;
                        const exerciseById = getExerciseById(exercise.selected);
                        const placeholder = getPlaceholderForExercise(exercise.selected);

                        // Determine exercise type
                        const isBodyweight = exerciseById?.metricType === 'bodyweight' || placeholder === 'Reps';
                        const isTimed = exerciseById?.metricType === 'timed' || placeholder.includes('Duration') || placeholder.includes('sec');
                        const showWeightInput = !isBodyweight && !isTimed;

                        return (
                          <>
                            {/* Set inputs row */}
                            <div className="flex flex-row flex-wrap gap-3 items-center">
                            {Array.from({ length: currentSetCount }).map((_, idx) => {
                              const currentSet = parseSet((exerciseData[exercise.id]?.sets || [])[idx] || '');
                              const previousSet = idx > 0 ? parseSet((exerciseData[exercise.id]?.sets || [])[idx - 1] || '') : null;
                              const hasPreviousSet = previousSet && (previousSet.weight || previousSet.reps);

                              return (
                                <div key={idx} className="relative flex items-center gap-1 mb-2 sm:mb-0">
                                  {disableCheckboxes ? (
                                    // VIEW MODE: Simple display
                                    <div className="p-4 rounded bg-gradient-to-r from-blue-50 to-blue-100 text-xl min-w-[60px] text-center">
                                      {(() => {
                                        const convertedWeight = displayWeight(currentSet.weight, settings.weightUnit);
                                        if (convertedWeight && currentSet.reps) {
                                          return `${convertedWeight} × ${currentSet.reps}`;
                                        } else if (currentSet.reps) {
                                          return currentSet.reps;
                                        }
                                        return '-';
                                      })()}
                                    </div>
                                  ) : isMobile ? (
                                    // MOBILE EDIT: Buttons that open picker
                                    <>
                                      {showWeightInput && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleOpenAbsPicker(exercise.id, idx, 'weight')}
                                            className="px-2 py-2 w-16 sm:w-20 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm hover:bg-blue-200 active:scale-95"
                                          >
                                            {displayWeight(currentSet.weight, settings.weightUnit) || <span className="text-gray-400">{settings.weightUnit}</span>}
                                          </button>
                                          <span className="text-gray-500 font-bold text-xs">×</span>
                                        </>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleOpenAbsPicker(exercise.id, idx, 'reps')}
                                        className={`px-2 py-2 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm hover:bg-blue-200 active:scale-95 ${showWeightInput ? 'w-14 sm:w-16' : 'w-16 sm:w-20'}`}
                                      >
                                        {currentSet.reps || <span className="text-gray-400">{isTimed ? "sec" : "reps"}</span>}
                                      </button>
                                    </>
                                  ) : (
                                    // DESKTOP EDIT: Regular inputs
                                    <>
                                      {showWeightInput && (
                                        <>
                                          <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            value={displayWeight(currentSet.weight, settings.weightUnit)}
                                            onChange={(e) => {
                                              if (parseFloat(e.target.value) < 0) return;
                                              const weightInLbs = saveWeight(e.target.value, settings.weightUnit);
                                              const combined = combineSet(weightInLbs, currentSet.reps);
                                              handleAbsInput(exercise.id, selectedExercise, idx, combined);
                                            }}
                                            placeholder={settings.weightUnit}
                                            className="px-2 py-2 w-16 sm:w-20 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm"
                                          />
                                          <span className="text-gray-500 font-bold text-xs">×</span>
                                        </>
                                      )}
                                      <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={currentSet.reps}
                                        onChange={(e) => {
                                          if (parseFloat(e.target.value) < 0) return;
                                          const combined = combineSet(currentSet.weight, e.target.value);
                                          handleAbsInput(exercise.id, selectedExercise, idx, combined);
                                        }}
                                        placeholder={isTimed ? "sec" : "reps"}
                                        className={`px-2 py-2 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm ${showWeightInput ? 'w-14 sm:w-16' : 'w-16 sm:w-20'}`}
                                      />
                                    </>
                                  )}

                                  {/* Copy Previous Set Button - only show if there's a previous set and current set is empty */}
                                  {hasPreviousSet && !currentSet.weight && !currentSet.reps && !disableCheckboxes && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const previousSetString = getPreviousSet(exerciseData[exercise.id]?.sets, idx);
                                        if (previousSetString) {
                                          handleAbsInput(exercise.id, selectedExercise, idx, previousSetString);
                                        }
                                      }}
                                      className="absolute top-1/2 -translate-y-1/2 -right-8 w-7 h-7 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-sm font-bold transition-all active:scale-90 flex items-center justify-center shadow-md z-10"
                                      title="Copy previous set"
                                    >
                                      ↑
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                            </div>

                            {/* Add/Remove set buttons - only show when isEditingSets is true */}
                            {isEditingSets && (
                              <div className="flex flex-row gap-2 justify-start">
                                <button
                                  onClick={() => handleAbsAddSet(exercise.id, exerciseData[exercise.id]?.exerciseName || exercise.selected)}
                                  className="px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-bold transition-colors cursor-pointer whitespace-nowrap text-sm"
                                  title="Add another set"
                                >
                                  + Add
                                </button>
                                <button
                                  onClick={() => handleAbsRemoveSet(exercise.id)}
                                  disabled={currentSetCount <= 1}
                                  className={`px-4 py-2 rounded-md font-bold transition-colors whitespace-nowrap text-sm ${
                                    currentSetCount <= 1
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-red-500 hover:bg-red-600 text-white cursor-pointer active:bg-red-700'
                                  }`}
                                  title="Remove last set"
                                >
                                  - Remove
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                      </div>

                      {/* Graph section - only show if we have monthly workout data (i.e., saved workout) */}
                      {monthlyWorkoutData && monthlyWorkoutData.length > 0 && (
                        <div className="w-full lg:w-1/2">
                          <DataChart
                            exerciseKey={exercise.id}
                            currentData={exerciseData[exercise.id]}
                            monthlyWorkoutData={monthlyWorkoutData}
                            graphView={graphView}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              );
            })}

              {/* Add Custom Abs Exercise Button */}
              {isEditingSets && (
                <button
                  onClick={addCustomAbs}
                  className={`w-full mt-4 px-4 py-3 ${theme.btnPrimary} ${theme.btnPrimaryText} rounded-lg font-semibold shadow-md transition-all active:scale-95`}
                >
                  + Add Custom Abs Exercise
                </button>
              )}
            </div>
          </div>
        )}
        </div>
      ) : (
        /* Cardio Section */
        <div key="cardio">
          <div className="flex items-center justify-between mb-2">
            <label className={`flex items-center gap-3 ${disableCheckboxes ? 'cursor-not-allowed' : 'cursor-pointer'} group`}>
              <input
                type="checkbox"
                checked={showCardio}
                onChange={(e) => setShowCardio(e.target.checked)}
                disabled={disableCheckboxes}
                className={`w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 ${disableCheckboxes ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              />
              <span className={`text-xl ${disableCheckboxes ? 'font-normal' : 'font-semibold'} ${theme.headerText} ${disableCheckboxes ? 'opacity-50' : ''} transition-colors drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]`}>
                Cardio
              </span>
            </label>
          </div>

        {showCardio && (
          <div className="rounded-2xl bg-sky-50 mb-8 p-2 sm:p-4 overflow-visible">
            <div className="space-y-4">
              {cardioExercises.map((exercise, index) => {
              const exerciseExpanded = exerciseExpandedStates[exercise.id] !== undefined
                ? exerciseExpandedStates[exercise.id]
                : true;

              const setExerciseExpanded = (value) => {
                setExerciseExpandedStates(prev => ({
                  ...prev,
                  [exercise.id]: value
                }));
              };

              return (
                <div key={exercise.id} className="relative rounded-lg bg-white mb-3 overflow-visible">
                  {/* Remove button - show when editing */}
                  {isEditingSets && (
                    <button
                      onClick={() => removeCardio(exercise.id)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 z-30 cursor-pointer"
                      title="Remove Exercise"
                    >
                      <span className="text-xs font-bold">✕</span>
                    </button>
                  )}

                  {/* Header - Always Visible */}
                  <div className="flex items-center justify-between bg-sky-50 transition-colors rounded-t-lg pr-2">
                    <div className="flex-1 flex items-center gap-2 py-2 sm:py-3 pl-8 sm:pl-3 min-w-0">
                      <div className="flex-1 min-w-0">
                        {disableCheckboxes ? (
                          // VIEW MODE: Show exercise name as plain text
                          <div className="text-2xl font-bold text-gray-900">
                            {getExerciseName(exerciseData[exercise.id]?.exerciseName || exerciseData[exercise.id]?.selection || exercise.selected) || exerciseData[exercise.id]?.exerciseName || exerciseData[exercise.id]?.selection || exercise.selected}
                          </div>
                        ) : isSavedWorkoutEditMode ? (
                          // SAVEDWORKOUT EDIT MODE: Autocomplete styled like main exercises (bold text with underline on focus)
                          <div className="text-2xl font-bold">
                            <ExerciseAutocomplete
                              value={exercise.selected === 'custom' ? '' : (getExerciseName(exerciseData[exercise.id]?.exerciseName || exerciseData[exercise.id]?.selection || exercise.selected))}
                              onChange={(value) => {
                                handleCardioChange(exercise.id, value, -1, null, value);
                              }}
                              onSelect={(exerciseObj) => {
                                handleCardioChange(exercise.id, exerciseObj.name, -1, null, exerciseObj.isPreset ? exerciseObj.id : exerciseObj.name);
                              }}
                              previousCustomExercises={previousCustomExercises}
                              placeholder="Exercise Name"
                              className="bg-transparent border-b-2 border-sky-200 focus:border-sky-500 outline-none px-1 w-full"
                            />
                          </div>
                        ) : exercise.isCustom || exercise.selected === 'custom' || !exercise.options.find(opt => opt.value === exercise.selected) ? (
                          // CREATE NEW WORKOUT MODE - Custom exercise: Use autocomplete
                          <ExerciseAutocomplete
                            value={exercise.selected === 'custom' ? '' : (getExerciseName(exerciseData[exercise.id]?.exerciseName || exerciseData[exercise.id]?.selection || exercise.selected))}
                            onChange={(value) => {
                              handleCardioChange(exercise.id, value, -1, null, value);
                            }}
                            onSelect={(exerciseObj) => {
                              handleCardioChange(exercise.id, exerciseObj.name, -1, null, exerciseObj.isPreset ? exerciseObj.id : exerciseObj.name);
                            }}
                            previousCustomExercises={previousCustomExercises}
                            placeholder="Enter exercise name..."
                            className="w-full px-2 sm:px-3 py-1 border border-blue-200 rounded-md focus:border-blue-500 outline-none transition-all text-sm"
                          />
                        ) : (
                          // CREATE NEW WORKOUT MODE - Preset exercise: Use dropdown
                          <DropDown
                            options={[...exercise.options, { label: 'Custom', value: 'custom' }]}
                            onChange={(value) => handleCardioChange(exercise.id, value, -1, null, value)}
                            value={exercise.selected}
                          />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setExerciseExpanded(!exerciseExpanded)}
                      className="p-2 hover:bg-sky-100 transition-colors flex-shrink-0 z-10"
                      type="button"
                    >
                      <span className="text-gray-600 font-bold">{exerciseExpanded ? '▼' : '▶'}</span>
                    </button>
                  </div>

                  {/* Expandable Content */}
                  {exerciseExpanded && (
                    <div className="p-4 bg-sky-50 rounded-b-lg">
                      <div className="flex flex-col lg:flex-row w-full gap-6">
                        {/* Inputs section */}
                        <div className={`flex flex-col w-full ${monthlyWorkoutData && monthlyWorkoutData.length > 0 ? 'lg:w-1/2' : ''}`}>

                        {(() => {
                          const selectedExerciseId = exercise.selected || '';
                          const cardioFields = getCardioFields(selectedExerciseId);

                          return (
                            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-2 items-center">
                              {cardioFields.map((label, idx) => {
                                const value = (exerciseData[exercise.id]?.sets || [])[idx] || '';

                                return (
                                  <div key={idx} className="relative mb-2 sm:mb-0 flex-shrink-0">
                                    {disableCheckboxes ? (
                                      // VIEW MODE: Simple display
                                      <div className="p-4 rounded bg-gradient-to-r from-blue-50 to-blue-100 text-xl min-w-[100px] text-center">
                                        {value || '-'}
                                      </div>
                                    ) : isMobile ? (
                                      // MOBILE EDIT: Button that opens picker
                                      <button
                                        type="button"
                                        onClick={() => handleOpenCardioPicker(exercise.id, idx, label)}
                                        className="px-2 py-2 w-24 sm:w-28 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm hover:bg-blue-200 active:scale-95"
                                      >
                                        {value || <span className="text-gray-400 text-xs">{label}</span>}
                                      </button>
                                    ) : (
                                      // DESKTOP EDIT: Regular input
                                      <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        placeholder={label}
                                        value={value}
                                        onChange={(e) => {
                                          if (parseFloat(e.target.value) < 0) return;
                                          handleCardioInput(exercise.id, exercise.selected, idx, e.target.value);
                                        }}
                                        className="px-2 py-2 w-24 sm:w-28 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm"
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Graph section - only show if we have monthly workout data (i.e., saved workout) */}
                      {monthlyWorkoutData && monthlyWorkoutData.length > 0 && (
                        <div className="w-full lg:w-1/2">
                          <DataChart
                            exerciseKey={exercise.id}
                            currentData={exerciseData[exercise.id]}
                            monthlyWorkoutData={monthlyWorkoutData}
                            graphView={graphView}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              );
            })}

              {/* Add Custom Cardio Exercise Button */}
              {isEditingSets && (
                <button
                  onClick={addCustomCardio}
                  className={`w-full mt-4 px-4 py-3 ${theme.btnPrimary} ${theme.btnPrimaryText} rounded-lg font-semibold shadow-md transition-all active:scale-95`}
                >
                  + Add Custom Cardio Exercise
                </button>
              )}
            </div>
          </div>
        )}
        </div>
      ))}

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
          exerciseType="cardio"
          initialField="reps"
          customLabel={cardioPickerLabel}
        />
      )}
    </div>
  );
}

export default OptionalWorkoutSections;

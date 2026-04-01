import { useState, useEffect } from 'react';
import DropDown from './DropDown';
import ExerciseAutocomplete from './ExerciseAutocomplete';
import { getPlaceholderForExercise } from '../config/exerciseConfig';
import WeightRepsPicker from './WeightRepsPicker';
import { useIsMobile } from '../hooks/useIsMobile';
import { parseSet, combineSet, getPreviousSet, countFilledSets } from '../utils/setHelpers';

function TableRow({
  numberOfSets,
  onChange,
  options,
  value,
  rowId,
  cellInput,
  setInputs,
  isCustom,
  onRemove,
  onRemoveSet,
  previousCustomExercises = [],
  isEditingSets = false,
  favoriteExercises = [],
  onToggleFavorite,
  expandAll,
}) {

  // Calculate current set count consistently
  const baseSetCount = Number(numberOfSets);
  const currentSetCount = setInputs ? setInputs.length : baseSetCount;

  // Picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingSetIndex, setEditingSetIndex] = useState(null);
  const [initialField, setInitialField] = useState('weight'); // Track which field was clicked

  // Collapse/expand state - controlled by expandAll prop
  const [isExpanded, setIsExpanded] = useState(true);

  // Sync with expandAll prop
  useEffect(() => {
    if (expandAll !== undefined) {
      setIsExpanded(expandAll);
    }
  }, [expandAll]);

  // Mobile detection (now using shared hook)
  const isMobile = useIsMobile();

  // Handle weight input change
  const handleWeightChange = (setIndex, newWeight) => {
    const currentSet = parseSet((setInputs && setInputs[setIndex]) || '');
    const combined = combineSet(newWeight, currentSet.reps);
    cellInput(setIndex, combined);
  };

  // Handle reps input change
  const handleRepsChange = (setIndex, newReps) => {
    const currentSet = parseSet((setInputs && setInputs[setIndex]) || '');
    const combined = combineSet(currentSet.weight, newReps);
    cellInput(setIndex, combined);
  };

  // Open picker for a specific set and field
  const handleOpenPicker = (setIndex, field = 'weight') => {
    setEditingSetIndex(setIndex);
    setInitialField(field);
    setPickerOpen(true);
  };

  // Save values from picker
  const handlePickerSave = (weight, reps) => {
    if (editingSetIndex !== null) {
      const combined = combineSet(weight, reps);
      cellInput(editingSetIndex, combined);
    }
  };

  // Copy previous set exactly
  const handleCopyPreviousSet = (setIndex) => {
    const previousSetString = getPreviousSet(setInputs, setIndex);
    if (!previousSetString) return; // No previous set to copy

    cellInput(setIndex, previousSetString);
  };

  const recordInputCells = () => {
    const cellElements = [];
    // Get dynamic placeholder based on exercise type
    const placeholder = getPlaceholderForExercise(value);
    const isCardio = placeholder.includes('min') || placeholder.includes('mi');
    const isBodyweight = placeholder === 'Reps';
    const isTimed = placeholder.includes('Duration') || placeholder.includes('sec');
    const showWeightInput = !isBodyweight && !isTimed && !isCardio;

    for (let i = 0; i < currentSetCount; i++) {
      const currentSet = parseSet((setInputs && setInputs[i]) || '');
      const previousSet = i > 0 ? parseSet((setInputs && setInputs[i - 1]) || '') : null;
      const hasPreviousSet = previousSet && (previousSet.weight || previousSet.reps);

      cellElements.push(
        <div key={i + rowId} className="relative mb-2 sm:mb-0 flex-shrink-0">
          <span className="absolute -top-2 -left-2 text-xs text-gray-400 font-medium bg-sky-50 px-1 rounded z-10">{i + 1}</span>
          <div className="relative flex items-center gap-1">
          {isMobile ? (
            // MOBILE: Buttons that open picker modal
            <>
              {showWeightInput && (
                <>
                  <button
                    type="button"
                    onClick={() => handleOpenPicker(i, 'weight')}
                    className="px-2 py-2 w-16 sm:w-20 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm hover:bg-blue-200 active:scale-95"
                  >
                    {currentSet.weight || <span className="text-gray-400">lbs</span>}
                  </button>
                  <span className="text-gray-500 font-bold text-xs">×</span>
                </>
              )}
              <button
                type="button"
                onClick={() => handleOpenPicker(i, 'reps')}
                className={`px-2 py-2 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm hover:bg-blue-200 active:scale-95 ${showWeightInput ? 'w-14 sm:w-16' : 'w-16 sm:w-20'}`}
              >
                {currentSet.reps || <span className="text-gray-400">{isCardio ? placeholder : (isTimed ? "sec" : "reps")}</span>}
              </button>
            </>
          ) : (
            // DESKTOP: Regular text inputs
            <>
              {showWeightInput && (
                <>
                  <input
                    type="number"
                    step="0.5"
                    value={currentSet.weight}
                    onChange={(e) => handleWeightChange(i, e.target.value)}
                    placeholder="lbs"
                    className="px-2 py-2 w-16 sm:w-20 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm"
                  />
                  <span className="text-gray-500 font-bold text-xs">×</span>
                </>
              )}
              <input
                type="number"
                step={isCardio ? "0.1" : "1"}
                value={currentSet.reps}
                onChange={(e) => handleRepsChange(i, e.target.value)}
                placeholder={isCardio ? placeholder : (isTimed ? "sec" : "reps")}
                className={`px-2 py-2 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm ${showWeightInput ? 'w-14 sm:w-16' : 'w-16 sm:w-20'}`}
              />
            </>
          )}

            {/* Copy Previous Set Button - only show if there's a previous set and current set is empty */}
            {hasPreviousSet && !currentSet.weight && !currentSet.reps && (
              <button
                type="button"
                onClick={() => handleCopyPreviousSet(i)}
                className="absolute top-1/2 -translate-y-1/2 -right-8 w-7 h-7 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-sm font-bold transition-all active:scale-90 flex items-center justify-center shadow-md z-10"
                title="Copy previous set"
              >
                ↑
              </button>
            )}
          </div>
        </div>
      );
    }
    return cellElements;
  };

  const handleAddSet = () => {
    cellInput(currentSetCount, '');
  };

  const handleRemoveLastSet = () => {
    if (currentSetCount > 1 && onRemoveSet) {
      onRemoveSet(currentSetCount - 1);
    }
  };

  // Get current set being edited
  const currentSet = editingSetIndex !== null ? parseSet((setInputs && setInputs[editingSetIndex]) || '') : { weight: '', reps: '' };

  // Determine exercise type for picker
  const placeholder = getPlaceholderForExercise(value);
  const isCardio = placeholder.includes('min') || placeholder.includes('mi');
  const isTimed = placeholder.includes('Duration') || placeholder.includes('sec');
  let exerciseType = 'weight';
  if (isCardio) exerciseType = 'cardio';
  else if (isTimed) exerciseType = 'timed';
  else if (placeholder === 'Reps') exerciseType = 'bodyweight';

  // Count filled sets (using shared helper)
  const filledSetsCount = countFilledSets(setInputs);

  return (
    <>
      <div className="relative border border-gray-300 rounded-lg bg-white shadow-sm mb-3 overflow-visible">
        {isEditingSets && (
          <button
            onClick={onRemove}
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
              {isCustom || value === 'custom' || !options.find(opt => opt.value === value) ? (
                <ExerciseAutocomplete
                  value={value === 'custom' ? '' : value}
                  onChange={onChange}
                  onSelect={(exercise) => {
                    onChange(exercise.name, exercise.category);
                  }}
                  previousCustomExercises={previousCustomExercises}
                  placeholder="Enter exercise name..."
                  className="w-full px-2 sm:px-3 py-1 border border-blue-200 rounded-md focus:border-blue-500 outline-none transition-all text-sm"
                />
              ) : (
                <DropDown
                  options={[...options, { label: 'Custom', value: 'custom' }]}
                  onChange={onChange}
                  value={value}
                  favorites={favoriteExercises}
                  onToggleFavorite={onToggleFavorite}
                />
              )}
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-sky-100 transition-colors flex-shrink-0 z-10"
            type="button"
          >
            <span className="text-gray-600 font-bold">{isExpanded ? '▼' : '▶'}</span>
          </button>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="p-4 bg-sky-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-2 items-center">
              {recordInputCells()}

              {isEditingSets && (
                <div className="ml-2 flex-shrink-0 flex flex-row gap-1 sm:gap-2 mt-2 sm:mt-0">
                  <button
                    onClick={handleAddSet}
                    className="px-2 sm:px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-bold transition-colors cursor-pointer whitespace-nowrap text-sm sm:text-base"
                    title="Add another set"
                  >
                    + Add
                  </button>
                  <button
                    onClick={handleRemoveLastSet}
                    disabled={currentSetCount <= 1}
                    className={`px-2 sm:px-4 py-2 rounded-md font-bold transition-colors whitespace-nowrap text-sm sm:text-base ${
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
            </div>
          </div>
        )}
      </div>

      {/* Wheel Picker Modal */}
      <WeightRepsPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        weight={currentSet.weight}
        reps={currentSet.reps}
        onSave={handlePickerSave}
        exerciseType={exerciseType}
        initialField={initialField}
      />
    </>
  );
}

export default TableRow;

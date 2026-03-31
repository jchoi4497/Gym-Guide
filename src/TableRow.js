import { useState, useEffect } from 'react';
import DropDown from './DropDown';
import ExerciseAutocomplete from './components/ExerciseAutocomplete';
import { getPlaceholderForExercise } from './config/exerciseConfig';
import WeightRepsPicker from './components/WeightRepsPicker';

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

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's sm breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Parse "145x12" format into weight and reps
  const parseSet = (setString) => {
    if (!setString || setString.trim() === '') {
      return { weight: '', reps: '' };
    }

    if (setString.includes('x')) {
      const [weight, reps] = setString.split('x').map(s => s.trim());
      return { weight: weight || '', reps: reps || '' };
    }

    // Bodyweight (just reps, no weight)
    return { weight: '', reps: setString.trim() };
  };

  // Combine weight and reps back to "145x12" format
  const combineSet = (weight, reps) => {
    const w = weight.trim();
    const r = reps.trim();

    if (!w && !r) return '';
    if (!w) return r; // Bodyweight - just reps
    if (!r) return w + 'x'; // Weight entered but no reps yet
    return `${w}x${r}`;
  };

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
    if (setIndex === 0) return; // Can't copy if first set

    const previousSet = parseSet((setInputs && setInputs[setIndex - 1]) || '');
    if (!previousSet.weight && !previousSet.reps) return; // Nothing to copy

    // Copy exact same weight and reps
    const combined = combineSet(previousSet.weight, previousSet.reps);
    cellInput(setIndex, combined);
  };

  const recordInputCells = () => {
    const cellElements = [];
    // Get dynamic placeholder based on exercise type
    const placeholder = getPlaceholderForExercise(value);
    const isCardio = placeholder.includes('min') || placeholder.includes('mi');

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
              {!isCardio && (
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
                className="px-2 py-2 w-14 sm:w-16 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm hover:bg-blue-200 active:scale-95"
              >
                {currentSet.reps || <span className="text-gray-400">{isCardio ? placeholder : "reps"}</span>}
              </button>
            </>
          ) : (
            // DESKTOP: Regular text inputs
            <>
              {!isCardio && (
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
                placeholder={isCardio ? placeholder : "reps"}
                className="px-2 py-2 w-14 sm:w-16 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm"
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

  // Count filled sets
  const filledSetsCount = setInputs ? setInputs.filter(s => s && s.trim() !== '').length : 0;

  return (
    <>
      <div className="relative border border-gray-300 rounded-lg bg-white shadow-sm mb-3 overflow-hidden">
        {(isCustom || isEditingSets) && (
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 z-20 cursor-pointer"
            title="Remove Exercise"
          >
            <span className="text-xs font-bold">✕</span>
          </button>
        )}

        {/* Header - Always Visible */}
        <div className="flex items-center bg-sky-50 hover:bg-sky-100 transition-colors">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 flex items-center justify-between p-3 text-left"
          >
            <div className="flex items-center gap-2 flex-1">
              <span className="text-gray-400 text-sm">{isExpanded ? '▼' : '▶'}</span>
              <div className="flex-1">
                {isCustom || value === 'custom' || !options.find(opt => opt.value === value) ? (
                  <ExerciseAutocomplete
                    value={value === 'custom' ? '' : value}
                    onChange={onChange}
                    onSelect={(exercise) => {
                      onChange(exercise.name, exercise.category);
                    }}
                    previousCustomExercises={previousCustomExercises}
                    placeholder="Enter exercise name..."
                    className="w-full px-3 py-1 border border-blue-200 rounded-md focus:border-blue-500 outline-none transition-all text-sm"
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
            <span className="text-sm font-semibold text-gray-600 ml-2">
              {filledSetsCount}/{currentSetCount}
            </span>
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

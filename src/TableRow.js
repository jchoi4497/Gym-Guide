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
}) {

  // Calculate current set count consistently
  const baseSetCount = Number(numberOfSets);
  const currentSetCount = setInputs ? setInputs.length : baseSetCount;

  // Picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingSetIndex, setEditingSetIndex] = useState(null);

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

  // Open picker for a specific set
  const handleOpenPicker = (setIndex) => {
    setEditingSetIndex(setIndex);
    setPickerOpen(true);
  };

  // Save values from picker
  const handlePickerSave = (weight, reps) => {
    if (editingSetIndex !== null) {
      const combined = combineSet(weight, reps);
      cellInput(editingSetIndex, combined);
    }
  };

  const recordInputCells = () => {
    const cellElements = [];
    // Get dynamic placeholder based on exercise type
    const placeholder = getPlaceholderForExercise(value);
    const isCardio = placeholder.includes('min') || placeholder.includes('mi');

    for (let i = 0; i < currentSetCount; i++) {
      const currentSet = parseSet((setInputs && setInputs[i]) || '');

      cellElements.push(
        <div key={i + rowId} className="flex items-center gap-1 mb-2 sm:mb-0 flex-shrink-0">
          {!isCardio && (
            <>
              <button
                type="button"
                onClick={() => handleOpenPicker(i)}
                className="px-2 py-2 w-16 sm:w-20 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm hover:bg-blue-200 active:scale-95"
              >
                {currentSet.weight || <span className="text-gray-400">lbs</span>}
              </button>
              <span className="text-gray-500 font-bold text-xs">×</span>
            </>
          )}
          <button
            type="button"
            onClick={() => handleOpenPicker(i)}
            className="px-2 py-2 w-14 sm:w-16 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 text-gray-900 text-center text-sm hover:bg-blue-200 active:scale-95"
          >
            {currentSet.reps || <span className="text-gray-400">{isCardio ? placeholder : "reps"}</span>}
          </button>
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

  return (
    <>
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 border border-gray-300 rounded-md p-4 bg-sky-50 shadow-sm mb-4 overflow-visible">
        {(isCustom || isEditingSets) && (
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 z-20 cursor-pointer"
            title="Remove Exercise"
          >
            <span className="text-xs font-bold">✕</span>
          </button>
        )}
        {/* Conditional Rendering: Dropdown vs Text Input */}
        <div className="w-full sm:w-1/3">
          {isCustom || value === 'custom' || !options.find(opt => opt.value === value) ? (
            <ExerciseAutocomplete
              value={value === 'custom' ? '' : value}
              onChange={onChange}
              onSelect={(exercise) => {
                // Pass the full exercise object with category to the parent
                onChange(exercise.name, exercise.category);
              }}
              previousCustomExercises={previousCustomExercises}
              placeholder="Enter exercise name..."
              className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 outline-none transition-all"
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

        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-2 w-full items-center">
          {recordInputCells()}

          {isEditingSets && (
            <div className="ml-2 flex-shrink-0 flex flex-row gap-1 sm:gap-2">
              {/* + Add */}
              <button
                onClick={handleAddSet}
                className="px-2 sm:px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-bold transition-colors cursor-pointer whitespace-nowrap text-sm sm:text-base"
                title="Add another set"
              >
                + Add
              </button>
              {/* Remove */}
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

      {/* Wheel Picker Modal */}
      <WeightRepsPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        weight={currentSet.weight}
        reps={currentSet.reps}
        onSave={handlePickerSave}
        exerciseType={exerciseType}
      />
    </>
  );
}

export default TableRow;

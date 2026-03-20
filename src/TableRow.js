import { useState, useEffect } from 'react';
import DropDown from './DropDown';
import ExerciseAutocomplete from './components/ExerciseAutocomplete';
import { getPlaceholderForExercise } from './config/exerciseConfig';

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
}) {
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Warn user if they try to refresh/leave while in edit mode
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isEditingMode) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    if (isEditingMode) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isEditingMode]);

  // Calculate current set count consistently
  const baseSetCount = Number(numberOfSets);
  const currentSetCount = setInputs ? setInputs.length : baseSetCount;

  const recordInputCells = () => {
    const cellElements = [];
    // Get dynamic placeholder based on exercise type
    const placeholder = getPlaceholderForExercise(value);

    for (let i = 0; i < currentSetCount; i++) {
      cellElements.push(
        <input
          key={i + rowId}
          id={`${rowId}-cell-${i}`}
          className="
                        px-3 py-2 w-full rounded-md
                        bg-gradient-to-r from-blue-50 to-blue-100
                        focus:outline-none focus:ring-2 focus:ring-blue-400
                        transition-colors duration-300
                        placeholder-gray-400 text-gray-900
                        mb-2 sm:mb-0
                    "
          type="text"
          placeholder={placeholder}
          value={(setInputs && setInputs[i]) || ''}
          onChange={(e) => cellInput(i, e.target.value)}
        />,
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

  return (
    <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 border border-gray-300 rounded-md p-4 bg-sky-50 shadow-sm mb-4">
      {isCustom && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 z-10 cursor-pointer"
          title="Remove Exercise"
        >
          <span className="text-xs font-bold">✕</span>
        </button>
      )}
      {/* Conditional Rendering: Dropdown vs Text Input */}
      <div className="w-full sm:w-1/3">
        {isCustom ? (
          <ExerciseAutocomplete
            value={value}
            onChange={onChange}
            onSelect={(exercise) => {
              onChange(exercise.name);
            }}
            previousCustomExercises={previousCustomExercises}
            placeholder="Enter exercise name..."
            className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 outline-none transition-all"
          />
        ) : (
          <DropDown options={options} onChange={onChange} value={value} />
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:gap-2 w-full items-center">
        {recordInputCells()}

        {!isEditingMode ? (
          <div className="ml-2 flex-shrink-0">
            <button
              onClick={() => setIsEditingMode(true)}
              className="px-3 py-2 rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm sm:text-base"
              title="Edit set count"
            >
              Edit Sets
            </button>
          </div>
        ) : (
          <div className="ml-2 flex-shrink-0 flex flex-row gap-1 sm:gap-2">
            {/* + Add - always first */}
            <button
              onClick={handleAddSet}
              className="px-2 sm:px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-bold transition-colors cursor-pointer whitespace-nowrap text-sm sm:text-base order-1"
              title="Add another set"
            >
              + Add
            </button>
            {/* Done - middle on mobile, right on desktop */}
            <button
              onClick={() => setIsEditingMode(false)}
              className="px-2 sm:px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm sm:text-base order-2 sm:order-3"
              title="Done editing sets"
            >
              ✓ Done
            </button>
            {/* Remove - right on mobile, middle on desktop */}
            <button
              onClick={handleRemoveLastSet}
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
          </div>
        )}
      </div>
    </div>
  );
}

export default TableRow;

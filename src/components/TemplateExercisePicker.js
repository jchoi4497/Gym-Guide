import { useState, useEffect } from 'react';
import { getDefaultExercises, getExerciseById, getExerciseName } from '../config/exerciseConfig';
import ExerciseAutocomplete from './ExerciseAutocomplete';

function TemplateExercisePicker({ muscleGroup, exercises, onChange }) {
  const [localExercises, setLocalExercises] = useState(exercises);

  // Sync with parent when exercises prop changes
  useEffect(() => {
    setLocalExercises(exercises);
  }, [exercises]);

  // Get default exercises for the muscle group
  const defaultExercises = muscleGroup && muscleGroup !== 'custom'
    ? getDefaultExercises(muscleGroup)
    : [];

  const handleAddExercise = () => {
    const newExercise = {
      category: '', // Will be set when exercise is selected
      exerciseId: '',
      exerciseName: '',
      isCustom: true,
      tempId: `temp_${Date.now()}`, // Temporary ID for React key
    };
    const updated = [...localExercises, newExercise];
    setLocalExercises(updated);
    onChange(updated);
  };

  const handleRemoveExercise = (index) => {
    const updated = localExercises.filter((_, i) => i !== index);
    setLocalExercises(updated);
    onChange(updated);
  };

  const handleExerciseChange = (index, exerciseName, detectedCategory) => {
    console.log('🔧 handleExerciseChange called:', { index, exerciseName, detectedCategory });

    // Convert exercise name to ID if it's a preset exercise
    const exercise = Object.values(require('../config/exerciseConfig').EXERCISES).find(
      ex => ex.name === exerciseName
    );

    const exerciseId = exercise ? exercise.id : exerciseName; // Use name as ID for custom exercises

    // IMPORTANT: Use the actual category from the exercise, not a custom timestamp!
    let category;
    if (exercise) {
      // Preset exercise - use its category
      category = exercise.category;
      console.log('✓ Using preset category:', category);
    } else if (detectedCategory) {
      // Custom exercise with detected category
      category = detectedCategory;
      console.log('✓ Using detected category:', category);
    } else {
      // Fallback to custom category (only if we can't detect)
      category = `custom_${Date.now()}`;
      console.log('⚠️ Using fallback custom category:', category);
    }

    const updated = [...localExercises];
    updated[index] = {
      category, // This is the actual category for the workout page
      exerciseId,
      exerciseName, // Store name for display
      detectedCategory: category,
      isDefault: updated[index].isDefault,
      tempId: updated[index].tempId,
    };

    console.log('💾 Saved exercise:', updated[index]);
    setLocalExercises(updated);
    onChange(updated);
  };

  const handleUseDefaults = () => {
    if (!defaultExercises || defaultExercises.length === 0) {
      alert('No default exercises available for this muscle group');
      return;
    }

    const defaultTemplate = defaultExercises.map((ex, idx) => {
      const exercise = getExerciseById(ex.selected);
      return {
        category: ex.id, // Use the category from defaults
        exerciseId: ex.selected,
        exerciseName: exercise ? exercise.name : ex.selected,
        isDefault: true,
        tempId: `default_${idx}`,
      };
    });

    setLocalExercises(defaultTemplate);
    onChange(defaultTemplate);
  };

  const getExerciseName = (exerciseId) => {
    if (!exerciseId) return '';
    const exercise = getExerciseById(exerciseId);
    return exercise ? exercise.name : exerciseId;
  };

  const getExerciseDisplayValue = (exercise) => {
    // If we have the exerciseName stored, use it
    if (exercise.exerciseName) return exercise.exerciseName;
    // Otherwise, look up the name from the ID
    return getExerciseName(exercise.exerciseId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Exercises</h3>
        <div className="flex gap-2">
          {defaultExercises.length > 0 && (
            <button
              type="button"
              onClick={handleUseDefaults}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold text-sm"
            >
              Use Defaults
            </button>
          )}
          <button
            type="button"
            onClick={handleAddExercise}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
          >
            + Add Exercise
          </button>
        </div>
      </div>

      {localExercises.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-3">No exercises added yet</p>
          <button
            type="button"
            onClick={handleAddExercise}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
          >
            Add First Exercise
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {localExercises.map((exercise, index) => (
            <div key={exercise.tempId || exercise.category || index} className="flex gap-3 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex-shrink-0 text-gray-500 font-semibold text-sm w-8">
                #{index + 1}
              </div>
              <div className="flex-1">
                <ExerciseAutocomplete
                  value={getExerciseDisplayValue(exercise)}
                  onChange={(value) => handleExerciseChange(index, value, null)}
                  onSelect={(exerciseObj) => handleExerciseChange(index, exerciseObj.name, exerciseObj.category)}
                  muscleGroup={muscleGroup}
                  previousCustomExercises={[]}
                  placeholder="Select or type exercise name..."
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {exercise.exerciseId && exercise.isDefault && (
                  <div className="mt-1 text-xs text-blue-600 font-semibold">
                    ✓ Default Exercise
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveExercise(index)}
                className="flex-shrink-0 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-bold"
                title="Remove exercise"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info sections */}
      {defaultExercises.length > 0 && localExercises.length === 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 mb-2">
            <strong>💡 Tip:</strong> Click "Use Defaults" to start with preset exercises for {muscleGroup}
          </p>
          <div className="text-xs text-blue-700">
            Default exercises: {defaultExercises.map(ex => getExerciseName(ex.selected)).join(', ')}
          </div>
        </div>
      )}

      {/* Summary */}
      {localExercises.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800 font-semibold mb-1">
            ✓ {localExercises.length} exercise{localExercises.length !== 1 ? 's' : ''} configured
          </p>
          <div className="text-xs text-green-700">
            {localExercises.map((ex, idx) => getExerciseDisplayValue(ex)).filter(Boolean).join(' • ')}
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplateExercisePicker;

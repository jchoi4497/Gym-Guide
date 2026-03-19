import { useState, useEffect, useRef } from 'react';
import { EXERCISES } from '../config/exerciseConfig';

/**
 * Autocomplete input for exercise names
 * Shows suggestions from:
 * 1. Preset exercises from exerciseConfig
 * 2. Previous custom exercises the user has created
 */
function ExerciseAutocomplete({
  value,
  onChange,
  onSelect,
  previousCustomExercises = [],
  placeholder = "Exercise Name",
  className = "",
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const wrapperRef = useRef(null);

  // Combine preset exercises and previous customs
  const allExercises = [
    // Presets from exerciseConfig
    ...Object.values(EXERCISES).map(ex => ({
      name: ex.name,
      id: ex.id,
      category: ex.category,
      isPreset: true,
    })),
    // Previous custom exercises
    ...previousCustomExercises.map(custom => ({
      name: custom.name,
      id: custom.id || custom.name, // Use name as fallback ID
      isPreset: false,
    })),
  ];

  // Remove duplicates (if user's custom matches a preset name)
  const uniqueExercises = allExercises.filter((exercise, index, self) =>
    index === self.findIndex(e => e.name.toLowerCase() === exercise.name.toLowerCase())
  );

  // Normalize string for better matching (remove spaces, lowercase, remove special chars)
  const normalize = (str) => {
    return str.toLowerCase().replace(/[\s-_]/g, '');
  };

  // Handle input change
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.trim().length > 0) {
      const normalizedInput = normalize(inputValue);

      // Filter suggestions based on input with smart matching
      const filtered = uniqueExercises.filter(ex => {
        const normalizedName = normalize(ex.name);

        // Match if:
        // 1. Normalized name includes the input (e.g., "benchpress" matches "Bench Press")
        // 2. OR original name includes the input (e.g., "bench" matches "Bench Press")
        // 3. OR any word in the name starts with the input (e.g., "press" matches "Bench Press")
        const wordsMatch = ex.name.toLowerCase().split(/\s+/).some(word =>
          word.startsWith(inputValue.toLowerCase())
        );

        return normalizedName.includes(normalizedInput) ||
               ex.name.toLowerCase().includes(inputValue.toLowerCase()) ||
               wordsMatch;
      });

      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (exercise) => {
    onChange(exercise.name);
    onSelect(exercise);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          if (value.trim().length > 0) {
            const normalizedInput = normalize(value);
            const filtered = uniqueExercises.filter(ex => {
              const normalizedName = normalize(ex.name);
              const wordsMatch = ex.name.toLowerCase().split(/\s+/).some(word =>
                word.startsWith(value.toLowerCase())
              );
              return normalizedName.includes(normalizedInput) ||
                     ex.name.toLowerCase().includes(value.toLowerCase()) ||
                     wordsMatch;
            });
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
          }
        }}
        className={className}
        autoComplete="off"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((exercise, index) => (
            <div
              key={`${exercise.id}-${index}`}
              onClick={() => handleSuggestionClick(exercise)}
              className="px-4 py-2 cursor-pointer hover:bg-blue-100 flex items-center justify-between"
            >
              <span className="text-gray-800">{exercise.name}</span>
              {exercise.isPreset ? (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Preset
                </span>
              ) : (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  Custom
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No matches found */}
      {showSuggestions && value.trim().length > 0 && filteredSuggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-green-300 rounded-lg shadow-lg px-4 py-3">
          <div className="flex items-start gap-2">
            <span className="text-green-600 text-lg">✓</span>
            <div>
              <p className="text-gray-800 font-medium text-sm">
                Creating new custom exercise:
              </p>
              <p className="text-green-700 font-bold">"{value}"</p>
              <p className="text-gray-500 text-xs mt-1">
                Click anywhere to confirm or keep typing to modify
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExerciseAutocomplete;

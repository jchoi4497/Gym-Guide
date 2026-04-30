import { useState, useEffect, useRef } from 'react';
import { EXERCISES } from '../config/exerciseConfig';
import { detectCategoryFromName } from '../utils/categoryDetection';

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
  placeholder = 'Exercise Name',
  className = '',
  autoFocus = false,
  disabled = false,
  pussy,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const justSelectedRef = useRef(false); // Track if we just selected from dropdown

  // Combine preset exercises and previous customs
  const allExercises = [
    // Presets from exerciseConfig
    ...Object.values(EXERCISES).map((ex) => ({
      name: ex.name,
      id: ex.id,
      category: ex.category,
      isPreset: true,
    })),
    // Previous custom exercises
    ...previousCustomExercises.map((custom) => ({
      name: custom.name,
      id: custom.id || custom.name, // Use name as fallback ID
      category: custom.category, // Include category from MyExercises
      isPreset: false,
    })),
  ];

  // Remove duplicates (if user's custom matches a preset name)
  const uniqueExercises = allExercises.filter(
    (exercise, index, self) =>
      index === self.findIndex((e) => e.name.toLowerCase() === exercise.name.toLowerCase()),
  );

  // Normalize string for better matching (remove spaces, lowercase, remove special chars)
  const normalize = (str) => {
    return str.toLowerCase().replace(/[\s-_]/g, '');
  };

  // Find best matching preset exercise for auto-linking
  const findBestPresetMatch = (inputValue) => {
    const normalized = normalize(inputValue);

    // First, try exact normalized match
    const exactMatch = uniqueExercises.find(
      (ex) => ex.isPreset && normalize(ex.name) === normalized,
    );
    if (exactMatch) return exactMatch;

    // Then, try if input is contained in preset name or vice versa
    const partialMatch = uniqueExercises.find((ex) => {
      if (!ex.isPreset) return false;
      const exNormalized = normalize(ex.name);
      return exNormalized.includes(normalized) || normalized.includes(exNormalized);
    });

    return partialMatch;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.trim().length > 0) {
      const normalizedInput = normalize(inputValue);

      // Filter suggestions based on input with smart matching
      const filtered = uniqueExercises.filter((ex) => {
        const normalizedName = normalize(ex.name);

        // Match if:
        // 1. Normalized name includes the input (e.g., "benchpress" matches "Bench Press")
        // 2. OR original name includes the input (e.g., "bench" matches "Bench Press")
        // 3. OR any word in the name starts with the input (e.g., "press" matches "Bench Press")
        const wordsMatch = ex.name
          .toLowerCase()
          .split(/\s+/)
          .some((word) => word.startsWith(inputValue.toLowerCase()));

        return (
          normalizedName.includes(normalizedInput) ||
          ex.name.toLowerCase().includes(inputValue.toLowerCase()) ||
          wordsMatch
        );
      });

      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
      setHighlightedIndex(-1); // Reset highlight when typing
    } else {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (exercise) => {
    // Mark that we just selected (to prevent blur handler from overwriting)
    justSelectedRef.current = true;

    // Immediately hide suggestions
    setShowSuggestions(false);
    setHighlightedIndex(-1);

    // Call onSelect to set the complete exercise data
    // This will update category, exerciseId, and exerciseName all at once
    onSelect(exercise);

    // Blur the input to prevent dropdown from reopening
    if (inputRef.current) {
      inputRef.current.blur();
    }

    pussy();

    // Reset the flag after a short delay
    setTimeout(() => {
      justSelectedRef.current = false;
    }, 200);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        console.log(value, filteredSuggestions[0]);

        if (filteredSuggestions.length && filteredSuggestions[0].name === value) {
          handleSuggestionClick(filteredSuggestions[0]);
        }
        // Log shows but on enter doesnt select preset but create custom workout on exact name match with autosuggest
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle blur - detect category and finalize exercise selection
  const handleBlur = () => {
    // Skip if we just selected from dropdown (to prevent overwriting the selection)
    if (justSelectedRef.current) {
      return;
    }

    if (value.trim().length > 0) {
      // Check if this is a preset exercise
      const presetExercise = uniqueExercises.find(
        (ex) => ex.isPreset && normalize(ex.name) === normalize(value),
      );

      if (presetExercise) {
        // It's a preset - call onSelect with the preset data
        onSelect(presetExercise);
      } else {
        // It's a custom exercise - detect category
        const detectedCategory = detectCategoryFromName(value);
        onSelect({
          name: value,
          id: value,
          isPreset: false,
          category: detectedCategory || `custom_${Date.now()}`,
        });
      }
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // Only delay if dropdown is showing (to allow mousedown to fire)
          // Otherwise blur immediately to ensure data is saved
          if (showSuggestions) {
            setTimeout(() => {
              handleBlur();
              setShowSuggestions(false);
              setHighlightedIndex(-1);
            }, 150);
          } else {
            handleBlur();
            setShowSuggestions(false);
            setHighlightedIndex(-1);
          }
        }}
        onFocus={() => {
          if (value.trim().length > 0) {
            const normalizedInput = normalize(value);
            const filtered = uniqueExercises.filter((ex) => {
              const normalizedName = normalize(ex.name);
              const wordsMatch = ex.name
                .toLowerCase()
                .split(/\s+/)
                .some((word) => word.startsWith(value.toLowerCase()));
              return (
                normalizedName.includes(normalizedInput) ||
                ex.name.toLowerCase().includes(value.toLowerCase()) ||
                wordsMatch
              );
            });
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
            setHighlightedIndex(-1);
          }
        }}
        className={className}
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={disabled}
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((exercise, index) => (
            <div
              key={`${exercise.id}-${index}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionClick(exercise);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                index === highlightedIndex ? 'bg-blue-200' : 'hover:bg-blue-100'
              }`}
            >
              <span className="text-gray-800">{exercise.name}</span>
              {exercise.isPreset ? (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Preset</span>
              ) : (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Custom</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No matches found */}
      {showSuggestions &&
        value.trim().length > 0 &&
        filteredSuggestions.length === 0 &&
        (() => {
          const detectedCategory = detectCategoryFromName(value);
          return (
            <div className="absolute z-[100] w-full mt-1 bg-white border border-green-300 rounded-lg shadow-lg px-4 py-3">
              <div className="flex items-start gap-2">
                <span className="text-green-600 text-lg">✓</span>
                <div>
                  <p className="text-gray-800 font-medium text-sm">Creating new custom exercise:</p>
                  <p className="text-green-700 font-bold">"{value}"</p>
                  {detectedCategory && (
                    <p className="text-blue-600 text-xs mt-1">
                      🏷️ Auto-detected category: {detectedCategory}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Click anywhere to confirm or keep typing to modify
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

export default ExerciseAutocomplete;

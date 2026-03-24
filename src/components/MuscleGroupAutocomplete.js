import { useState, useEffect, useRef } from 'react';

/**
 * Autocomplete input for custom muscle group names
 * Shows suggestions from previously used custom muscle groups
 */
function MuscleGroupAutocomplete({
  value,
  onChange,
  previousMuscleGroups = [],
  placeholder = "Enter workout name",
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const wrapperRef = useRef(null);

  console.log('MuscleGroupAutocomplete - previousMuscleGroups:', previousMuscleGroups);

  // Normalize string for better matching
  const normalize = (str) => {
    return str.toLowerCase().replace(/[\s-_]/g, '');
  };

  // Handle input change
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.trim().length > 0) {
      const normalizedInput = normalize(inputValue);

      // Filter suggestions based on input
      const filtered = previousMuscleGroups.filter(muscleGroup => {
        const normalizedName = normalize(muscleGroup);

        // Match if normalized name includes the input or any word starts with input
        const wordsMatch = muscleGroup.toLowerCase().split(/\s+/).some(word =>
          word.startsWith(inputValue.toLowerCase())
        );

        return normalizedName.includes(normalizedInput) ||
               muscleGroup.toLowerCase().includes(inputValue.toLowerCase()) ||
               wordsMatch;
      });

      console.log('Filtered muscle groups:', filtered, 'from input:', inputValue);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (muscleGroup) => {
    onChange(muscleGroup);
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
          if (value.trim().length > 0 && previousMuscleGroups.length > 0) {
            const normalizedInput = normalize(value);
            const filtered = previousMuscleGroups.filter(muscleGroup => {
              const normalizedName = normalize(muscleGroup);
              const wordsMatch = muscleGroup.toLowerCase().split(/\s+/).some(word =>
                word.startsWith(value.toLowerCase())
              );
              return normalizedName.includes(normalizedInput) ||
                     muscleGroup.toLowerCase().includes(value.toLowerCase()) ||
                     wordsMatch;
            });
            setFilteredSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
          }
        }}
        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoComplete="off"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((muscleGroup, index) => (
            <div
              key={`${muscleGroup}-${index}`}
              onClick={() => handleSuggestionClick(muscleGroup)}
              className="px-4 py-2 cursor-pointer hover:bg-blue-100 flex items-center justify-between"
            >
              <span className="text-gray-800">{muscleGroup}</span>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                Previous
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MuscleGroupAutocomplete;

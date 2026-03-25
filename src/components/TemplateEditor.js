import { useState, useEffect } from 'react';
import DropDown from '../DropDown';
import MuscleGroupAutocomplete from './MuscleGroupAutocomplete';
import TemplateExercisePicker from './TemplateExercisePicker';
import { MUSCLE_GROUP_OPTIONS, SET_RANGE_OPTIONS } from '../constants';

const ICON_OPTIONS = [
  '💪', '🏋️', '🔥', '⚡', '🎯', '💥', '🚀', '🦾', '⭐', '🏆',
  '💯', '🎪', '🌟', '✨', '🔱', '⚔️', '🛡️', '🏅', '🥇', '📈'
];

const TAG_SUGGESTIONS = [
  'PPL', 'Upper/Lower', 'Full Body', 'Beginner', 'Intermediate', 'Advanced',
  'Strength', 'Hypertrophy', 'Power', 'Endurance', 'Push', 'Pull', 'Legs',
  'Quick', 'Long', 'Home', 'Gym'
];

function TemplateEditor({ template, onSave, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💪');
  const [category, setCategory] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [customMuscleGroupName, setCustomMuscleGroupName] = useState('');
  const [numberOfSets, setNumberOfSets] = useState(null);
  const [customSetCount, setCustomSetCount] = useState('');
  const [customRepCount, setCustomRepCount] = useState('');
  const [exercises, setExercises] = useState([]);
  const [includeCardio, setIncludeCardio] = useState(false);
  const [cardioAtTop, setCardioAtTop] = useState(false);
  const [includeAbs, setIncludeAbs] = useState(false);
  const [absAtTop, setAbsAtTop] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Load template data if editing
  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setDescription(template.description || '');
      setIcon(template.icon || '💪');
      setCategory(template.category || '');
      setSelectedMuscleGroup(template.muscleGroup || null);
      setCustomMuscleGroupName(template.customMuscleGroupName || '');
      setNumberOfSets(template.numberOfSets || null);
      setCustomSetCount(template.customSetCount?.toString() || '');
      setCustomRepCount(template.customRepCount?.toString() || '');
      setExercises(template.exercises || []);
      setIncludeCardio(template.includeCardio || false);
      setCardioAtTop(template.cardioAtTop || false);
      setIncludeAbs(template.includeAbs || false);
      setAbsAtTop(template.absAtTop || false);
      setTags(template.tags || []);
      setIsFavorite(template.isFavorite || false);
    }
  }, [template]);

  // Auto-load default exercises when muscle group is selected (only if empty)
  useEffect(() => {
    // Only auto-load if we're creating a new template (not editing)
    if (!template && selectedMuscleGroup && selectedMuscleGroup !== 'custom' && exercises.length === 0) {
      // Don't auto-populate, let user decide to use defaults or custom
    }
  }, [selectedMuscleGroup, template]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleExercisesChange = (newExercises) => {
    setExercises(newExercises);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (!selectedMuscleGroup) {
      alert('Please select a muscle group');
      return;
    }

    if (selectedMuscleGroup === 'custom' && !customMuscleGroupName.trim()) {
      alert('Please enter a custom muscle group name');
      return;
    }

    // Clean up exercises - remove temporary fields and ensure proper structure
    const cleanedExercises = exercises.map(ex => ({
      category: ex.category,
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      detectedCategory: ex.detectedCategory,
    })).filter(ex => ex.category && ex.exerciseId); // Only include exercises that have both

    const templateData = {
      name: name.trim(),
      description: description.trim() || '',
      icon: icon || '💪',
      category: category || '',
      muscleGroup: selectedMuscleGroup,
      customMuscleGroupName: selectedMuscleGroup === 'custom' ? customMuscleGroupName.trim() : '',
      numberOfSets: numberOfSets || null,
      customSetCount: customSetCount ? parseInt(customSetCount) : null,
      customRepCount: customRepCount ? parseInt(customRepCount) : null,
      exercises: cleanedExercises,
      includeCardio: includeCardio || false,
      cardioAtTop: cardioAtTop || false,
      includeAbs: includeAbs || false,
      absAtTop: absAtTop || false,
      tags: tags || [],
      isFavorite: isFavorite || false,
      updatedAt: new Date().toISOString(),
    };

    // Remove any undefined values (Firestore doesn't allow them)
    Object.keys(templateData).forEach(key => {
      if (templateData[key] === undefined) {
        delete templateData[key];
      }
    });

    console.log('Saving template data:', templateData);
    console.log('Cleaned exercises:', cleanedExercises);
    onSave(templateData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info Card */}
      <div className="bg-sky-50 rounded-2xl p-5 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h2>

        <div className="space-y-3">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., PPL - Push Day, Upper Body Power"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template's focus..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Icon and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Icon Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <div className="flex flex-wrap gap-1">
                {ICON_OPTIONS.map((iconOption) => (
                  <button
                    key={iconOption}
                    type="button"
                    onClick={() => setIcon(iconOption)}
                    className={`text-2xl p-1.5 rounded-lg transition-all ${
                      icon === iconOption
                        ? 'bg-blue-500 scale-110 shadow-md'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {iconOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (optional)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Hypertrophy, Strength, PPL"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Favorite Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFavorite"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isFavorite" className="text-sm font-medium text-gray-700">
              Mark as favorite ⭐
            </label>
          </div>
        </div>
      </div>

      {/* Workout Configuration Card */}
      <div className="bg-sky-50 rounded-2xl p-5 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Workout Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Muscle Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Muscle Group *
            </label>
            <DropDown
              options={MUSCLE_GROUP_OPTIONS}
              value={selectedMuscleGroup}
              onChange={setSelectedMuscleGroup}
            />
            {selectedMuscleGroup === 'custom' && (
              <div className="mt-2">
                <MuscleGroupAutocomplete
                  value={customMuscleGroupName}
                  onChange={setCustomMuscleGroupName}
                  previousMuscleGroups={[]}
                />
              </div>
            )}
          </div>

          {/* Set Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set × Rep Range
            </label>
            <DropDown
              options={SET_RANGE_OPTIONS}
              value={numberOfSets}
              onChange={setNumberOfSets}
            />
            {numberOfSets === 'custom' && (
              <div className="mt-2 space-y-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={customSetCount}
                  onChange={(e) => setCustomSetCount(e.target.value)}
                  placeholder="Number of sets"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={customRepCount}
                  onChange={(e) => setCustomRepCount(e.target.value)}
                  placeholder="Target reps (optional)"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exercises Card */}
      {selectedMuscleGroup && (
        <div className="bg-sky-50 rounded-2xl p-6 shadow-lg">
          <TemplateExercisePicker
            muscleGroup={selectedMuscleGroup === 'custom' ? null : selectedMuscleGroup}
            exercises={exercises}
            onChange={handleExercisesChange}
          />
        </div>
      )}

      {/* Optional Sections Card */}
      <div className="bg-sky-50 rounded-2xl p-5 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Optional Sections</h2>

        <div className="space-y-3">
          {/* Cardio */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeCardio"
                checked={includeCardio}
                onChange={(e) => setIncludeCardio(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="includeCardio" className="text-sm font-medium text-gray-700">
                Include Cardio Section
              </label>
            </div>
            {includeCardio && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Position:</label>
                <select
                  value={cardioAtTop ? 'top' : 'bottom'}
                  onChange={(e) => setCardioAtTop(e.target.value === 'top')}
                  className="px-3 py-1 rounded-md border border-gray-300 text-sm"
                >
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            )}
          </div>

          {/* Abs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeAbs"
                checked={includeAbs}
                onChange={(e) => setIncludeAbs(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="includeAbs" className="text-sm font-medium text-gray-700">
                Include Abs/Core Section
              </label>
            </div>
            {includeAbs && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Position:</label>
                <select
                  value={absAtTop ? 'top' : 'bottom'}
                  onChange={(e) => setAbsAtTop(e.target.value === 'top')}
                  className="px-3 py-1 rounded-md border border-gray-300 text-sm"
                >
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tags Card */}
      <div className="bg-sky-50 rounded-2xl p-5 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Tags</h2>

        <div className="space-y-3">
          {/* Tag Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add a tag..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
            >
              Add
            </button>
          </div>

          {/* Suggested Tags */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Suggested tags:</p>
            <div className="flex flex-wrap gap-2">
              {TAG_SUGGESTIONS.filter(tag => !tags.includes(tag)).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTags([...tags, tag])}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Current Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-200 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-400 transition-all shadow-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          {template ? 'Update Template' : 'Create Template'}
        </button>
      </div>
    </form>
  );
}

export default TemplateEditor;

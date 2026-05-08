import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const TAG_SUGGESTIONS = [
  'PPL', 'Upper/Lower', 'Full Body', 'Beginner', 'Intermediate', 'Advanced',
  'Strength', 'Hypertrophy', 'Power', 'Endurance', 'Push', 'Pull', 'Legs',
  'Quick', 'Long', 'Home', 'Gym', 'Favorite'
];

function SaveAsTemplateModal({ isOpen, onClose, onSave, defaultName = '', workoutData }) {
  const { theme } = useTheme();
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hypertrophy');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a template name');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        category: category || 'Hypertrophy',
        tags,
        isFavorite,
      });
      // Reset form on success
      setName('');
      setDescription('');
      setCategory('Hypertrophy');
      setTags([]);
      setIsFavorite(false);
    } catch (error) {
      console.error('Error in modal save:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const exerciseCount = workoutData?.exerciseData
    ? Object.keys(workoutData.exerciseData).filter(key => {
        const exercise = workoutData.exerciseData[key];
        return exercise?.exerciseName?.trim();
      }).length
    : 0;

  return (
    <div
      className="fixed inset-0 backdrop-blur-md bg-black/30 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`${theme.cardBg} rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 ${theme.cardBg} border-b ${theme.cardBorder} p-6 pb-4 z-10`}>
          <h2 className={`text-2xl font-bold ${theme.cardText}`}>Save as Template</h2>
          <p className={`text-sm ${theme.cardTextSecondary} mt-1`}>
            Create a reusable template from this workout
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className={`block text-sm font-medium ${theme.cardText} mb-2`}>
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Chest Day, PPL - Push"
              className={`w-full px-4 py-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} focus:outline-none ${theme.inputFocus}`}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium ${theme.cardText} mb-2`}>
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template..."
              rows={2}
              className={`w-full px-4 py-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} focus:outline-none ${theme.inputFocus}`}
            />
          </div>

          {/* Category */}
          <div>
            <label className={`block text-sm font-medium ${theme.cardText} mb-2`}>
              Category (optional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Hypertrophy, Strength, PPL"
              className={`w-full px-4 py-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} focus:outline-none ${theme.inputFocus}`}
            />
          </div>

          {/* Tags */}
          <div>
            <label className={`block text-sm font-medium ${theme.cardText} mb-2`}>
              Tags (optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag..."
                className={`flex-1 px-4 py-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} focus:outline-none ${theme.inputFocus}`}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className={`px-4 py-2 rounded-lg ${theme.btnSecondary} ${theme.btnSecondaryText} font-medium`}
              >
                Add
              </button>
            </div>

            {/* Suggested tags */}
            <div className="mb-2">
              <p className={`text-xs ${theme.cardTextSecondary} mb-2`}>Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {TAG_SUGGESTIONS.filter(tag => !tags.includes(tag)).slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTags([...tags, tag])}
                    className={`px-2 py-1 rounded-full text-xs ${theme.cardBgSecondary} ${theme.cardTextSecondary} hover:opacity-80 transition-opacity`}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Current tags */}
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

          {/* Favorite toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="templateFavorite"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="templateFavorite" className={`text-sm font-medium ${theme.cardText}`}>
              Mark as favorite
            </label>
          </div>

          {/* Exercise preview */}
          {workoutData && (
            <div className={`${theme.cardBgSecondary} rounded-lg p-4`}>
              <p className={`text-sm font-medium ${theme.cardText} mb-2`}>
                This template will include:
              </p>
              <ul className={`text-sm ${theme.cardTextSecondary} space-y-1`}>
                <li>{exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}</li>
                <li>Muscle Group: {workoutData.muscleGroup || workoutData.customMuscleGroupName || 'Custom'}</li>
                <li>Sets: {workoutData.numberOfSets || workoutData.customSetCount || 'N/A'}</li>
                {workoutData.customRepCount && <li>Target Reps: {workoutData.customRepCount}</li>}
                {workoutData.showCardio && <li>Includes cardio section</li>}
                {workoutData.showAbs && <li>Includes abs section</li>}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`sticky bottom-0 ${theme.cardBg} border-t ${theme.cardBorder} p-6 pt-4 flex gap-3 justify-end`}>
          <button
            onClick={onClose}
            disabled={isSaving}
            className={`px-6 py-2 rounded-lg ${theme.btnSecondary} ${theme.btnSecondaryText} font-medium transition-colors disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className={`px-6 py-2 rounded-lg ${theme.btnPrimary} ${theme.btnPrimaryText} font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveAsTemplateModal;

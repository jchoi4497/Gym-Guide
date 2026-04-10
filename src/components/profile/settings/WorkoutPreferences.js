import { useState, useEffect } from 'react';

function WorkoutPreferences({ settings, onUpdate }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state when settings prop updates
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (field, value) => {
    setLocalSettings({ ...localSettings, [field]: parseInt(value) });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(localSettings);
      setHasChanges(false);
    } catch (error) {
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Workout Preferences</h2>
      <p className="text-sm text-gray-600 mb-6">
        Set your default values for new workouts. You can always adjust these when creating a workout.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Number of Sets</label>
          <select
            value={localSettings.defaultSets}
            onChange={(e) => handleChange('defaultSets', e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={3}>3 sets</option>
            <option value={4}>4 sets</option>
            <option value={5}>5 sets</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Reps per Set</label>
          <select
            value={localSettings.defaultReps}
            onChange={(e) => handleChange('defaultReps', e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={6}>6 reps</option>
            <option value={8}>8 reps</option>
            <option value={10}>10 reps</option>
            <option value={12}>12 reps</option>
            <option value={15}>15 reps</option>
          </select>
        </div>

        {hasChanges && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutPreferences;

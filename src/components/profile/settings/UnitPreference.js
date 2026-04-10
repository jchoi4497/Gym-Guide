import { useState, useEffect } from 'react';

function UnitPreference({ settings, onUpdate }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state when settings prop updates
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (value) => {
    setLocalSettings({ ...localSettings, weightUnit: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(localSettings);
      setHasChanges(false);
    } catch (error) {
      alert('Failed to save unit preference. Please try again.');
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
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Unit Preferences</h2>
      <p className="text-sm text-gray-600 mb-6">
        Choose your preferred unit for tracking weights.
      </p>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => handleChange('lbs')}
            className={`flex-1 sm:flex-none px-8 py-3 rounded-lg font-semibold transition-all ${
              localSettings.weightUnit === 'lbs'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pounds (lbs)
          </button>
          <button
            onClick={() => handleChange('kg')}
            className={`flex-1 sm:flex-none px-8 py-3 rounded-lg font-semibold transition-all ${
              localSettings.weightUnit === 'kg'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Kilograms (kg)
          </button>
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

export default UnitPreference;

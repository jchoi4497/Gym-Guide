import { useState } from 'react';
import { MUSCLE_GROUP_OPTIONS, SET_RANGE_OPTIONS } from '../../config/constants';
import { useTheme } from '../../contexts/ThemeContext';

function AddWorkoutWizard({ templates, initialData, onComplete, onCancel }) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(
    initialData?.templateId ? templates.find(t => t.id === initialData.templateId) : null
  );
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(
    initialData?.muscleGroup || null
  );
  const [customWorkoutName, setCustomWorkoutName] = useState(
    initialData?.muscleGroup && !initialData?.templateId ? initialData.muscleGroup : ''
  );
  const [numberOfSets, setNumberOfSets] = useState(
    initialData?.numberOfSets || (initialData?.customSetCount ? 'custom' : null)
  );
  const [customSetCount, setCustomSetCount] = useState(
    initialData?.customSetCount?.toString() || ''
  );
  const [customRepCount, setCustomRepCount] = useState(
    initialData?.customRepCount?.toString() || ''
  );
  const [label, setLabel] = useState(initialData?.label || '');

  const handleTemplateSelect = (e) => {
    const value = e.target.value;
    if (!value) return;

    if (value === 'custom') {
      // Create custom workout - show input inline
      setSelectedTemplate(null);
      setSelectedMuscleGroup('custom');
      setCustomWorkoutName('');
    } else if (value.startsWith('preset-')) {
      // Preset muscle group selected
      const muscleGroup = value.replace('preset-', '');
      setSelectedTemplate(null);
      setSelectedMuscleGroup(muscleGroup);
      // Only auto-advance if not editing
      if (!initialData) {
        setStep(2); // Go to set/rep selection
      }
    } else {
      // Saved template selected
      const template = templates.find(t => t.id === value);
      setSelectedTemplate(template);

      // Set muscle group - if template has customMuscleGroupName, use it as customWorkoutName
      if (template.customMuscleGroupName) {
        setSelectedMuscleGroup('custom');
        setCustomWorkoutName(template.customMuscleGroupName);
      } else {
        setSelectedMuscleGroup(template.muscleGroup);
        setCustomWorkoutName('');
      }

      // Set sets/reps - handle both preset and custom
      if (template.numberOfSets && template.numberOfSets !== 'custom') {
        // Template has preset range (3, 4, 5, etc.)
        setNumberOfSets(template.numberOfSets);
        setCustomSetCount(template.customSetCount?.toString() || template.numberOfSets?.toString() || '');
        setCustomRepCount(template.customRepCount?.toString() || '');
      } else {
        // Template uses custom sets/reps
        setNumberOfSets('custom');
        setCustomSetCount(template.customSetCount?.toString() || '');
        setCustomRepCount(template.customRepCount?.toString() || '');
      }

      // Only auto-advance if not editing
      if (!initialData) {
        setStep(3); // Skip to last step (review & confirm)
      }
    }
  };

  const handleSetRangeSelect = (e) => {
    const value = e.target.value;
    if (!value) return;
    setNumberOfSets(value);
    // Only auto-advance if not editing
    if (value !== 'custom' && !initialData) {
      setStep(3);
    }
  };

  const handleComplete = () => {
    if (!canComplete()) return;

    // Get rep count from preset option if applicable
    let repCount = null;
    if (numberOfSets === 'custom') {
      repCount = customRepCount ? parseInt(customRepCount) : null;
    } else if (numberOfSets) {
      // Find the preset option to get its reps value
      const presetOption = SET_RANGE_OPTIONS.find(opt => opt.value === numberOfSets);
      repCount = presetOption?.reps || null;
    }

    const workoutData = {
      templateId: selectedTemplate?.id || null,
      templateName: selectedTemplate?.name || null,
      muscleGroup: selectedMuscleGroup === 'custom' ? customWorkoutName.trim() : selectedMuscleGroup,
      numberOfSets: numberOfSets !== 'custom' ? parseInt(numberOfSets) : null,
      customSetCount: (numberOfSets === 'custom' || customSetCount) ? parseInt(customSetCount) : null,
      customRepCount: repCount,
      label: label.trim() || null,
      exercises: selectedTemplate?.exercises || []
    };
    onComplete(workoutData);
  };

  // Validation for completion
  const canComplete = () => {
    // Must have muscle group selection
    if (!selectedMuscleGroup) return false;

    // If custom, must have a name
    if (selectedMuscleGroup === 'custom' && !customWorkoutName.trim()) return false;

    // Must have sets configured
    if (numberOfSets === 'custom') {
      // Custom sets need valid count
      return customSetCount && parseInt(customSetCount) > 0;
    } else {
      // Preset range selected
      return !!numberOfSets;
    }
  };

  return (
    <div className="space-y-3 min-h-[200px]">
      {/* Step 1: Select Template or Preset */}
      {step === 1 && (
        <div className="min-h-[200px]">
          <h3 className={`text-sm font-bold ${theme.cardText} mb-2`}>Step 1: Quick Start</h3>
          <select
            onChange={handleTemplateSelect}
            value={
              selectedTemplate
                ? selectedTemplate.id
                : selectedMuscleGroup === 'custom'
                  ? 'custom'
                  : selectedMuscleGroup
                    ? `preset-${selectedMuscleGroup}`
                    : ''
            }
            className={`w-full px-3 py-2 text-sm rounded-lg border ${theme.inputBorder} focus:outline-none focus:ring-2 focus:ring-slate-500 ${theme.inputBg} mb-3`}
          >
            <option value="">Select option...</option>

            {/* Saved Templates */}
            {templates.length > 0 && (
              <optgroup label="My Templates">
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.muscleGroup || t.customMuscleGroupName})
                  </option>
                ))}
              </optgroup>
            )}

            {/* Preset Muscle Groups */}
            <optgroup label="Preset Workouts">
              {MUSCLE_GROUP_OPTIONS.filter(opt => opt.value !== 'custom').map(opt => (
                <option key={opt.value} value={`preset-${opt.value}`}>
                  {opt.label}
                </option>
              ))}
            </optgroup>

            {/* Custom Option */}
            <optgroup label="Other">
              <option value="custom">Create Custom Workout</option>
            </optgroup>
          </select>

          {/* Custom Workout Name Input - shown inline only if user explicitly selected "Create Custom Workout" */}
          {selectedMuscleGroup === 'custom' && !selectedTemplate && (
            <div className="mb-4">
              <input
                type="text"
                value={customWorkoutName}
                onChange={(e) => setCustomWorkoutName(e.target.value)}
                placeholder="Enter workout name (e.g., Push Day, Upper Body)"
                className={`w-full px-3 py-2 text-sm rounded-lg border ${theme.inputBorder} focus:outline-none focus:ring-2 focus:ring-slate-500 ${theme.inputBg}`}
                autoFocus
              />
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              onClick={onCancel}
              className={`${theme.cardTextSecondary} hover:opacity-100 text-sm font-semibold transition-colors`}
            >
              Cancel
            </button>
            {(selectedMuscleGroup === 'custom' && !selectedTemplate) && (
              <button
                onClick={() => {
                  if (customWorkoutName.trim()) {
                    setStep(2);
                  }
                }}
                disabled={!customWorkoutName.trim()}
                className={`${theme.cardText} hover:opacity-100 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Next →
              </button>
            )}
            {(initialData && (selectedTemplate || (selectedMuscleGroup && selectedMuscleGroup !== 'custom'))) && (
              <button
                onClick={() => setStep(2)}
                className={`${theme.cardText} hover:opacity-100 text-sm font-semibold transition-colors`}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Set Range */}
      {step === 2 && (
        <div className="min-h-[250px]">
          <h3 className={`text-sm font-bold ${theme.cardText} mb-2`}>Step 2: Set × Rep Range</h3>
          <select
            value={numberOfSets || ''}
            onChange={handleSetRangeSelect}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${theme.inputBorder} focus:outline-none focus:ring-2 focus:ring-slate-500 ${theme.inputBg} mb-3`}
          >
            <option value="">Select range...</option>
            {SET_RANGE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {numberOfSets === 'custom' && (
            <div className="space-y-2 mb-4">
              <input
                type="number"
                min="1"
                max="10"
                value={customSetCount}
                onChange={(e) => setCustomSetCount(e.target.value)}
                placeholder="Sets (e.g., 4)"
                className={`w-full px-3 py-2 text-sm rounded-lg border ${theme.inputBorder} focus:outline-none focus:ring-2 focus:ring-slate-500 ${theme.inputBg}`}
              />
              <input
                type="number"
                min="1"
                max="50"
                value={customRepCount}
                onChange={(e) => setCustomRepCount(e.target.value)}
                placeholder="Reps (e.g., 10)"
                className={`w-full px-3 py-2 text-sm rounded-lg border ${theme.inputBorder} focus:outline-none focus:ring-2 focus:ring-slate-500 ${theme.inputBg}`}
              />
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(1)}
              className={`${theme.cardText} hover:opacity-100 text-sm font-semibold transition-colors`}
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!numberOfSets || (numberOfSets === 'custom' && (!customSetCount || parseInt(customSetCount) <= 0))}
              className={`${theme.cardText} hover:opacity-100 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Label & Confirm */}
      {step === 3 && (
        <div className="min-h-[250px]">
          <h3 className={`text-sm font-bold ${theme.cardText} mb-3`}>Review & Confirm</h3>

          {/* Workout Summary */}
          <div className={`${theme.cardBgSecondary} rounded-lg p-4 mb-3`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`font-bold text-base ${theme.cardText} mb-1`}>
                  {selectedMuscleGroup === 'custom'
                    ? (customWorkoutName.trim() || 'Custom Workout')
                    : (MUSCLE_GROUP_OPTIONS.find(opt => opt.value === selectedMuscleGroup)?.label || selectedMuscleGroup || 'Workout')}
                </p>
                <p className={`text-sm ${theme.cardTextSecondary}`}>
                  {numberOfSets && numberOfSets !== 'custom'
                    ? `${numberOfSets} sets × ${SET_RANGE_OPTIONS.find(opt => opt.value === numberOfSets)?.reps || '8-12'} reps`
                    : (customSetCount && parseInt(customSetCount) > 0)
                      ? `${customSetCount} sets × ${customRepCount || '8-12'} reps`
                      : 'Sets/reps not configured'}
                </p>
                {selectedTemplate && (
                  <p className={`text-xs ${theme.cardText} font-semibold mt-2 opacity-80`}>
                    📋 From: {selectedTemplate.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Optional Label Input */}
          <div className="mb-4">
            <label className={`block text-xs font-medium ${theme.cardText} mb-1`}>
              Session Label (Optional)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Morning Session, Heavy Day"
              className={`w-full px-3 py-2 text-sm rounded-lg border ${theme.inputBorder} focus:outline-none focus:ring-2 focus:ring-slate-500 ${theme.inputBg}`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-3">
            <button
              onClick={() => setStep(2)}
              className={`${theme.cardText} hover:opacity-100 text-sm font-semibold transition-colors`}
            >
              ← Back
            </button>
            <button
              onClick={handleComplete}
              disabled={!canComplete()}
              className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-bold rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] border-t border-l border-green-600 border-b-2 border-r-2 border-b-green-900 border-r-green-900 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {initialData ? 'Save' : 'Add Workout'}
            </button>
          </div>

          {/* Validation Message */}
          {!canComplete() && (
            <p className="text-xs text-red-600 mt-2 text-center">
              Please complete all required fields
            </p>
          )}
        </div>
      )}

      {/* Fallback - should never show */}
      {step !== 1 && step !== 2 && step !== 3 && (
        <div className="text-center p-4">
          <p className="text-red-600 text-sm">Error: Invalid step ({step})</p>
          <button
            onClick={() => setStep(1)}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-semibold"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

export default AddWorkoutWizard;

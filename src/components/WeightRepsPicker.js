import { useState, useEffect } from 'react';
import DrumPicker from './DrumPicker';
import NumPad from './NumPad';

function WeightRepsPicker({
  isOpen,
  onClose,
  weight,
  reps,
  onSave,
  exerciseType = 'weight', // 'weight', 'bodyweight', 'timed', 'cardio'
}) {
  const [selectedWeight, setSelectedWeight] = useState(weight || '');
  const [selectedReps, setSelectedReps] = useState(reps || '');
  const [inputMode, setInputMode] = useState('scroll'); // 'scroll' or 'keypad'
  const [activeField, setActiveField] = useState('weight'); // 'weight' or 'reps'

  const ITEM_HEIGHT = 44; // Same as DrumPicker

  useEffect(() => {
    if (isOpen) {
      setSelectedWeight(weight || '');
      setSelectedReps(reps || '');
      // Set active field to weight if showing weight, otherwise reps
      setActiveField(exerciseType === 'weight' ? 'weight' : 'reps');
    }
  }, [isOpen, weight, reps, exerciseType]);

  const handleDone = () => {
    onSave(selectedWeight, selectedReps);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  // Determine what to show based on exercise type
  const showWeight = exerciseType === 'weight';

  // Determine reps label and config
  let repsLabel = 'Reps';
  let repsUnit = '';
  let repsMax = 100;
  let repsStep = 1;

  if (exerciseType === 'timed') {
    repsLabel = 'Seconds';
    repsUnit = ' sec';
    repsMax = 300; // 5 minutes in seconds
  } else if (exerciseType === 'cardio') {
    repsLabel = 'Minutes';
    repsUnit = ' min';
    repsMax = 180; // 3 hours in minutes
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] transition-opacity"
        style={{
          background: 'transparent',
          backgroundColor: 'transparent'
        }}
        onClick={handleCancel}
      />

      {/* Modal - slides up from bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 rounded-t-3xl shadow-2xl z-[100] animate-slide-up overflow-hidden"
        style={{
          maxHeight: '70vh',
          background: 'transparent',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-3xl">
          <button
            onClick={handleCancel}
            className="text-blue-500 font-medium text-lg"
          >
            Cancel
          </button>
          <h3 className="text-lg font-semibold text-gray-800">Select Value</h3>
          <button
            onClick={handleDone}
            className="text-blue-500 font-semibold text-lg"
          >
            Done
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setInputMode('scroll')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              inputMode === 'scroll'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            Scroll
          </button>
          <button
            onClick={() => setInputMode('keypad')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              inputMode === 'keypad'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            Keypad
          </button>
        </div>

        {/* Pickers - fixed height to prevent jumping */}
        <div className="py-4 px-4 bg-white" style={{ minHeight: '420px' }}>
          {inputMode === 'scroll' ? (
            <div className="relative flex items-center justify-center gap-8">
              {/* Combined highlight box - iPhone style - TRANSPARENT with slight blue */}
              <div
                className="absolute border-t-2 border-b-2 border-blue-500 pointer-events-none z-10"
                style={{
                  top: `${ITEM_HEIGHT * 3 + 28}px`, // Moved up one more row
                  height: `${ITEM_HEIGHT}px`,
                  left: showWeight ? '20px' : '50%',
                  right: '20px',
                  transform: showWeight ? 'none' : 'translateX(-50%)',
                  width: showWeight ? 'calc(100% - 40px)' : '96px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)', // slight blue tint, 10% opacity
                }}
              />

              {showWeight && (
                <DrumPicker
                  value={parseFloat(selectedWeight) || 0}
                  onChange={(val) => setSelectedWeight(val.toString())}
                  min={0}
                  max={500}
                  step={0.5}
                  label="Weight (lbs)"
                  unit=""
                />
              )}

              <DrumPicker
                value={parseFloat(selectedReps) || 0}
                onChange={(val) => setSelectedReps(val.toString())}
                min={exerciseType === 'cardio' ? 0.1 : 1}
                max={repsMax}
                step={repsStep}
                label={repsLabel + (repsUnit ? ` (${repsUnit.trim()})` : '')}
                unit=""
              />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Input Fields */}
              <div className="flex items-center justify-center gap-3 mb-4 w-full">
                {showWeight && (
                  <div className="flex-1 max-w-[130px]">
                    <label className="text-xs text-gray-600 font-medium mb-1 block">Weight (lbs)</label>
                    <button
                      onClick={() => setActiveField('weight')}
                      className={`w-full px-3 py-2 rounded-lg text-lg font-semibold text-center transition-all min-h-[44px] ${
                        activeField === 'weight'
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                          : 'bg-gray-100 text-gray-900 border-2 border-transparent'
                      }`}
                    >
                      {selectedWeight || '\u00A0'}
                    </button>
                  </div>
                )}

                <div className="flex-1 max-w-[130px]">
                  <label className="text-xs text-gray-600 font-medium mb-1 block">{repsLabel}{repsUnit && ` (${repsUnit.trim()})`}</label>
                  <button
                    onClick={() => setActiveField('reps')}
                    className={`w-full px-3 py-2 rounded-lg text-lg font-semibold text-center transition-all min-h-[44px] ${
                      activeField === 'reps'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                        : 'bg-gray-100 text-gray-900 border-2 border-transparent'
                    }`}
                  >
                    {selectedReps || '\u00A0'}
                  </button>
                </div>
              </div>

              {/* Single NumPad */}
              <NumPad
                value={activeField === 'weight' ? selectedWeight : selectedReps}
                onChange={(val) => {
                  if (activeField === 'weight') {
                    setSelectedWeight(val);
                  } else {
                    setSelectedReps(val);
                  }
                }}
                allowDecimals={activeField === 'weight' || exerciseType === 'cardio'}
              />
            </div>
          )}
        </div>

        {/* Bottom safe area for iOS */}
        <div className="h-4 bg-white" />
      </div>
    </>
  );
}

export default WeightRepsPicker;

import { useState, useEffect } from 'react';
import DrumPicker from './DrumPicker';

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

  useEffect(() => {
    if (isOpen) {
      setSelectedWeight(weight || '');
      setSelectedReps(reps || '');
    }
  }, [isOpen, weight, reps]);

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
  const showReps = true; // Always show reps/duration/distance

  // Determine reps label and config
  let repsLabel = 'Reps';
  let repsMax = 50;
  let repsStep = 1;

  if (exerciseType === 'timed') {
    repsLabel = 'Seconds';
    repsMax = 300; // 5 minutes in seconds
  } else if (exerciseType === 'cardio') {
    repsLabel = 'Minutes';
    repsMax = 180; // 3 hours in minutes
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={handleCancel}
      />

      {/* Modal - slides up from bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 animate-slide-up"
        style={{
          maxHeight: '70vh',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
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

        {/* Pickers */}
        <div className="flex items-center justify-center gap-8 py-8 px-4">
          {showWeight && (
            <DrumPicker
              value={parseFloat(selectedWeight) || 0}
              onChange={(val) => setSelectedWeight(val.toString())}
              min={0}
              max={500}
              step={0.5}
              label="Weight"
              unit=" lbs"
            />
          )}

          <DrumPicker
            value={parseFloat(selectedReps) || 0}
            onChange={(val) => setSelectedReps(val.toString())}
            min={exerciseType === 'cardio' ? 0.1 : 1}
            max={repsMax}
            step={repsStep}
            label={repsLabel}
            unit={exerciseType === 'cardio' ? ' min' : ''}
          />
        </div>

        {/* Bottom safe area for iOS */}
        <div className="h-8" />
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default WeightRepsPicker;

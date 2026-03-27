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
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedWeight(weight || '');
      setSelectedReps(reps || '');
      // Prevent background scrolling when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Restore scrolling when modal closes
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen, weight, reps]);

  const handleDone = () => {
    onSave(selectedWeight, selectedReps);
    onClose();
  };

  const handleCancel = () => {
    // Save current values before closing
    onSave(selectedWeight, selectedReps);
    onClose();
  };

  // Don't show picker on desktop at all
  if (!isOpen || !isMobile) return null;

  // Determine what to show based on exercise type
  const showWeight = exerciseType === 'weight';
  const showReps = true; // Always show reps/duration/distance

  // Determine reps label and config
  let repsLabel = 'Reps';
  let repsMax = 100;
  let repsStep = 1;

  if (exerciseType === 'timed') {
    repsLabel = 'Seconds';
    repsMax = 300; // 5 minutes in seconds
  } else if (exerciseType === 'cardio') {
    repsLabel = 'Minutes';
    repsMax = 180; // 3 hours in minutes
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleCancel}
      />

      {/* Modal - slides up from bottom */}
      <div
        className="relative w-full bg-white rounded-t-3xl shadow-2xl animate-slide-up"
        style={{
          maxHeight: '70vh',
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
    </div>
  );
}

export default WeightRepsPicker;

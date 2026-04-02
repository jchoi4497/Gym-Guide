import DropDown from '../DropDown';
import MuscleGroupAutocomplete from './MuscleGroupAutocomplete';
import { MUSCLE_GROUP_OPTIONS, SET_RANGE_OPTIONS } from '../constants';

/**
 * CustomWorkflowSection - Form for custom (Jonathan's Program) workflow
 * Muscle group and set count selection
 */
function CustomWorkflowSection({
  selectedMuscleGroup,
  numberOfSets,
  customMuscleGroupName,
  customSetCount,
  customRepCount,
  previousCustomMuscleGroups,
  workoutDate,
  onMuscleGroupSelect,
  onSetCountSelect,
  onCustomMuscleGroupChange,
  onCustomSetCountChange,
  onCustomRepCountChange,
  onWorkoutDateChange,
  onBackToChoice,
}) {
  return (
    <>
      <div className="mb-6 bg-blue-100 border-l-4 border-blue-500 p-4 rounded flex justify-between items-center">
        <p className="text-blue-800 font-semibold">
          📚 Following Jonathan's Program - Select your muscle group and I'll load my proven exercises
        </p>
        {!selectedMuscleGroup && (
          <button
            onClick={onBackToChoice}
            className="text-sm text-blue-700 hover:text-blue-900 underline font-semibold whitespace-nowrap ml-4"
          >
            ← Back to choices
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        {/* Step 1: Select Muscle Group */}
        <div className="bg-sky-50 rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Step 1: Select Muscle Group</h2>
          <DropDown
            options={MUSCLE_GROUP_OPTIONS}
            value={selectedMuscleGroup}
            onChange={onMuscleGroupSelect}
          />

          {selectedMuscleGroup === 'custom' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name your workout (e.g., "Push Day", "Upper Body")
              </label>
              <MuscleGroupAutocomplete
                value={customMuscleGroupName}
                onChange={onCustomMuscleGroupChange}
                previousMuscleGroups={previousCustomMuscleGroups}
              />
            </div>
          )}
        </div>

        {/* Step 2: Choose Set × Rep Range */}
        <div className="bg-sky-50 rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Step 2: Choose Set × Rep Range</h2>
          <DropDown
            options={SET_RANGE_OPTIONS}
            value={numberOfSets}
            onChange={onSetCountSelect}
          />

          {numberOfSets === 'custom' && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of sets per exercise
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={customSetCount}
                  onChange={(e) => onCustomSetCountChange(e.target.value)}
                  placeholder="e.g., 4"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target reps per set (optional)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={customRepCount}
                  onChange={(e) => onCustomRepCountChange(e.target.value)}
                  placeholder="e.g., 12"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Workout Date */}
        <div className="bg-sky-50 rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Step 3: Workout Date</h2>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select date for this workout
          </label>
          <input
            type="date"
            value={workoutDate}
            onChange={(e) => onWorkoutDateChange(e.target.value)}
            max={(() => {
              const today = new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const day = String(today.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            })()}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <p className="mt-2 text-xs text-gray-500 italic">
            Change this if you're adding a past workout
          </p>
        </div>
      </div>
    </>
  );
}

export default CustomWorkflowSection;

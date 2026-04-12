import { useNavigate } from 'react-router-dom';

function ScheduledWorkoutCard({ workout }) {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/Create', { state: { scheduledWorkout: workout } });
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-800">
            {workout.muscleGroup || 'Workout'}
          </h3>
          <p className="text-sm text-gray-600">
            {workout.customSetCount || workout.numberOfSets}x{workout.customRepCount || '8-12'}
          </p>
          {workout.label && (
            <p className="text-sm text-gray-500 italic">{workout.label}</p>
          )}
        </div>
        <button
          onClick={handleStart}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
        >
          Start
        </button>
      </div>
    </div>
  );
}

export default ScheduledWorkoutCard;

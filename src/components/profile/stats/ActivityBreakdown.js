import { MUSCLE_GROUP_OPTIONS } from '../../../config/constants';

function ActivityBreakdown({ stats }) {
  const getLabel = (value) =>
    MUSCLE_GROUP_OPTIONS.find((option) => option.value === value)?.label || value;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Activity Breakdown</h2>
      <div className="space-y-3">
        {Object.entries(stats.muscleGroupBreakdown)
          .sort(([, a], [, b]) => b - a)
          .map(([group, count]) => (
            <div key={group} className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">{getLabel(group)}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 sm:w-48 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${(count / stats.totalWorkouts) * 100}%` }}
                  ></div>
                </div>
                <span className="text-gray-600 font-semibold w-12 text-right">{count}</span>
              </div>
            </div>
          ))}
      </div>
      {stats.mostTrainedMuscleGroup && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">Most Trained: </span>
          <span className="font-bold text-blue-600">{getLabel(stats.mostTrainedMuscleGroup)}</span>
        </div>
      )}
    </div>
  );
}

export default ActivityBreakdown;

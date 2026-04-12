function SelectedDateDetails({ date, workouts }) {
  if (!date) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </h2>

      {workouts.length > 0 ? (
        <div className="space-y-3 mb-4">
          {workouts.map((workout, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-4">
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
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic mb-4">No workouts scheduled for this day</p>
      )}

      <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
        + Add Workout to This Day
      </button>
    </div>
  );
}

export default SelectedDateDetails;

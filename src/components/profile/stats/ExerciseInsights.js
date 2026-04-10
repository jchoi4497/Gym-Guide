function ExerciseInsights({ stats }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Exercise Insights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Total Exercises</div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalExercises}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Total Sets</div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalSets}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Custom Exercises</div>
          <div className="text-2xl font-bold text-purple-600">{stats.customExercisesCount}</div>
        </div>
        {stats.favoriteExercise && (
          <div>
            <div className="text-sm text-gray-600 mb-1">Favorite Exercise</div>
            <div className="text-lg font-bold text-blue-600 truncate">{stats.favoriteExercise}</div>
            <div className="text-xs text-gray-500">({stats.favoriteExerciseCount} times)</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExerciseInsights;

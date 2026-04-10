function MonthlyStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">This Month</h3>
        <div className="text-4xl font-bold text-blue-600">{stats.thisMonthWorkouts}</div>
        <div className="text-sm text-gray-500">workouts</div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Average per Week</h3>
        <div className="text-4xl font-bold text-green-600">{stats.avgWorkoutsPerWeek.toFixed(1)}</div>
        <div className="text-sm text-gray-500">workouts</div>
      </div>
    </div>
  );
}

export default MonthlyStats;

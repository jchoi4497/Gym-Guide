function StreakStats({ stats }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Streaks</h2>

      {/* Daily Streaks */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Daily Streaks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Current Streak</div>
            <div className="text-3xl font-bold text-blue-600">{stats.currentStreak} days</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Longest Streak</div>
            <div className="text-3xl font-bold text-green-600">{stats.longestStreak} days</div>
          </div>
        </div>
      </div>

      {/* Weekly Streaks */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Weekly Streaks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Current Streak</div>
            <div className="text-3xl font-bold text-purple-600">{stats.currentWeeklyStreak} weeks</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Longest Streak</div>
            <div className="text-3xl font-bold text-indigo-600">{stats.longestWeeklyStreak} weeks</div>
          </div>
        </div>
      </div>

      {/* Monthly Streaks */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Monthly Streaks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Current Streak</div>
            <div className="text-3xl font-bold text-orange-600">{stats.currentMonthlyStreak} months</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Longest Streak</div>
            <div className="text-3xl font-bold text-red-600">{stats.longestMonthlyStreak} months</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreakStats;

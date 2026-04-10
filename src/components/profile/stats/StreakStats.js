function StreakStats({ stats }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Streaks</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Current Streak</div>
          <div className="text-3xl font-bold text-blue-600">{stats.currentStreak} days</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Longest Streak</div>
          <div className="text-3xl font-bold text-green-600">{stats.longestStreak} days</div>
        </div>
      </div>
    </div>
  );
}

export default StreakStats;

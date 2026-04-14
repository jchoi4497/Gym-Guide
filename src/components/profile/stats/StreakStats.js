import { useTheme } from '../../../contexts/ThemeContext';

function StreakStats({ stats }) {
  const { theme } = useTheme();

  return (
    <div className={`${theme.cardBg} rounded-lg p-6`}>
      <h2 className={`text-2xl font-bold ${theme.headerText} mb-4 drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]`}>Streaks</h2>

      {/* Daily Streaks */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold ${theme.cardText} mb-3`}>Daily Streaks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`${theme.cardBgSecondary} rounded-lg p-4`}>
            <div className={`text-sm ${theme.cardTextSecondary} mb-1`}>Current Streak</div>
            <div className={`text-3xl font-bold ${theme.cardText}`}>{stats.currentStreak} days</div>
          </div>
          <div className={`${theme.cardBgSecondary} rounded-lg p-4`}>
            <div className={`text-sm ${theme.cardTextSecondary} mb-1`}>Longest Streak</div>
            <div className={`text-3xl font-bold ${theme.cardText}`}>{stats.longestStreak} days</div>
          </div>
        </div>
      </div>

      {/* Weekly Streaks */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold ${theme.cardText} mb-3`}>Weekly Streaks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`${theme.cardBgSecondary} rounded-lg p-4`}>
            <div className={`text-sm ${theme.cardTextSecondary} mb-1`}>Current Streak</div>
            <div className={`text-3xl font-bold ${theme.cardText}`}>{stats.currentWeeklyStreak} weeks</div>
          </div>
          <div className={`${theme.cardBgSecondary} rounded-lg p-4`}>
            <div className={`text-sm ${theme.cardTextSecondary} mb-1`}>Longest Streak</div>
            <div className={`text-3xl font-bold ${theme.cardText}`}>{stats.longestWeeklyStreak} weeks</div>
          </div>
        </div>
      </div>

      {/* Monthly Streaks */}
      <div>
        <h3 className={`text-lg font-semibold ${theme.cardText} mb-3`}>Monthly Streaks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`${theme.cardBgSecondary} rounded-lg p-4`}>
            <div className={`text-sm ${theme.cardTextSecondary} mb-1`}>Current Streak</div>
            <div className={`text-3xl font-bold ${theme.cardText}`}>{stats.currentMonthlyStreak} months</div>
          </div>
          <div className={`${theme.cardBgSecondary} rounded-lg p-4`}>
            <div className={`text-sm ${theme.cardTextSecondary} mb-1`}>Longest Streak</div>
            <div className={`text-3xl font-bold ${theme.cardText}`}>{stats.longestMonthlyStreak} months</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreakStats;

import { useTheme } from '../../../contexts/ThemeContext';

function MonthlyStats({ stats }) {
  const { theme } = useTheme();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className={`${theme.cardBg} rounded-lg p-6`}>
        <h3 className={`text-lg font-semibold ${theme.cardText} mb-2`}>This Month</h3>
        <div className={`text-4xl font-bold ${theme.cardText}`}>{stats.thisMonthWorkouts}</div>
        <div className={`text-sm ${theme.cardTextSecondary}`}>workouts</div>
      </div>
      <div className={`${theme.cardBg} rounded-lg p-6`}>
        <h3 className={`text-lg font-semibold ${theme.cardText} mb-2`}>Average per Week</h3>
        <div className={`text-4xl font-bold ${theme.cardText}`}>{stats.avgWorkoutsPerWeek.toFixed(1)}</div>
        <div className={`text-sm ${theme.cardTextSecondary}`}>workouts</div>
      </div>
    </div>
  );
}

export default MonthlyStats;

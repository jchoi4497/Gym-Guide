import { useWorkoutStats } from './useWorkoutStats';
import BasicStatsGrid from './BasicStatsGrid';
import StreakStats from './StreakStats';
import ActivityBreakdown from './ActivityBreakdown';
import MonthlyStats from './MonthlyStats';
import ExerciseInsights from './ExerciseInsights';

function StatsTab({ user }) {
  const { stats, isLoading, error } = useWorkoutStats(user);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-xl text-gray-600">Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-2xl text-red-600 mb-4">Error loading stats</div>
        <div className="text-gray-600">{error}</div>
        <div className="text-sm text-gray-500 mt-4">Check the browser console for more details.</div>
      </div>
    );
  }

  if (!stats || stats.totalWorkouts === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-2xl text-gray-600 mb-4">No workouts yet!</div>
        <div className="text-gray-500">Start tracking your workouts to see your stats here.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BasicStatsGrid stats={stats} />
      <StreakStats stats={stats} />
      <ActivityBreakdown stats={stats} />
      <MonthlyStats stats={stats} />
      <ExerciseInsights stats={stats} />
    </div>
  );
}

export default StatsTab;

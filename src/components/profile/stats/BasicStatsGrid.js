import StatCard from './StatCard';

function BasicStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Workouts" value={stats.totalWorkouts} />
      <StatCard
        title="Member Since"
        value={stats.memberSince?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      />
      <StatCard
        title="Last Workout"
        value={stats.lastWorkout?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      />
      <StatCard title="Current Streak" value={`${stats.currentStreak} days`} highlight />
    </div>
  );
}

export default BasicStatsGrid;

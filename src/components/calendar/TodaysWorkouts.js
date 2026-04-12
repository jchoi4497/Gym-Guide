import ScheduledWorkoutCard from './ScheduledWorkoutCard';

function TodaysWorkouts({ workouts }) {
  if (workouts.length === 0) {
    return null;
  }

  return (
    <div className="bg-sky-50 rounded-3xl shadow-xl p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Scheduled Workouts</h2>
      <div className="space-y-3">
        {workouts.map((workout, idx) => (
          <ScheduledWorkoutCard key={idx} workout={workout} />
        ))}
      </div>
    </div>
  );
}

export default TodaysWorkouts;

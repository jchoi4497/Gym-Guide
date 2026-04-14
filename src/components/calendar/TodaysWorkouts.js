import ScheduledWorkoutCard from './ScheduledWorkoutCard';
import { useTheme } from '../../contexts/ThemeContext';

function TodaysWorkouts({ workouts, onDeleteWorkout }) {
  const { theme } = useTheme();

  if (workouts.length === 0) {
    return null;
  }

  return (
    <div className={`${theme.cardBg} rounded-xl p-6 mb-6`}>
      <h2 className={`text-2xl font-bold ${theme.headerText} mb-4 drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]`}>Today's Scheduled Workouts</h2>
      <div className="space-y-3">
        {workouts.map((workout, idx) => (
          <ScheduledWorkoutCard key={idx} workout={workout} onDeleteWorkout={onDeleteWorkout} />
        ))}
      </div>
    </div>
  );
}

export default TodaysWorkouts;

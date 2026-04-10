import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import db from '../../config/firebase';
import { FIREBASE_FIELDS, MUSCLE_GROUP_OPTIONS } from '../../config/constants';

function StatsTab({ user }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Fetch all user workouts - no orderBy to avoid index requirement
        const q = query(
          collection(db, 'workoutLogs'),
          where(FIREBASE_FIELDS.USER_ID, '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        let workouts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by date in JavaScript instead
        workouts.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date?.seconds * 1000);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date?.seconds * 1000);
          return dateA - dateB;
        });

        if (workouts.length === 0) {
          setStats({
            totalWorkouts: 0,
            memberSince: null,
            lastWorkout: null,
            currentStreak: 0,
            longestStreak: 0,
            muscleGroupBreakdown: {},
            mostTrainedMuscleGroup: null,
            thisMonthWorkouts: 0,
            avgWorkoutsPerWeek: 0,
            totalExercises: 0,
            favoriteExercise: null,
            customExercisesCount: 0,
            totalSets: 0,
          });
          setIsLoading(false);
          return;
        }

        // Basic stats
        const totalWorkouts = workouts.length;
        const firstWorkout = workouts[0].date?.toDate ? workouts[0].date.toDate() : new Date(workouts[0].date?.seconds * 1000);
        const lastWorkout = workouts[workouts.length - 1].date?.toDate ? workouts[workouts.length - 1].date.toDate() : new Date(workouts[workouts.length - 1].date?.seconds * 1000);

        // Muscle group breakdown
        const muscleGroupBreakdown = {};
        workouts.forEach((workout) => {
          const muscleGroup = workout.muscleGroup || workout.target;
          if (muscleGroup) {
            muscleGroupBreakdown[muscleGroup] = (muscleGroupBreakdown[muscleGroup] || 0) + 1;
          }
        });

        // Most trained muscle group
        const mostTrainedMuscleGroup = Object.entries(muscleGroupBreakdown).reduce(
          (max, [group, count]) => (count > max.count ? { group, count } : max),
          { group: null, count: 0 }
        );

        // This month's workouts
        const now = new Date();
        const thisMonth = workouts.filter((workout) => {
          const workoutDate = workout.date?.toDate ? workout.date.toDate() : new Date(workout.date?.seconds * 1000);
          return workoutDate.getMonth() === now.getMonth() && workoutDate.getFullYear() === now.getFullYear();
        }).length;

        // Average workouts per week
        const daysSinceMemberStart = Math.max((now - firstWorkout) / (1000 * 60 * 60 * 24), 1);
        const weeksSinceMemberStart = daysSinceMemberStart / 7;
        const avgWorkoutsPerWeek = totalWorkouts / weeksSinceMemberStart;

        // Streaks
        const { currentStreak, longestStreak } = calculateStreaks(workouts);

        // Exercise stats
        const exerciseCounts = {};
        let totalSets = 0;
        let totalExercises = 0;
        let customExercisesSet = new Set();

        workouts.forEach((workout) => {
          const exerciseData = workout.exerciseData || workout.inputs || {};
          Object.entries(exerciseData).forEach(([key, exercise]) => {
            const exerciseName = exercise.exerciseName || exercise.selection;
            if (exerciseName) {
              totalExercises++;
              exerciseCounts[exerciseName] = (exerciseCounts[exerciseName] || 0) + 1;

              // Count sets
              const sets = exercise.sets || exercise.input || [];
              totalSets += sets.filter((set) => set && set.trim() !== '').length;

              // Track custom exercises
              if (key.startsWith('custom_') || !exerciseName.match(/^[a-z]+$/)) {
                customExercisesSet.add(exerciseName.toLowerCase().trim());
              }
            }
          });
        });

        // Favorite exercise (most performed)
        const favoriteExercise = Object.entries(exerciseCounts).reduce(
          (max, [exercise, count]) => (count > max.count ? { exercise, count } : max),
          { exercise: null, count: 0 }
        );

        setStats({
          totalWorkouts,
          memberSince: firstWorkout,
          lastWorkout,
          currentStreak,
          longestStreak,
          muscleGroupBreakdown,
          mostTrainedMuscleGroup: mostTrainedMuscleGroup.group,
          thisMonthWorkouts: thisMonth,
          avgWorkoutsPerWeek,
          totalExercises,
          favoriteExercise: favoriteExercise.exercise,
          favoriteExerciseCount: favoriteExercise.count,
          customExercisesCount: customExercisesSet.size,
          totalSets,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error.message || 'Failed to load stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // Calculate current and longest streaks
  const calculateStreaks = (workouts) => {
    if (workouts.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Get unique workout dates (YYYY-MM-DD format)
    const workoutDates = workouts.map((workout) => {
      const date = workout.date?.toDate ? workout.date.toDate() : new Date(workout.date?.seconds * 1000);
      return date.toISOString().split('T')[0];
    });

    const uniqueDates = [...new Set(workoutDates)].sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Calculate longest streak
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak (working backwards from today)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
      currentStreak = 1;
      const startDate = uniqueDates.includes(today) ? today : yesterday;
      let checkDate = new Date(startDate);

      for (let i = uniqueDates.length - 1; i >= 0; i--) {
        checkDate.setDate(checkDate.getDate() - 1);
        const checkDateStr = checkDate.toISOString().split('T')[0];

        if (uniqueDates.includes(checkDateStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return { currentStreak, longestStreak };
  };

  const getLabel = (value) =>
    MUSCLE_GROUP_OPTIONS.find((option) => option.value === value)?.label || value;

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
      {/* Basic Stats Grid */}
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

      {/* Streak Stats */}
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

      {/* Activity Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Activity Breakdown</h2>
        <div className="space-y-3">
          {Object.entries(stats.muscleGroupBreakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([group, count]) => (
              <div key={group} className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{getLabel(group)}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 sm:w-48 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${(count / stats.totalWorkouts) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-600 font-semibold w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
        </div>
        {stats.mostTrainedMuscleGroup && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Most Trained: </span>
            <span className="font-bold text-blue-600">{getLabel(stats.mostTrainedMuscleGroup)}</span>
          </div>
        )}
      </div>

      {/* Monthly Stats */}
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

      {/* Exercise Insights */}
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
    </div>
  );
}

// Reusable stat card component
function StatCard({ title, value, highlight = false }) {
  return (
    <div className={`rounded-lg shadow-md p-6 ${highlight ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : 'bg-white'}`}>
      <div className={`text-sm mb-2 ${highlight ? 'text-blue-100' : 'text-gray-600'}`}>{title}</div>
      <div className={`text-3xl font-bold ${highlight ? 'text-white' : 'text-gray-800'}`}>{value}</div>
    </div>
  );
}

export default StatsTab;

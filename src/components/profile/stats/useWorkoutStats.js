import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import db from '../../../config/firebase';
import { FIREBASE_FIELDS } from '../../../config/constants';
import { getExerciseName } from '../../../config/exerciseConfig';

/**
 * Custom hook to fetch and calculate workout statistics
 */
export function useWorkoutStats(user) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Fetch all user workouts
        const q = query(
          collection(db, 'workoutLogs'),
          where(FIREBASE_FIELDS.USER_ID, '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        let workouts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by date
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
            currentWeeklyStreak: 0,
            longestWeeklyStreak: 0,
            currentMonthlyStreak: 0,
            longestMonthlyStreak: 0,
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

        const calculatedStats = calculateStats(workouts);
        setStats(calculatedStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error.message || 'Failed to load stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, isLoading, error };
}

/**
 * Calculate all statistics from workouts array
 */
function calculateStats(workouts) {
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
  const { currentWeeklyStreak, longestWeeklyStreak } = calculateWeeklyStreaks(workouts);
  const { currentMonthlyStreak, longestMonthlyStreak } = calculateMonthlyStreaks(workouts);

  // Exercise stats
  const { exerciseCounts, totalSets, totalExercises, customExercisesSet } = calculateExerciseStats(workouts);

  // Favorite exercise
  const favoriteExercise = Object.entries(exerciseCounts).reduce(
    (max, [exercise, count]) => (count > max.count ? { exercise, count } : max),
    { exercise: null, count: 0 }
  );

  return {
    totalWorkouts,
    memberSince: firstWorkout,
    lastWorkout,
    currentStreak,
    longestStreak,
    currentWeeklyStreak,
    longestWeeklyStreak,
    currentMonthlyStreak,
    longestMonthlyStreak,
    muscleGroupBreakdown,
    mostTrainedMuscleGroup: mostTrainedMuscleGroup.group,
    thisMonthWorkouts: thisMonth,
    avgWorkoutsPerWeek,
    totalExercises,
    favoriteExercise: favoriteExercise.exercise,
    favoriteExerciseCount: favoriteExercise.count,
    customExercisesCount: customExercisesSet.size,
    totalSets,
  };
}

/**
 * Calculate current and longest streaks from workouts
 */
function calculateStreaks(workouts) {
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
}

/**
 * Calculate weekly streaks (consecutive weeks with at least one workout)
 */
function calculateWeeklyStreaks(workouts) {
  if (workouts.length === 0) return { currentWeeklyStreak: 0, longestWeeklyStreak: 0 };

  // Helper function to get week key (year-week)
  const getWeekKey = (date) => {
    const d = new Date(date);
    // Get ISO week number
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  };

  // Get unique workout weeks
  const workoutWeeks = workouts.map((workout) => {
    const date = workout.date?.toDate ? workout.date.toDate() : new Date(workout.date?.seconds * 1000);
    return getWeekKey(date);
  });

  const uniqueWeeks = [...new Set(workoutWeeks)].sort();

  let currentWeeklyStreak = 0;
  let longestWeeklyStreak = 0;
  let tempStreak = 1;

  // Calculate longest weekly streak
  for (let i = 1; i < uniqueWeeks.length; i++) {
    const [prevYear, prevWeek] = uniqueWeeks[i - 1].split('-W').map(Number);
    const [currYear, currWeek] = uniqueWeeks[i].split('-W').map(Number);

    // Check if consecutive weeks (accounting for year rollover)
    const isConsecutive =
      (currYear === prevYear && currWeek === prevWeek + 1) ||
      (currYear === prevYear + 1 && prevWeek >= 52 && currWeek === 1);

    if (isConsecutive) {
      tempStreak++;
    } else {
      longestWeeklyStreak = Math.max(longestWeeklyStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestWeeklyStreak = Math.max(longestWeeklyStreak, tempStreak);

  // Calculate current weekly streak
  const thisWeek = getWeekKey(new Date());
  const lastWeek = getWeekKey(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  if (uniqueWeeks.includes(thisWeek) || uniqueWeeks.includes(lastWeek)) {
    currentWeeklyStreak = 1;
    let checkIndex = uniqueWeeks.length - 1;

    // Count backwards for consecutive weeks
    for (let i = checkIndex - 1; i >= 0; i--) {
      const [prevYear, prevWeek] = uniqueWeeks[i].split('-W').map(Number);
      const [currYear, currWeek] = uniqueWeeks[i + 1].split('-W').map(Number);

      const isConsecutive =
        (currYear === prevYear && currWeek === prevWeek + 1) ||
        (currYear === prevYear + 1 && prevWeek >= 52 && currWeek === 1);

      if (isConsecutive) {
        currentWeeklyStreak++;
      } else {
        break;
      }
    }
  }

  return { currentWeeklyStreak, longestWeeklyStreak };
}

/**
 * Calculate monthly streaks (consecutive months with at least one workout)
 */
function calculateMonthlyStreaks(workouts) {
  if (workouts.length === 0) return { currentMonthlyStreak: 0, longestMonthlyStreak: 0 };

  // Get unique workout months (YYYY-MM format)
  const workoutMonths = workouts.map((workout) => {
    const date = workout.date?.toDate ? workout.date.toDate() : new Date(workout.date?.seconds * 1000);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });

  const uniqueMonths = [...new Set(workoutMonths)].sort();

  let currentMonthlyStreak = 0;
  let longestMonthlyStreak = 0;
  let tempStreak = 1;

  // Calculate longest monthly streak
  for (let i = 1; i < uniqueMonths.length; i++) {
    const [prevYear, prevMonth] = uniqueMonths[i - 1].split('-').map(Number);
    const [currYear, currMonth] = uniqueMonths[i].split('-').map(Number);

    // Check if consecutive months (accounting for year rollover)
    const isConsecutive =
      (currYear === prevYear && currMonth === prevMonth + 1) ||
      (currYear === prevYear + 1 && prevMonth === 12 && currMonth === 1);

    if (isConsecutive) {
      tempStreak++;
    } else {
      longestMonthlyStreak = Math.max(longestMonthlyStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestMonthlyStreak = Math.max(longestMonthlyStreak, tempStreak);

  // Calculate current monthly streak
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

  if (uniqueMonths.includes(thisMonth) || uniqueMonths.includes(lastMonthKey)) {
    currentMonthlyStreak = 1;
    let checkIndex = uniqueMonths.length - 1;

    // Count backwards for consecutive months
    for (let i = checkIndex - 1; i >= 0; i--) {
      const [prevYear, prevMonth] = uniqueMonths[i].split('-').map(Number);
      const [currYear, currMonth] = uniqueMonths[i + 1].split('-').map(Number);

      const isConsecutive =
        (currYear === prevYear && currMonth === prevMonth + 1) ||
        (currYear === prevYear + 1 && prevMonth === 12 && currMonth === 1);

      if (isConsecutive) {
        currentMonthlyStreak++;
      } else {
        break;
      }
    }
  }

  return { currentMonthlyStreak, longestMonthlyStreak };
}

/**
 * Calculate exercise-related statistics
 */
function calculateExerciseStats(workouts) {
  const exerciseCounts = {};
  let totalSets = 0;
  let totalExercises = 0;
  let customExercisesSet = new Set();

  workouts.forEach((workout) => {
    const exerciseData = workout.exerciseData || workout.inputs || {};
    Object.entries(exerciseData).forEach(([key, exercise]) => {
      const rawExerciseName = exercise.exerciseName || exercise.selection;
      if (rawExerciseName) {
        // Convert exercise ID to full name if it's an ID
        const exerciseName = getExerciseName(rawExerciseName);

        totalExercises++;
        exerciseCounts[exerciseName] = (exerciseCounts[exerciseName] || 0) + 1;

        // Count sets
        const sets = exercise.sets || exercise.input || [];
        totalSets += sets.filter((set) => set && set.trim() !== '').length;

        // Track custom exercises
        if (key.startsWith('custom_') || !rawExerciseName.match(/^[a-z]+$/)) {
          customExercisesSet.add(exerciseName.toLowerCase().trim());
        }
      }
    });
  });

  return { exerciseCounts, totalSets, totalExercises, customExercisesSet };
}

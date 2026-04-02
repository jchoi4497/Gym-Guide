import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import db from '../firebase';
import { FIREBASE_FIELDS } from '../constants';

/**
 * Custom hook to fetch and manage workout history data
 * Includes previous workouts, custom exercises, muscle groups, and favorites
 */
export function useWorkoutHistory(actualMuscleGroup) {
  const [previousWorkoutData, setPreviousWorkoutData] = useState(null);
  const [previousCustomExercises, setPreviousCustomExercises] = useState([]);
  const [previousCustomMuscleGroups, setPreviousCustomMuscleGroups] = useState([]);
  const [favoriteExercises, setFavoriteExercises] = useState([]);

  // Fetch all custom exercises from user's workout history AND "My Exercises" page
  const fetchPreviousCustomExercises = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Fetch from workout history
      const q = query(
        collection(db, 'workoutLogs'),
        where(FIREBASE_FIELDS.USER_ID, '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const customExercises = new Map(); // Use Map to deduplicate by name
      const customMuscleGroups = new Set(); // Use Set to deduplicate

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();

        // Collect custom muscle groups
        const muscleGroup = data.muscleGroup || data.target;
        if (muscleGroup && !['chest', 'back', 'legs', 'shoulders'].includes(muscleGroup)) {
          customMuscleGroups.add(muscleGroup);
        }

        // Collect custom exercises
        const exerciseData = data.exerciseData || data.inputs || {};
        Object.entries(exerciseData).forEach(([key, exercise]) => {
          const exerciseName = exercise.exerciseName || exercise.selection;

          // Only include custom exercises (those with custom_ prefix or not in presets)
          if (exerciseName && (key.startsWith('custom_') || !exerciseName.match(/^[a-z]+$/))) {
            const normalizedName = exerciseName.toLowerCase().trim();

            if (!customExercises.has(normalizedName)) {
              customExercises.set(normalizedName, {
                name: exerciseName,
                id: key,
                category: exercise.detectedCategory, // Include detected category if available
              });
            }
          }
        });
      });

      // Set the data from workout history first (this always works)
      const exerciseArray = Array.from(customExercises.values());
      const muscleGroupArray = Array.from(customMuscleGroups);

      setPreviousCustomExercises(exerciseArray);
      setPreviousCustomMuscleGroups(muscleGroupArray);

      // Try to fetch from "My Exercises" page (might fail if rules not set up)
      try {
        const customExDoc = await getDoc(doc(db, 'userCustomExercises', user.uid));
        if (customExDoc.exists()) {
          const myExercises = customExDoc.data().exercises || [];

          myExercises.forEach((ex) => {
            const normalizedName = ex.name.toLowerCase().trim();
            if (!customExercises.has(normalizedName)) {
              customExercises.set(normalizedName, {
                name: ex.name,
                id: ex.id,
                category: ex.category,
              });
            }
          });

          // Update with merged data
          setPreviousCustomExercises(Array.from(customExercises.values()));
        }
      } catch (customExError) {
        // My Exercises page data not available
      }
    } catch (error) {
      console.error('Error fetching custom exercises:', error);
    }
  };

  // Fetch user's favorite exercises from Firebase
  const fetchFavorites = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const favDoc = await getDoc(doc(db, 'userFavorites', user.uid));
      if (favDoc.exists()) {
        setFavoriteExercises(favDoc.data().favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // Toggle favorite status for an exercise
  const toggleFavorite = async (exerciseId) => {
    const user = auth.currentUser;
    if (!user) return;

    const newFavorites = favoriteExercises.includes(exerciseId)
      ? favoriteExercises.filter(id => id !== exerciseId)
      : [...favoriteExercises, exerciseId];

    setFavoriteExercises(newFavorites);

    // Save to Firebase
    try {
      await setDoc(doc(db, 'userFavorites', user.uid), { favorites: newFavorites });
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  // Fetch recent workouts across ALL muscle groups (for exercise-level comparison)
  const fetchRecentWorkouts = async (currentDate) => {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const q = query(
        collection(db, 'workoutLogs'),
        where(FIREBASE_FIELDS.USER_ID, '==', user.uid),
        where(FIREBASE_FIELDS.DATE, '<', currentDate),
        orderBy(FIREBASE_FIELDS.DATE, 'desc'),
        limit(20), // Fetch last 20 workouts for exercise matching
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching recent workouts:', error);
      return [];
    }
  };

  // Previous Workout
  const fetchPreviousWorkout = async (currentDate, muscleGroupToFetch) => {
    const user = auth.currentUser;
    if (!user) return null;

    const targetMuscleGroup = muscleGroupToFetch || actualMuscleGroup;
    if (!targetMuscleGroup) return null;

    try {
      // Try querying with new field name first
      let q = query(
        collection(db, 'workoutLogs'),
        where(FIREBASE_FIELDS.USER_ID, '==', user.uid),
        where(FIREBASE_FIELDS.MUSCLE_GROUP, '==', targetMuscleGroup),
        where(FIREBASE_FIELDS.DATE, '<', currentDate),
        orderBy(FIREBASE_FIELDS.DATE, 'desc'),
        limit(1),
      );

      let querySnapshot = await getDocs(q);

      // If no results with new field name, try old field name (backward compatibility)
      if (querySnapshot.empty) {
        q = query(
          collection(db, 'workoutLogs'),
          where(FIREBASE_FIELDS.USER_ID, '==', user.uid),
          where(FIREBASE_FIELDS.LEGACY_TARGET, '==', targetMuscleGroup),
          where(FIREBASE_FIELDS.DATE, '<', currentDate),
          orderBy(FIREBASE_FIELDS.DATE, 'desc'),
          limit(1),
        );
        querySnapshot = await getDocs(q);
      }

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch previous workout', error);
      return null;
    }
  };

  // Load workout history when user authenticates or muscle group changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchPreviousCustomExercises();
        fetchFavorites();
        if (actualMuscleGroup) {
          // For custom muscle groups that aren't in presets, fetch recent workouts across all groups
          const isPresetMuscleGroup = ['chest', 'back', 'legs', 'shoulders'].includes(actualMuscleGroup);

          if (isPresetMuscleGroup) {
            // Preset: fetch by muscle group for targeted comparison
            fetchPreviousWorkout(new Date(), actualMuscleGroup).then((data) => setPreviousWorkoutData(data));
          } else {
            // Custom: fetch recent workouts across all muscle groups for exercise-level comparison
            fetchRecentWorkouts(new Date()).then((data) => setPreviousWorkoutData(data));
          }
        }
      }
    });
    return () => unsubscribe();
  }, [actualMuscleGroup]);

  return {
    previousWorkoutData,
    setPreviousWorkoutData,
    previousCustomExercises,
    previousCustomMuscleGroups,
    favoriteExercises,
    toggleFavorite,
    fetchPreviousWorkout,
    fetchRecentWorkouts,
  };
}

import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc, query, where, orderBy, limit, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../config/firebase';
import db from '../config/firebase';
import MuscleGroupWorkout from '../components/MuscleGroupWorkout';
import Navbar from '../components/Navbar';
import WorkoutNotesInput from '../components/WorkoutNotesInput';
import { generateSummary } from '../utils/summaryUtil';
import { FIREBASE_FIELDS } from '../config/constants';
import { getMuscleGroupFromCategory } from '../utils/categoryDetection';
import { EXERCISES } from '../config/exerciseConfig';
import { useTheme } from '../contexts/ThemeContext';
import { WorkoutProvider, useWorkout } from '../contexts/WorkoutContext';

function WorkoutPageContent() {
  const { theme } = useTheme();
  const { workoutId } = useParams();
  const navigate = useNavigate();

  // Get workout context
  const {
    exerciseData,
    setExerciseData,
    favoriteExercises,
    setFavoriteExercises,
    previousWorkoutData,
    setPreviousWorkoutData,
    previousCustomExercises,
    setPreviousCustomExercises,
    isEditingSets,
    setIsEditingSets,
    expandAll,
    setExpandAll,
    mainExerciseOrder,
    setMainExerciseOrder,
    handleExerciseDataChange,
    batchInitializeExercises,
    handleRemoveExercise,
    handleRemoveSet,
    handleReorderExercises,
    toggleFavorite,
    handleCardioMoveUp,
    handleCardioMoveDown,
    handleAbsMoveUp,
    handleAbsMoveDown,
    updateWorkoutState,
  } = useWorkout();

  // Workout data from Firebase
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [user, setUser] = useState(null);

  // Local state not managed by context
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // UI state
  const [isButtonSticky, setIsButtonSticky] = useState(true);
  const [startButtonState, setStartButtonState] = useState('header'); // 'header', 'fixed' (mobile only)
  const [isMobile, setIsMobile] = useState(false);

  // Derived values from workout
  const actualMuscleGroup = workout?.muscleGroup || '';
  const actualNumberOfSets = parseInt(workout?.numberOfSets) || parseInt(workout?.customSetCount) || 4;
  const setRangeLabel = workout?.customRepCount
    ? `${actualNumberOfSets}x${workout.customRepCount}`
    : `${actualNumberOfSets} sets`;

  const isWorkoutConfigured = !!workout;

  // Load workout from Firebase (only once on mount)
  useEffect(() => {
    let hasLoaded = false;

    const loadWorkout = async () => {
      if (!workoutId) {
        setLoading(false);
        return;
      }

      if (!auth.currentUser) {
        // Wait for auth to initialize
        return;
      }

      // Prevent reloading if already loaded
      if (hasLoaded) return;
      hasLoaded = true;

      try {
        const workoutRef = doc(db, 'workoutLogs', workoutId);
        const workoutSnap = await getDoc(workoutRef);

        if (workoutSnap.exists()) {
          const workoutData = workoutSnap.data();
          setWorkout(workoutData);
          setNote(workoutData.note || '');

          // Update workout context with data from Firebase
          updateWorkoutState({
            exerciseData: workoutData.exerciseData || {},
            muscleGroup: workoutData.muscleGroup || '',
            templateId: workoutData.templateId || null,
            mainExerciseOrder: workoutData.mainExerciseOrder || [],
          });
        } else {
          alert('Workout not found');
          navigate('/Create');
        }
      } catch (error) {
        console.error('Error loading workout:', error);
        alert('Failed to load workout');
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadWorkout();
      } else {
        // User logged out - clear workout data and stop loading
        setWorkout(null);
        setExerciseData({});
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [workoutId, navigate]);

  // Check for active workout session (has any exercise data in Firebase)
  useEffect(() => {
    if (workout && workout.status === 'draft') {
      // Check if there are any completed sets OR any exercises with names filled in
      const exerciseData = workout.exerciseData || {};
      const hasAnyData = Object.values(exerciseData).some(exercise => {
        // Check for completed sets
        const sets = exercise.sets || [];
        const hasCompletedSets = sets.some(set => set && set.trim() !== '');

        // Check for exercise name filled in
        const hasExerciseName = (exercise.exerciseName || exercise.selection)?.trim();

        return hasCompletedSets || hasExerciseName;
      });

      setHasActiveSession(hasAnyData);
    } else {
      setHasActiveSession(false);
    }
  }, [workout]);

  // Fetch user data (favorites, previous workouts, custom exercises)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && actualMuscleGroup) {
        fetchFavorites();
        fetchPreviousCustomExercises();
        fetchPreviousWorkout(new Date(), actualMuscleGroup).then((data) => setPreviousWorkoutData(data));
      }
    });
    return () => unsubscribe();
  }, [actualMuscleGroup]);

  // Fetch user favorites
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

  // Toggle favorite exercise with Firebase persistence
  const handleToggleFavorite = async (exerciseId) => {
    const user = auth.currentUser;
    if (!user) return;

    await toggleFavorite(exerciseId, async (newFavorites) => {
      try {
        await setDoc(doc(db, 'userFavorites', user.uid), { favorites: newFavorites });
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    });
  };

  // Fetch all custom exercises from user's workout history AND "My Exercises" page
  const fetchPreviousCustomExercises = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(
        collection(db, 'workoutLogs'),
        where(FIREBASE_FIELDS.USER_ID, '==', user.uid),
        orderBy(FIREBASE_FIELDS.DATE, 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const customExercises = new Map();

      querySnapshot.forEach((doc) => {
        const workoutData = doc.data();
        const muscleGroup = workoutData[FIREBASE_FIELDS.MUSCLE_GROUP] || workoutData[FIREBASE_FIELDS.LEGACY_TARGET];
        const exerciseDataFromWorkout = workoutData[FIREBASE_FIELDS.EXERCISE_DATA] || workoutData.inputs || {};

        Object.entries(exerciseDataFromWorkout).forEach(([key, exercise]) => {
          const exerciseName = exercise.exerciseName || exercise.selection;

          // Check if this is a custom exercise (not a preset)
          // Preset exercise keys are short lowercase IDs like 'dip', 'bp', 'mr'
          const isPresetKey = key.match(/^[a-z]+$/) && key.length <= 10;
          const isCustomExercise = !isPresetKey;

          // Also filter out exercise names that look like IDs
          const looksLikeId = exerciseName && exerciseName.match(/^[a-z]+$/) && exerciseName.length <= 10;

          if (exerciseName && isCustomExercise && !looksLikeId) {
            const normalizedName = exerciseName.toLowerCase().trim();
            if (!customExercises.has(normalizedName)) {
              customExercises.set(normalizedName, {
                name: exerciseName,
                muscleGroup: muscleGroup || 'general',
                lastUsed: workoutData[FIREBASE_FIELDS.DATE]?.toDate?.() || new Date(),
              });
            }
          }
        });
      });

      const exerciseArray = Array.from(customExercises.values());

      try {
        const customExDoc = await getDoc(doc(db, 'userCustomExercises', user.uid));
        if (customExDoc.exists()) {
          const myExercises = customExDoc.data().exercises || [];
          myExercises.forEach(ex => {
            const normalizedName = ex.name.toLowerCase().trim();
            if (!customExercises.has(normalizedName)) {
              customExercises.set(normalizedName, {
                name: ex.name,
                muscleGroup: ex.muscleGroup || 'general',
                lastUsed: new Date(ex.createdAt || Date.now()),
              });
            }
          });
          setPreviousCustomExercises(Array.from(customExercises.values()));
        }
      } catch (customExError) {
        console.error('Error fetching custom exercises:', customExError);
      }

      setPreviousCustomExercises(exerciseArray);
    } catch (error) {
      console.error('Error fetching custom exercises:', error);
    }
  };

  // Fetch previous workout
  const fetchPreviousWorkout = async (currentDate, muscleGroupToFetch) => {
    const user = auth.currentUser;
    if (!user) return null;

    const targetMuscleGroup = muscleGroupToFetch || actualMuscleGroup;
    if (!targetMuscleGroup) return null;

    try {
      let q = query(
        collection(db, 'workoutLogs'),
        where(FIREBASE_FIELDS.USER_ID, '==', user.uid),
        where(FIREBASE_FIELDS.MUSCLE_GROUP, '==', targetMuscleGroup),
        where(FIREBASE_FIELDS.DATE, '<', currentDate),
        orderBy(FIREBASE_FIELDS.DATE, 'desc'),
        limit(1)
      );

      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        q = query(
          collection(db, 'workoutLogs'),
          where(FIREBASE_FIELDS.USER_ID, '==', user.uid),
          where(FIREBASE_FIELDS.LEGACY_TARGET, '==', targetMuscleGroup),
          where(FIREBASE_FIELDS.DATE, '<', currentDate),
          orderBy(FIREBASE_FIELDS.DATE, 'desc'),
          limit(1)
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

  // Remove an entire exercise with Firebase persistence
  const handleRemoveExerciseWithSave = async (categoryKey) => {
    // Use context function with Firebase save callback
    handleRemoveExercise(categoryKey, async (updatedExerciseData, updatedOrder) => {
      if (workoutId && auth.currentUser) {
        try {
          const workoutRef = doc(db, 'workoutLogs', workoutId);
          await updateDoc(workoutRef, {
            exerciseData: updatedExerciseData,
            mainExerciseOrder: updatedOrder,
            lastModified: serverTimestamp()
          });
        } catch (error) {
          console.error('Error saving exercise deletion:', error);
        }
      }
    });
  };


  // Auto-save workout draft to Firebase whenever state changes
  useEffect(() => {
    const saveWorkoutDraft = async () => {
      if (!workoutId || !auth.currentUser || loading) return;

      // Don't save if exerciseData is empty (initial load)
      if (Object.keys(exerciseData).length === 0 && !note) return;

      try {
        const workoutRef = doc(db, 'workoutLogs', workoutId);
        await updateDoc(workoutRef, {
          exerciseData: exerciseData,
          note: note,
          mainExerciseOrder: mainExerciseOrder,
          lastModified: serverTimestamp()
        });
      } catch (error) {
        console.error('Error saving workout draft:', error);
      }
    };

    // Debounce to avoid too many Firebase writes
    const timeoutId = setTimeout(() => {
      saveWorkoutDraft();
    }, 500); // Save 500ms after last change

    return () => clearTimeout(timeoutId);
  }, [exerciseData, note, mainExerciseOrder, workoutId, loading]);

  // Force re-render when returning from app switch to ensure UI reflects current state
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && workoutId && !loading) {
        // Page became visible - trigger a state update to force re-render
        setExerciseData(prev => ({ ...prev }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [workoutId, loading]);

  // Auto-save custom exercises to "My Exercises" when completing workout
  const autoSaveCustomExercises = async (userId, exerciseDataToSave) => {
    try {
      const customExDoc = await getDoc(doc(db, 'userCustomExercises', userId));
      const existingExercises = customExDoc.exists() ? customExDoc.data().exercises || [] : [];

      // Get all preset exercise names to filter out
      const presetNames = new Set(
        Object.values(EXERCISES).map(ex => ex.name.toLowerCase().trim())
      );

      const newExercises = [];
      Object.entries(exerciseDataToSave).forEach(([key, exercise]) => {
        const exerciseName = exercise.exerciseName || exercise.selection;
        const detectedCategory = exercise.detectedCategory;

        // Check if this is a custom exercise (not a preset)
        // Preset exercise keys are short lowercase IDs like 'dip', 'bp', 'mr'
        // Custom exercise keys start with 'custom_' or have underscores/numbers
        const isPresetKey = key.match(/^[a-z]+$/) && key.length <= 10;
        const isCustomExercise = !isPresetKey;

        if (exerciseName && isCustomExercise) {
          const normalizedName = exerciseName.toLowerCase().trim();

          // Skip if:
          // - Already exists in saved exercises
          // - Is a preset exercise name (e.g., "Bench Press", "Dip")
          // - Exercise name looks like an ID (short lowercase letters)
          const looksLikeId = exerciseName.match(/^[a-z]+$/) && exerciseName.length <= 10;
          const isPresetName = presetNames.has(normalizedName);

          const alreadyExists = existingExercises.some(
            ex => ex.name.toLowerCase().trim() === normalizedName
          );

          if (!alreadyExists && !isPresetName && !looksLikeId) {
            newExercises.push({
              id: `auto_${Date.now()}_${Math.random()}`,
              name: exerciseName,
              category: detectedCategory || 'uncategorized',
              muscleGroup: getMuscleGroupFromCategory(detectedCategory) || 'uncategorized',
              notes: 'Auto-saved from workout - Please edit to set muscle group',
              createdAt: new Date().toISOString(),
              isCustomCategory: !detectedCategory,
            });
          }
        }
      });

      if (newExercises.length > 0) {
        const allExercises = [...existingExercises, ...newExercises];
        await setDoc(doc(db, 'userCustomExercises', userId), { exercises: allExercises });
      }
    } catch (error) {
      console.error('Error auto-saving custom exercises:', error);
    }
  };

  // Start Workout - navigate to active workout tracking page
  const handleStartWorkout = () => {
    const workoutDataForSession = {
      workoutName: actualMuscleGroup ? `${actualMuscleGroup} Day` : 'Workout',
      selectedMuscleGroup: actualMuscleGroup,
      muscleGroup: actualMuscleGroup,
      numberOfSets: actualNumberOfSets,
      exerciseData: exerciseData,
      mainExerciseOrder: mainExerciseOrder,
      workoutId: workoutId, // Pass the workout ID so we can save back to it
    };

    navigate('/start-workout', { state: { workoutData: workoutDataForSession } });
  };

  // Complete Workout - save to workoutLogs and update status
  const handleCompleteWorkout = async () => {
    console.log('💾 [handleCompleteWorkout] Starting save process');

    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to save a workout!');
        return;
      }

      // Validate exerciseData
      const validatedExerciseData = {};
      let removedExercises = [];

      Object.entries(exerciseData).forEach(([key, exercise]) => {
        const exerciseName = exercise.exerciseName || exercise.selection;
        if (exerciseName && exerciseName.trim()) {
          validatedExerciseData[key] = exercise;
        } else {
          removedExercises.push(key);
        }
      });

      if (removedExercises.length > 0) {
        alert(`Warning: ${removedExercises.length} exercise(s) had no name and were not saved.`);
        setIsSaving(false);
        return;
      }

      // Auto-save custom exercises
      await autoSaveCustomExercises(user.uid, validatedExerciseData);

      // Get previous workout for summary
      const [year, month, day] = workout.workoutDate.split('-');
      const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
      const prevWorkout = await fetchPreviousWorkout(selectedDate, actualMuscleGroup);
      const prevExerciseData = prevWorkout?.exerciseData || prevWorkout?.inputs;

      // Use mainExerciseOrder directly (includes all exercises including cardio/abs)
      const exerciseOrder = mainExerciseOrder.length > 0
        ? mainExerciseOrder.filter(key => key in validatedExerciseData)
        : Object.keys(validatedExerciseData);

      // Generate summary
      setIsGeneratingSummary(true);
      const newSummary = await generateSummary(validatedExerciseData, note, prevExerciseData, [], exerciseOrder);
      setIsGeneratingSummary(false);

      // Update the existing draft workout to completed
      const workoutRef = doc(db, 'workoutLogs', workoutId);
      await updateDoc(workoutRef, {
        status: 'completed',
        exerciseData: validatedExerciseData,
        note: note,
        summary: newSummary,
        exerciseOrder: exerciseOrder,
        completedAt: serverTimestamp(),
        lastModified: serverTimestamp()
      });

      // Redirect to saved workout
      window.location.href = `/SavedWorkout/${workoutId}`;
    } catch (error) {
      console.error('Error completing workout:', error);
      alert('Error saving workout. Please try again.');
    } finally {
      setIsSaving(false);
      setIsGeneratingSummary(false);
    }
  };

  // Detect mobile vs desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle start button position based on scroll (mobile only)
  useEffect(() => {
    if (!isWorkoutConfigured) return;

    let animationFrameId;
    let lastScrollY = -1;

    const checkStartButtonScroll = () => {
      // Desktop - always show with header
      if (window.innerWidth >= 768) {
        setStartButtonState('header');
        animationFrameId = requestAnimationFrame(checkStartButtonScroll);
        return;
      }

      const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

      if (currentScrollY !== lastScrollY) {
        lastScrollY = currentScrollY;

        // If scrolled down more than 150px, make it sticky
        if (currentScrollY > 150) {
          setStartButtonState('fixed');
        } else {
          setStartButtonState('header');
        }
      }

      animationFrameId = requestAnimationFrame(checkStartButtonScroll);
    };

    animationFrameId = requestAnimationFrame(checkStartButtonScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isWorkoutConfigured]);

  // Handle sticky button on mobile (legacy logic for complete workout button)
  useEffect(() => {
    if (!isWorkoutConfigured) return;

    let animationFrameId;
    let lastScrollY = -1;
    let lastDocHeight = -1;

    const checkScroll = () => {
      if (window.innerWidth >= 640) {
        setIsButtonSticky(false);
        animationFrameId = requestAnimationFrame(checkScroll);
        return;
      }

      const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.offsetHeight
      );

      if (currentScrollY !== lastScrollY || documentHeight !== lastDocHeight) {
        lastScrollY = currentScrollY;
        lastDocHeight = documentHeight;

        const scrollPosition = currentScrollY + window.innerHeight;
        const distanceFromBottom = documentHeight - scrollPosition;

        if (documentHeight < 1000) {
          setIsButtonSticky(true);
        } else {
          setIsButtonSticky((prevSticky) => {
            if (prevSticky) {
              return distanceFromBottom >= 150;
            } else {
              return distanceFromBottom >= 400;
            }
          });
        }
      }

      animationFrameId = requestAnimationFrame(checkScroll);
    };

    animationFrameId = requestAnimationFrame(checkScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isWorkoutConfigured]);

  if (loading) {
    return (
      <div className={`${theme.pageBg} min-h-screen pb-20 font-serif`}>
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-20">
          <p className={`text-xl ${theme.cardText}`}>Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`${theme.pageBg} min-h-screen pb-20 font-serif`}>
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-20 text-center">
          <h1 className={`text-3xl font-bold ${theme.headerText} mb-4 drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]`}>Session Expired</h1>
          <p className={`text-xl ${theme.cardText} mb-6`}>Please sign in to view your workout.</p>
          <p className={theme.cardTextSecondary}>Use the navigation bar above to sign in with Google.</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className={`${theme.pageBg} min-h-screen pb-20 font-serif`}>
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-20">
          <p className={`text-xl ${theme.cardText}`}>Workout not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme.pageBg} min-h-[150vh] pb-40 font-serif`}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-14 pb-20 min-h-screen">
        {/* Header with Title */}
        <div className="mb-8 flex items-start justify-between" data-header-section>
          <div>
            <h1 className={`text-4xl font-extrabold mb-2 ${theme.headerText} drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]`}>
              {actualMuscleGroup ? `${actualMuscleGroup.charAt(0).toUpperCase() + actualMuscleGroup.slice(1)} Day Overview` : 'Workout Overview'}
            </h1>
            <p className={`text-sm ${theme.cardTextSecondary} italic`}>
              {workout.type === 'program' ? "Following Jonathan's Hypertrophy Program" : 'Custom Workout'}
            </p>
          </div>

          {/* Start Workout Button - MOBILE ONLY - responsive to scroll position */}
          {isMobile && workout?.status === 'draft' && (
            <button
              onClick={handleStartWorkout}
              className={`bg-green-700 hover:bg-green-800 text-white font-bold rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] border-t border-l border-green-600 border-b-2 border-r-2 border-b-green-900 border-r-green-900 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] active:translate-y-0.5 transition-all whitespace-nowrap ${
                startButtonState === 'fixed'
                  ? 'fixed top-4 right-4 z-50 px-5 py-2.5 text-base'
                  : 'px-5 py-2.5 text-base'
              }`}
            >
              {hasActiveSession ? '▶️ Resume' : '▶️ Start'}
            </button>
          )}

          {/* Completed workout indicator - MOBILE ONLY */}
          {isMobile && workout?.status === 'completed' && (
            <div className={`bg-green-200 text-green-900 font-bold rounded-full border-2 border-green-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] whitespace-nowrap transition-all duration-300 ${
              startButtonState === 'fixed'
                ? 'fixed top-4 right-4 z-50 px-5 py-2.5 text-base'
                : 'px-5 py-2.5 text-base'
            }`}>
              ✓ Completed
            </div>
          )}
        </div>

        {/* Main workout section */}
        <div className={`mb-10 ${isSaving ? 'pointer-events-none opacity-50' : ''}`}>
          {isWorkoutConfigured && (
            <MuscleGroupWorkout
              muscleGroup={actualMuscleGroup}
              numberOfSets={actualNumberOfSets}
              setRangeLabel={setRangeLabel}
              previousExerciseData={previousWorkoutData?.exerciseData || previousWorkoutData?.inputs}
              onRemoveExercise={handleRemoveExerciseWithSave}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </div>

        {/* Workout Notes */}
        {isWorkoutConfigured && (
          <div className={`mb-10 ${isSaving ? 'pointer-events-none opacity-50' : ''}`}>
            <WorkoutNotesInput value={note} onChange={setNote} />
          </div>
        )}

        {/* Desktop Start Workout Button - centered, stacked above View Workouts */}
        {!isMobile && isWorkoutConfigured && workout?.status === 'draft' && (
          <div className="m-6 px-4 sm:px-20 flex justify-center">
            <button
              onClick={handleStartWorkout}
              className="w-full sm:w-auto px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] border-t border-l border-green-600 border-b-2 border-r-2 border-b-green-900 border-r-green-900 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] active:translate-y-0.5 transition-all"
            >
              {hasActiveSession ? '▶️ Resume Workout' : '▶️ Start Workout'}
            </button>
          </div>
        )}

        {/* Desktop Completed Indicator - centered */}
        {!isMobile && isWorkoutConfigured && workout?.status === 'completed' && (
          <div className="m-6 px-4 sm:px-20 flex justify-center">
            <div className="w-full sm:w-auto px-8 py-4 bg-green-200 text-green-900 font-semibold rounded-xl border-2 border-green-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] text-center">
              ✓ Workout Completed
            </div>
          </div>
        )}

        {/* View Workouts button */}
        {isWorkoutConfigured && (
          <div className="m-6 px-4 sm:px-20 flex justify-center">
            <Link to="/SavedWorkouts">
              <button
                disabled={isSaving}
                className={`w-full sm:w-auto px-8 py-4 rounded-xl text-white font-semibold transition-all ${
                  isSaving
                    ? 'bg-slate-400 cursor-not-allowed opacity-50'
                    : `${theme.btnPrimary}`
                }`}
              >
                View Workouts
              </button>
            </Link>
          </div>
        )}

        {/* Action buttons - sticky on mobile, centered on desktop */}
        {isWorkoutConfigured && (
          <div className={`flex flex-col space-y-4 ${
            isButtonSticky
              ? `fixed bottom-0 left-0 right-0 ${theme.pageBg} pt-6 pb-4 px-4 m-0 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.2)]`
              : 'm-6 px-4 sm:px-20'
          } sm:m-6 sm:px-20 sm:relative sm:shadow-none sm:pt-0 sm:pb-0 sm:items-center`}>
            {isGeneratingSummary && (
              <div className={`${theme.cardText} font-semibold animate-pulse text-center`}>
                🤖 Generating AI summary...
              </div>
            )}
            <button
              onClick={handleCompleteWorkout}
              disabled={isSaving}
              className={`w-full sm:w-auto px-8 py-4 rounded-xl text-white font-semibold transition-all ${
                isSaving
                  ? 'bg-slate-400 cursor-not-allowed opacity-50'
                  : 'bg-slate-700 hover:bg-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] border-t border-l border-slate-600 border-b-2 border-r-2 border-b-slate-900 border-r-slate-900 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] active:translate-y-0.5'
              }`}
            >
              {isSaving ? (isGeneratingSummary ? 'Generating Summary...' : 'Saving...') : 'Complete Workout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper component that provides workout context
function WorkoutPage() {
  return (
    <WorkoutProvider>
      <WorkoutPageContent />
    </WorkoutProvider>
  );
}

export default WorkoutPage;

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WeightRepsPicker from '../components/WeightRepsPicker';
import WorkoutProgress from '../components/WorkoutProgress';
import WorkoutSummary from '../components/WorkoutSummary';
import Navbar from '../components/Navbar';
import { WORKOUT_SETTINGS, formatDuration, formatTime } from '../config/workoutSettings';
import { getExerciseName, getPlaceholderForExercise, getDefaultExercises } from '../config/exerciseConfig';
import { getFirestore, collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import { useIsMobile } from '../hooks/useIsMobile';
import { useSettings } from '../contexts/SettingsContext';
import { displayWeight, saveWeight } from '../utils/weightConversion';
import { useTheme } from '../contexts/ThemeContext';

function StartWorkoutPage() {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const db = getFirestore();

  // Get workout data from navigation state
  const workoutData = location.state?.workoutData || null;

  // State
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [initialField, setInitialField] = useState('weight');
  const [showSummary, setShowSummary] = useState(false);
  const [workoutStartTime] = useState(Date.now());
  const [workoutName] = useState(workoutData?.workoutName || 'Workout');
  const [currentSetData, setCurrentSetData] = useState({ weight: '', reps: '' }); // Temp storage for current set
  const [lastSetCompletedTime, setLastSetCompletedTime] = useState(null); // Track when last set was completed
  const [restTimeElapsed, setRestTimeElapsed] = useState(0); // Current rest time
  const [editingFromTable, setEditingFromTable] = useState(null); // {exerciseIndex, setNumber} when editing from table

  // Check auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
      if (!currentUser) {
        // User logged out - redirect
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const workoutStartRef = useRef(workoutStartTime);

  // Mobile detection (using shared hook)
  const isMobile = useIsMobile();

  // Track if we've initialized (to prevent infinite loops)
  const initializedRef = useRef(false);
  const [latestWorkoutData, setLatestWorkoutData] = useState(null);

  // Fetch latest workout data from Firebase first
  useEffect(() => {
    const fetchLatestWorkout = async () => {
      const workoutId = workoutData?.workoutId;
      console.log('[StartWorkoutPage] Fetching latest workout data, workoutId:', workoutId);

      if (!workoutId || latestWorkoutData) {
        console.log('[StartWorkoutPage] Skipping fetch:', { hasWorkoutId: !!workoutId, hasLatestData: !!latestWorkoutData });
        return;
      }

      try {
        const workoutRef = doc(db, 'workoutLogs', workoutId);
        const workoutSnap = await getDoc(workoutRef);

        if (workoutSnap.exists()) {
          const firestoreData = workoutSnap.data();
          console.log('[StartWorkoutPage] Fetched Firebase data, exerciseData keys:', Object.keys(firestoreData.exerciseData || {}));
          // Merge navigation state with latest Firebase data
          setLatestWorkoutData({
            ...workoutData,
            exerciseData: firestoreData.exerciseData || workoutData.exerciseData,
            showCardio: firestoreData.showCardio ?? workoutData.showCardio,
            showAbs: firestoreData.showAbs ?? workoutData.showAbs,
          });
        } else {
          console.log('[StartWorkoutPage] Workout not found in Firebase, using navigation state');
          setLatestWorkoutData(workoutData);
        }
      } catch (error) {
        console.error('[StartWorkoutPage] Error fetching latest workout:', error);
        setLatestWorkoutData(workoutData);
      }
    };

    if (workoutData) {
      fetchLatestWorkout();
    } else {
      console.log('[StartWorkoutPage] No workoutData available');
    }
  }, [workoutData, db]);

  // Initialize exercises from workout data
  useEffect(() => {
    console.log('[StartWorkoutPage] Initialization check:', {
      hasWorkoutData: !!workoutData,
      hasLatestWorkoutData: !!latestWorkoutData,
      isInitialized: initializedRef.current
    });

    // If no workoutData at all, redirect home
    if (!workoutData) {
      console.log('[StartWorkoutPage] No workoutData, redirecting to home');
      navigate('/');
      return;
    }

    // Wait for latestWorkoutData to be fetched
    if (!latestWorkoutData) {
      console.log('[StartWorkoutPage] Waiting for latestWorkoutData to be fetched');
      return;
    }

    // Only initialize once
    if (initializedRef.current) {
      console.log('[StartWorkoutPage] Already initialized, skipping');
      return;
    }

    console.log('[StartWorkoutPage] Initializing exercises from latestWorkoutData');

    // Initialize from latest workout data (already contains completed sets from Firebase)
    const workoutDataToUse = latestWorkoutData;
    // Convert workout data to exercise array
    const exerciseArray = [];
    const exerciseDataKeys = Object.keys(workoutDataToUse.exerciseData || {});

    // Separate keys into cardio, abs, and main exercises
    const cardioKeys = exerciseDataKeys.filter(k => k.startsWith('cardio') || k.startsWith('custom_cardio'));
    const absKeys = exerciseDataKeys.filter(k => k.startsWith('abs') || k.startsWith('custom_abs'));
    const mainKeys = exerciseDataKeys.filter(k => !cardioKeys.includes(k) && !absKeys.includes(k));

    // If exerciseData is empty, generate from muscle group defaults
    if (mainKeys.length === 0 && workoutDataToUse.selectedMuscleGroup) {
      const defaultExercises = getDefaultExercises(workoutDataToUse.selectedMuscleGroup);
      defaultExercises.forEach(defEx => {
        exerciseArray.push({
          key: defEx.id,
          exerciseName: getExerciseName(defEx.selected),
          totalSets: workoutDataToUse.numberOfSets || 4,
          completedSets: [],
        });
      });
    } else {
      // Use existing main exerciseData
      mainKeys.forEach(key => {
        const exercise = workoutDataToUse.exerciseData[key];
        const exerciseName = exercise.exerciseName || getExerciseName(key);
        const totalSets = workoutDataToUse.numberOfSets || exercise.sets?.length || 4;

        // Include exercise if it has a name, even if no sets are entered yet
        if (exerciseName) {
          exerciseArray.push({
            key,
            exerciseName,
            totalSets,
            completedSets: [],
          });
        }
      });
    }

    // Process cardio exercises if showCardio is true
    if (workoutDataToUse.showCardio) {
      if (cardioKeys.length > 0) {
        // Use existing cardio data
        cardioKeys.forEach(key => {
          const exercise = workoutDataToUse.exerciseData[key];
          const exerciseName = exercise.exerciseName || getExerciseName(key) || 'Cardio';

          exerciseArray.push({
            key,
            exerciseName,
            totalSets: 1, // Cardio has 1 entry with multiple fields
            completedSets: [],
          });
        });
      } else {
        // Add default cardio exercise
        exerciseArray.push({
          key: 'cardio_section',
          exerciseName: 'Treadmill',
          totalSets: 1, // Cardio has 1 entry
          completedSets: [],
        });
      }
    }

    // Process abs exercises if showAbs is true
    if (workoutDataToUse.showAbs) {
      if (absKeys.length > 0) {
        // Use existing abs data
        absKeys.forEach(key => {
          const exercise = workoutDataToUse.exerciseData[key];
          const exerciseName = exercise.exerciseName || getExerciseName(key) || 'Abs';
          const totalSets = exercise.sets?.length || workoutDataToUse.numberOfSets || 4;

          exerciseArray.push({
            key,
            exerciseName,
            totalSets,
            completedSets: [],
          });
        });
      } else {
        // Add default abs exercise
        exerciseArray.push({
          key: 'abs_section',
          exerciseName: 'Ab Crunch Machine',
          totalSets: workoutDataToUse.numberOfSets || 4,
          completedSets: [],
        });
      }
    }

    // Reorder based on cardioAtTop and absAtTop
    const finalExercises = [];
    const mainExercises = exerciseArray.filter(e => !e.key.startsWith('cardio') && !e.key.startsWith('abs') && !e.key.startsWith('custom_cardio') && !e.key.startsWith('custom_abs'));
    const cardioExercises = exerciseArray.filter(e => e.key.startsWith('cardio') || e.key.startsWith('custom_cardio'));
    const absExercises = exerciseArray.filter(e => e.key.startsWith('abs') || e.key.startsWith('custom_abs'));

    if (workoutDataToUse.cardioAtTop) finalExercises.push(...cardioExercises);
    if (workoutDataToUse.absAtTop) finalExercises.push(...absExercises);
    finalExercises.push(...mainExercises);
    if (!workoutDataToUse.cardioAtTop) finalExercises.push(...cardioExercises);
    if (!workoutDataToUse.absAtTop) finalExercises.push(...absExercises);

    // Parse completed sets from Firebase exerciseData
    finalExercises.forEach(exercise => {
      const exerciseData = workoutDataToUse.exerciseData[exercise.key];
      if (exerciseData && exerciseData.sets) {
        const completedSets = [];
        exerciseData.sets.forEach((setString, index) => {
          if (setString && setString.trim()) {
            // Parse "50x12" or just "12" format
            const match = setString.match(/^(\d+)x(\d+)$/);
            if (match) {
              completedSets.push({
                setNumber: index + 1,
                weight: match[1],
                reps: match[2],
                completedAt: Date.now(),
                restDuration: 0,
              });
            } else {
              // Just reps (bodyweight/timed exercise)
              completedSets.push({
                setNumber: index + 1,
                weight: '',
                reps: setString.trim(),
                completedAt: Date.now(),
                restDuration: 0,
              });
            }
          }
        });
        exercise.completedSets = completedSets;
      }
    });

    // Calculate where to resume based on completed sets
    let totalCompleted = 0;
    for (const exercise of finalExercises) {
      totalCompleted += exercise.completedSets.length;
    }
    setCurrentSetIndex(totalCompleted);

    setExercises(finalExercises);
    initializedRef.current = true;
  }, [workoutData, latestWorkoutData, navigate, workoutName]);

  // Calculate total sets across all exercises
  const totalSets = exercises.reduce((sum, ex) => sum + ex.totalSets, 0);
  const completedSetsCount = exercises.reduce((sum, ex) => sum + ex.completedSets.length, 0);

  // Get current exercise and set number
  let currentExerciseIndex = 0;
  let currentSetNumber = 0;
  let accumulatedSets = 0;

  for (let i = 0; i < exercises.length; i++) {
    if (currentSetIndex < accumulatedSets + exercises[i].totalSets) {
      currentExerciseIndex = i;
      currentSetNumber = currentSetIndex - accumulatedSets + 1;
      break;
    }
    accumulatedSets += exercises[i].totalSets;
  }

  const currentExercise = exercises[currentExerciseIndex];

  // Total workout timer (live update)
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsedSeconds = Math.floor((currentTime - workoutStartRef.current) / 1000);

  // Update rest timer
  useEffect(() => {
    if (lastSetCompletedTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lastSetCompletedTime) / 1000);
        setRestTimeElapsed(elapsed);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [lastSetCompletedTime]);

  // Open picker
  const handleOpenPicker = (field = 'weight') => {
    setInitialField(field);
    setPickerOpen(true);
  };

  // Update current set data from picker
  const handlePickerSave = (weight, reps) => {
    if (editingFromTable) {
      // Editing from expanded table
      handleUpdateSetFromTable(editingFromTable.exerciseIndex, editingFromTable.setNumber, 'weight', weight);
      handleUpdateSetFromTable(editingFromTable.exerciseIndex, editingFromTable.setNumber, 'reps', reps);
      setEditingFromTable(null);
    } else {
      // Editing current set in flash card
      setCurrentSetData({ weight, reps });
    }
  };

  // Auto-save workout progress to Firebase
  const saveProgressToFirebase = async (updatedExercises) => {
    const workoutId = workoutData?.workoutId;
    if (!workoutId) return;

    try {
      const completedExerciseData = {};

      // Convert exercises to exerciseData format, preserving original sets structure
      updatedExercises.forEach(exercise => {
        // Create an array with the correct total number of sets
        const setsArray = new Array(exercise.totalSets).fill('');

        // Fill in the completed sets
        exercise.completedSets.forEach(set => {
          const setIndex = set.setNumber - 1; // Convert to 0-based index
          if (setIndex >= 0 && setIndex < setsArray.length) {
            if (set.weight) {
              setsArray[setIndex] = `${set.weight}x${set.reps}`;
            } else {
              setsArray[setIndex] = set.reps;
            }
          }
        });

        completedExerciseData[exercise.key] = {
          exerciseName: exercise.exerciseName,
          sets: setsArray,
        };
      });

      const workoutRef = doc(db, 'workoutLogs', workoutId);
      await updateDoc(workoutRef, {
        exerciseData: completedExerciseData,
        lastModified: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error auto-saving progress:', error);
      // Don't block the user experience if auto-save fails
    }
  };

  // Complete the current set
  const handleCompleteSet = async () => {
    if (!currentExercise || (!currentSetData.weight && !currentSetData.reps)) return;

    const completedSet = {
      setNumber: currentSetNumber,
      weight: currentSetData.weight || '',
      reps: currentSetData.reps || '',
      completedAt: Date.now(),
      restDuration: restTimeElapsed, // Record actual rest time taken
    };

    // Update exercise with completed set
    const updatedExercises = [...exercises];

    // Check if this set is already completed (editing), replace it
    const existingSetIndex = updatedExercises[currentExerciseIndex].completedSets.findIndex(
      s => s.setNumber === currentSetNumber
    );

    if (existingSetIndex >= 0) {
      updatedExercises[currentExerciseIndex].completedSets[existingSetIndex] = completedSet;
    } else {
      updatedExercises[currentExerciseIndex].completedSets.push(completedSet);
    }

    setExercises(updatedExercises);

    // Auto-save to Firebase
    await saveProgressToFirebase(updatedExercises);

    // Clear current set data
    setCurrentSetData({ weight: '', reps: '' });

    // Start rest timer for next set
    setLastSetCompletedTime(Date.now());
    setRestTimeElapsed(0);

    // Move to next set (unless it's the last set)
    if (currentSetIndex < totalSets - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
      loadSetData(currentSetIndex + 1);
    } else {
      // Workout complete!
      setShowSummary(true);
    }
  };


  // Navigate to previous set
  const handlePrevious = () => {
    if (currentSetIndex > 0) {
      setCurrentSetIndex(currentSetIndex - 1);
      // Load data from that set if it exists
      loadSetData(currentSetIndex - 1);
    }
  };

  // Load set data when navigating
  const loadSetData = (setIdx) => {
    // Calculate which exercise and set number
    let exerciseIdx = 0;
    let setNum = 0;
    let accumulated = 0;

    for (let i = 0; i < exercises.length; i++) {
      if (setIdx < accumulated + exercises[i].totalSets) {
        exerciseIdx = i;
        setNum = setIdx - accumulated + 1;
        break;
      }
      accumulated += exercises[i].totalSets;
    }

    const exercise = exercises[exerciseIdx];
    const existingSet = exercise?.completedSets?.find(s => s.setNumber === setNum);

    if (existingSet) {
      setCurrentSetData({ weight: existingSet.weight, reps: existingSet.reps });
    } else {
      setCurrentSetData({ weight: '', reps: '' });
    }
  };

  // State for pause indicator
  const [isPaused, setIsPaused] = useState(false);

  // Pause workout
  const handlePauseWorkout = () => {
    // Session is already auto-saved to localStorage
    setIsPaused(!isPaused);
  };

  // End workout early
  const handleEndWorkout = () => {
    const confirmEnd = window.confirm(
      `Are you sure you want to end this workout?\n\n` +
      `You've completed ${completedSetsCount}/${totalSets} sets.\n\n` +
      `This will finish your workout and show the summary.`
    );

    if (confirmEnd) {
      setShowSummary(true);
    }
  };

  // Save workout to Firebase
  const handleSaveWorkout = async ({ duration, averageRest }) => {
    try {
      const completedExerciseData = {};

      // Add completed sets to exerciseData, preserving original sets structure
      exercises.forEach(exercise => {
        // Create an array with the correct total number of sets
        const setsArray = new Array(exercise.totalSets).fill('');

        // Fill in the completed sets
        exercise.completedSets.forEach(set => {
          const setIndex = set.setNumber - 1; // Convert to 0-based index
          if (setIndex >= 0 && setIndex < setsArray.length) {
            if (set.weight) {
              setsArray[setIndex] = `${set.weight}x${set.reps}`;
            } else {
              setsArray[setIndex] = set.reps;
            }
          }
        });

        completedExerciseData[exercise.key] = {
          exerciseName: exercise.exerciseName,
          sets: setsArray,
        };
      });

      // Update the existing workout in workoutLogs
      const workoutId = workoutData?.workoutId;
      if (!workoutId) {
        throw new Error('No workout ID found');
      }

      const workoutRef = doc(db, 'workoutLogs', workoutId);
      await updateDoc(workoutRef, {
        status: 'completed',
        exerciseData: completedExerciseData,
        duration,
        averageRest,
        completedSets: completedSetsCount,
        totalSets,
        completedAt: serverTimestamp(),
        lastModified: serverTimestamp(),
      });

      // Navigate to the completed workout page
      navigate(`/SavedWorkout/${workoutId}`);
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout. Please try again.');
    }
  };

  // Discard workout
  const handleDiscardWorkout = () => {
    navigate('/');
  };

  // Load current set data when currentSetIndex changes
  useEffect(() => {
    loadSetData(currentSetIndex);
  }, [currentSetIndex, exercises]);

  // Open picker from expanded table
  const handleOpenPickerFromTable = (exerciseIndex, setNumber, field, currentWeight, currentReps) => {
    setEditingFromTable({ exerciseIndex, setNumber });
    setCurrentSetData({ weight: currentWeight, reps: currentReps });
    setInitialField(field);
    setPickerOpen(true);
  };

  // Reorder exercises
  const handleReorderExercise = (index, direction) => {
    const newExercises = [...exercises];
    if (direction === 'up' && index > 0) {
      [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
    } else if (direction === 'down' && index < exercises.length - 1) {
      [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
    }
    setExercises(newExercises);
  };

  // Handle updates from expanded table view in WorkoutProgress
  const handleUpdateSetFromTable = (exerciseIndex, setNumber, field, value) => {
    const updatedExercises = [...exercises];
    const exercise = updatedExercises[exerciseIndex];

    // Find or create the set
    let set = exercise.completedSets.find(s => s.setNumber === setNumber);

    if (set) {
      // Update existing set
      set[field] = value;
      set.completedAt = set.completedAt || Date.now();

      // Remove set if both weight and reps are empty
      if (!set.weight && !set.reps) {
        exercise.completedSets = exercise.completedSets.filter(s => s.setNumber !== setNumber);
      }
    } else if (value) {
      // Only create new set if value is not empty
      set = {
        setNumber,
        weight: field === 'weight' ? value : '',
        reps: field === 'reps' ? value : '',
        completedAt: Date.now(),
        restDuration: 0,
      };
      exercise.completedSets.push(set);
      // Sort by set number
      exercise.completedSets.sort((a, b) => a.setNumber - b.setNumber);
    }

    setExercises(updatedExercises);
  };

  // Determine exercise type for picker
  const isCardioExercise = currentExercise?.key?.startsWith('cardio') || currentExercise?.key?.startsWith('custom_cardio');

  const placeholder = getPlaceholderForExercise(currentExercise?.key || '');
  const isCardio = isCardioExercise || placeholder.includes('min') || placeholder.includes('mi');
  const isTimed = placeholder.includes('Duration') || placeholder.includes('sec');
  let exerciseType = 'weight';
  if (isCardio) exerciseType = 'cardio';
  else if (isTimed) exerciseType = 'timed';
  else if (placeholder === 'Reps') exerciseType = 'bodyweight';

  // Show loading state while fetching workout data
  if (!latestWorkoutData || exercises.length === 0) {
    return (
      <div className={`min-h-screen ${theme.pageBg} flex items-center justify-center p-4`}>
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-slate-600"></div>
      </div>
    );
  }

  // Show error state if no current exercise after loading
  if (!currentExercise) {
    return (
      <div className={`min-h-screen ${theme.pageBg} flex items-center justify-center p-4`}>
        <div className={`${theme.cardBg} rounded-xl p-8 max-w-md`}>
          <h2 className={`text-2xl font-bold ${theme.headerText} mb-4 drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]`}>⚠️ No Workout Data</h2>
          <p className={`${theme.cardTextSecondary} mb-6`}>
            No exercises found in this workout. Please create a workout with exercises first.
          </p>
          <div className={`${theme.cardBgSecondary} rounded p-3 mb-6 text-xs text-left`}>
            <p className={`font-semibold mb-1 ${theme.cardText}`}>Debug Info:</p>
            <p className={theme.cardTextSecondary}>Workout Name: {workoutName || 'N/A'}</p>
            <p className={theme.cardTextSecondary}>Total Exercises: {exercises.length}</p>
            <p className={theme.cardTextSecondary}>Exercise Data Keys: {workoutData ? Object.keys(workoutData.exerciseData || {}).length : 0}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className={`px-6 py-3 ${theme.btnPrimary} ${theme.btnPrimaryText} rounded-lg font-semibold w-full`}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className={`min-h-screen ${theme.pageBg} pb-20 flex items-center justify-center`}>
        <p className={`text-xl ${theme.cardText}`}>Loading...</p>
      </div>
    );
  }

  // Show auth required message if not logged in
  if (!user) {
    return (
      <div className={`min-h-screen ${theme.pageBg} font-serif`}>
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-20 text-center">
          <h1 className={`text-3xl font-bold ${theme.headerText} mb-4 drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]`}>Session Expired</h1>
          <p className={`text-xl ${theme.cardText} mb-6`}>Please sign in to start your workout.</p>
          <p className={theme.cardTextSecondary}>Use the navigation bar above to sign in with Google.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.pageBg} pb-20`}>
      {/* Header with timer */}
      <div className={`${theme.cardBg} shadow-md sticky top-0 z-40`}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-xl font-bold ${theme.headerText} drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]`}>
                {workoutName}
                {isPaused && <span className="ml-2 text-yellow-600">⏸️ PAUSED</span>}
              </h1>
              <p className={`text-sm ${theme.cardTextSecondary}`}>⏱️ {formatDuration(elapsedSeconds)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/workout/${workoutData?.workoutId}`)}
                className={`px-4 py-2 ${theme.btnPrimary} ${theme.btnPrimaryText} rounded-lg font-medium text-sm`}
              >
                ← Overview
              </button>
              <button
                onClick={handlePauseWorkout}
                className={`px-4 py-2 text-white rounded-lg font-medium text-sm shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] border-t border-l border-b-2 border-r-2 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] active:translate-y-0.5 transition-all ${
                  isPaused
                    ? 'bg-green-600 hover:bg-green-700 border-green-500 border-b-green-800 border-r-green-800'
                    : 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500 border-b-yellow-800 border-r-yellow-800'
                }`}
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button
                onClick={handleEndWorkout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] border-t border-l border-red-500 border-b-2 border-r-2 border-b-red-800 border-r-red-800 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] active:translate-y-0.5 transition-all"
              >
                🛑 End
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress Bar at Top */}
        <div className={`mb-6 ${theme.cardBg} rounded-xl p-4`}>
          <p className={`text-lg font-semibold ${theme.cardText} mb-2 text-center`}>
            Progress: {completedSetsCount}/{totalSets} sets completed
          </p>
          <div className={`w-full ${theme.cardBgSecondary} rounded-full h-3`}>
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
              style={{ width: `${(completedSetsCount / totalSets) * 100}%` }}
            />
          </div>
        </div>

        {/* Flash Card */}
        <div className={`${theme.cardBg} rounded-xl p-8 mb-6 relative`}>
          {/* Rest Timer - Top Right */}
          {lastSetCompletedTime && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {/* Light Indicator */}
              <div
                className={`w-3 h-3 rounded-full ${
                  restTimeElapsed >= WORKOUT_SETTINGS.DEFAULT_REST_DURATION
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-red-500'
                }`}
              />
              {/* Timer */}
              <div className={`text-sm font-semibold ${theme.cardTextSecondary}`}>
                {restTimeElapsed >= WORKOUT_SETTINGS.DEFAULT_REST_DURATION ? (
                  <span className="text-green-600">Ready!</span>
                ) : (
                  <span>Rest: {formatTime(WORKOUT_SETTINGS.DEFAULT_REST_DURATION - restTimeElapsed)}</span>
                )}
              </div>
            </div>
          )}

          {/* Exercise Name */}
          <div className="text-center mb-6">
            <h2 className={`text-3xl font-bold ${theme.headerText} mb-2 drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]`}>
              {currentExercise.exerciseName}
            </h2>
            {!isCardioExercise && (
              <p className={`text-lg ${theme.cardTextSecondary}`}>
                Set {currentSetNumber} of {currentExercise.totalSets}
              </p>
            )}
          </div>

          {/* Input Fields */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex-1 max-w-[150px]">
              <label className={`text-sm ${theme.cardTextSecondary} font-medium mb-2 block text-center`}>
                {isCardio ? 'Distance (mi)' : `Weight (${settings.weightUnit})`}
              </label>
              {isMobile ? (
                <button
                  onClick={() => handleOpenPicker('weight')}
                  className={`w-full px-4 py-4 rounded-xl text-2xl font-bold text-center transition-all border-2 ${
                    currentSetData.weight
                      ? `${theme.cardBgSecondary} ${theme.cardText} border-slate-400`
                      : `${theme.inputBg} ${theme.cardTextSecondary} ${theme.inputBorder}`
                  }`}
                >
                  {displayWeight(currentSetData.weight, settings.weightUnit) || '---'}
                </button>
              ) : (
                <input
                  type="number"
                  step={isCardio ? "0.1" : "0.5"}
                  value={displayWeight(currentSetData.weight, settings.weightUnit)}
                  onChange={(e) => setCurrentSetData({ ...currentSetData, weight: saveWeight(e.target.value, settings.weightUnit) })}
                  placeholder={isCardio ? 'mi' : settings.weightUnit}
                  className={`w-full px-4 py-4 rounded-xl text-2xl font-bold text-center border-2 ${theme.inputBorder} focus:border-slate-500 focus:outline-none transition-all ${theme.inputBg}`}
                />
              )}
            </div>

            <div className="flex-1 max-w-[150px]">
              <label className={`text-sm ${theme.cardTextSecondary} font-medium mb-2 block text-center`}>
                {isCardio ? 'Time (min)' : isTimed ? 'Seconds' : 'Reps'}
              </label>
              {isMobile ? (
                <button
                  onClick={() => handleOpenPicker('reps')}
                  className={`w-full px-4 py-4 rounded-xl text-2xl font-bold text-center transition-all border-2 ${
                    currentSetData.reps
                      ? `${theme.cardBgSecondary} ${theme.cardText} border-slate-400`
                      : `${theme.inputBg} ${theme.cardTextSecondary} ${theme.inputBorder}`
                  }`}
                >
                  {currentSetData.reps || '---'}
                </button>
              ) : (
                <input
                  type="number"
                  step={isCardio ? "0.1" : "1"}
                  value={currentSetData.reps}
                  onChange={(e) => setCurrentSetData({ ...currentSetData, reps: e.target.value })}
                  placeholder={isCardio ? 'min' : isTimed ? 'sec' : 'reps'}
                  className={`w-full px-4 py-4 rounded-xl text-2xl font-bold text-center border-2 ${theme.inputBorder} focus:border-slate-500 focus:outline-none transition-all ${theme.inputBg}`}
                />
              )}
            </div>
          </div>

          {/* Complete Set Button */}
          <button
            onClick={() => {
              if (currentSetData.weight || currentSetData.reps) {
                handleCompleteSet();
              } else {
                handleOpenPicker(isCardio ? 'reps' : 'weight');
              }
            }}
            className="w-full py-4 rounded-xl font-bold text-lg bg-green-700 hover:bg-green-800 text-white shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] border-t border-l border-green-600 border-b-2 border-r-2 border-b-green-900 border-r-green-900 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] active:translate-y-0.5 transition-all"
          >
            ✓ Complete Set
          </button>

          {/* Navigation Button */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePrevious}
              disabled={currentSetIndex === 0}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                currentSetIndex === 0
                  ? `${theme.cardBgSecondary} ${theme.cardTextSecondary} cursor-not-allowed opacity-50`
                  : `${theme.btnSecondary} ${theme.btnSecondaryText}`
              }`}
            >
              ← Previous Set
            </button>
          </div>
        </div>
      </div>

      {/* Weight/Reps Picker Modal */}
      <WeightRepsPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        weight={currentSetData.weight}
        reps={currentSetData.reps}
        onSave={(weight, reps) => {
          handlePickerSave(weight, reps);
          setPickerOpen(false);
        }}
        exerciseType={exerciseType}
        initialField={initialField}
      />

      {/* Workout Summary */}
      {showSummary && (
        <WorkoutSummary
          workoutName={workoutName}
          startTime={workoutStartRef.current}
          endTime={Date.now()}
          exercises={exercises}
          onSave={handleSaveWorkout}
          onDiscard={handleDiscardWorkout}
        />
      )}
    </div>
  );
}

export default StartWorkoutPage;

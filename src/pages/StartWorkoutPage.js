import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WeightRepsPicker from '../components/WeightRepsPicker';
import WorkoutProgress from '../components/WorkoutProgress';
import WorkoutSummary from '../components/WorkoutSummary';
import { STORAGE_KEYS, WORKOUT_SETTINGS, formatDuration, formatTime } from '../config/workoutSettings';
import { getExerciseName, getPlaceholderForExercise, getDefaultExercises } from '../config/exerciseConfig';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { saveWorkoutSession, loadWorkoutSession, clearWorkoutSession } from '../utils/sessionPersistence';

function StartWorkoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const db = getFirestore();

  // Try to recover workoutData from location.state or localStorage
  const getInitialWorkoutData = () => {
    // First try location.state (normal flow)
    if (location.state?.workoutData) {
      return location.state.workoutData;
    }

    // If page was refreshed, try to recover from session persistence
    const savedSession = loadWorkoutSession();
    if (savedSession) {
      return savedSession.workoutData;
    }

    return null;
  };

  const workoutData = getInitialWorkoutData();

  // State
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
  const [isMobile, setIsMobile] = useState(false); // Mobile detection
  const [editingFromTable, setEditingFromTable] = useState(null); // {exerciseIndex, setNumber} when editing from table

  const workoutStartRef = useRef(workoutStartTime);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's sm breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize exercises from workout data
  useEffect(() => {
    if (!workoutData) {
      navigate('/');
      return;
    }

    // Check if we have a saved session to restore from
    const savedSession = loadWorkoutSession();
    if (savedSession) {
      // Verify the session matches the current workout
      if (savedSession.workoutName === workoutName) {
        // Restore full session state
        setExercises(savedSession.exercises);
        setCurrentSetIndex(savedSession.currentSetIndex || 0);
        workoutStartRef.current = savedSession.startTime;
        console.log('[StartWorkoutPage] Restored workout session');
        return; // Skip initializing from scratch
      }
    }

    // No saved session or session doesn't match - initialize from workout data
    // Convert workout data to exercise array
    const exerciseArray = [];
    const exerciseDataKeys = Object.keys(workoutData.exerciseData || {});

    // Separate keys into cardio, abs, and main exercises
    const cardioKeys = exerciseDataKeys.filter(k => k.startsWith('cardio') || k.startsWith('custom_cardio'));
    const absKeys = exerciseDataKeys.filter(k => k.startsWith('abs') || k.startsWith('custom_abs'));
    const mainKeys = exerciseDataKeys.filter(k => !cardioKeys.includes(k) && !absKeys.includes(k));

    // If exerciseData is empty, generate from muscle group defaults
    if (mainKeys.length === 0 && workoutData.selectedMuscleGroup) {
      const defaultExercises = getDefaultExercises(workoutData.selectedMuscleGroup);
      defaultExercises.forEach(defEx => {
        exerciseArray.push({
          key: defEx.id,
          exerciseName: getExerciseName(defEx.selected),
          totalSets: workoutData.numberOfSets || 4,
          completedSets: [],
        });
      });
    } else {
      // Use existing main exerciseData
      mainKeys.forEach(key => {
        const exercise = workoutData.exerciseData[key];
        const exerciseName = exercise.exerciseName || getExerciseName(key);
        const totalSets = workoutData.numberOfSets || exercise.sets?.length || 4;

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
    if (workoutData.showCardio) {
      if (cardioKeys.length > 0) {
        // Use existing cardio data
        cardioKeys.forEach(key => {
          const exercise = workoutData.exerciseData[key];
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
    if (workoutData.showAbs) {
      if (absKeys.length > 0) {
        // Use existing abs data
        absKeys.forEach(key => {
          const exercise = workoutData.exerciseData[key];
          const exerciseName = exercise.exerciseName || getExerciseName(key) || 'Abs';
          const totalSets = exercise.sets?.length || workoutData.numberOfSets || 4;

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
          totalSets: workoutData.numberOfSets || 4,
          completedSets: [],
        });
      }
    }

    // Reorder based on cardioAtTop and absAtTop
    const finalExercises = [];
    const mainExercises = exerciseArray.filter(e => !e.key.startsWith('cardio') && !e.key.startsWith('abs') && !e.key.startsWith('custom_cardio') && !e.key.startsWith('custom_abs'));
    const cardioExercises = exerciseArray.filter(e => e.key.startsWith('cardio') || e.key.startsWith('custom_cardio'));
    const absExercises = exerciseArray.filter(e => e.key.startsWith('abs') || e.key.startsWith('custom_abs'));

    if (workoutData.cardioAtTop) finalExercises.push(...cardioExercises);
    if (workoutData.absAtTop) finalExercises.push(...absExercises);
    finalExercises.push(...mainExercises);
    if (!workoutData.cardioAtTop) finalExercises.push(...cardioExercises);
    if (!workoutData.absAtTop) finalExercises.push(...absExercises);

    setExercises(finalExercises);
  }, [workoutData, navigate, workoutName]);

  // Save session to localStorage whenever state changes
  useEffect(() => {
    if (exercises.length > 0) {
      const session = {
        workoutName,
        startTime: workoutStartRef.current,
        currentSetIndex,
        exercises,
        // Include original workoutData for restoration in HypertrophyPage
        workoutData: {
          selectedMuscleGroup: workoutData?.selectedMuscleGroup,
          numberOfSets: workoutData?.numberOfSets,
          showCardio: workoutData?.showCardio,
          showAbs: workoutData?.showAbs,
          cardioAtTop: workoutData?.cardioAtTop,
          absAtTop: workoutData?.absAtTop,
          note: workoutData?.note,
          templateId: workoutData?.templateId,
          templateName: workoutData?.templateName,
        },
      };
      saveWorkoutSession(session);
    }
  }, [exercises, currentSetIndex, workoutName, workoutData]);

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

  // Complete the current set
  const handleCompleteSet = () => {
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

  // Pause workout and go home
  const handlePauseWorkout = () => {
    // Session is already saved to localStorage
    navigate('/');
  };

  // End workout early
  const handleEndWorkout = () => {
    setShowSummary(true);
  };

  // Save workout to Firebase
  const handleSaveWorkout = async ({ duration, averageRest }) => {
    try {
      const workoutToSave = {
        workoutName,
        muscleGroup: workoutData.selectedMuscleGroup,
        numberOfSets: workoutData.numberOfSets,
        exerciseData: {},
        note: workoutData.note || '',
        timestamp: workoutStartRef.current,
        duration,
        averageRest,
        completedSets: completedSetsCount,
        totalSets,
      };

      // Add completed sets to exerciseData
      exercises.forEach(exercise => {
        workoutToSave.exerciseData[exercise.key] = {
          exerciseName: exercise.exerciseName,
          sets: exercise.completedSets.map(set => {
            if (set.weight) {
              return `${set.weight}x${set.reps}`;
            }
            return set.reps;
          }),
        };
      });

      await addDoc(collection(db, 'workouts'), workoutToSave);

      // Clear localStorage session
      clearWorkoutSession();

      // Navigate to saved workouts
      navigate('/saved-workouts');
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout. Please try again.');
    }
  };

  // Discard workout
  const handleDiscardWorkout = () => {
    clearWorkoutSession();
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

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">⚠️ No Workout Data</h2>
          <p className="text-gray-600 mb-6">
            No exercises found in this workout. Please create a workout with exercises first.
          </p>
          <div className="bg-gray-100 rounded p-3 mb-6 text-xs text-left">
            <p className="font-semibold mb-1">Debug Info:</p>
            <p>Workout Name: {workoutName || 'N/A'}</p>
            <p>Total Exercises: {exercises.length}</p>
            <p>Exercise Data Keys: {workoutData ? Object.keys(workoutData.exerciseData || {}).length : 0}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 w-full"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pb-20">
      {/* Header with timer */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{workoutName}</h1>
              <p className="text-sm text-gray-600">⏱️ {formatDuration(elapsedSeconds)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/Hypertrophy')}
                className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm"
                title="Edit workout"
              >
                ⚙️
              </button>
              <button
                onClick={handlePauseWorkout}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors text-sm"
              >
                ⏸️ Pause
              </button>
              <button
                onClick={handleEndWorkout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm"
              >
                🛑 End
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress */}
        <WorkoutProgress
          exercises={exercises}
          currentSetIndex={currentSetIndex}
          onUpdateSet={handleUpdateSetFromTable}
          onOpenPicker={handleOpenPickerFromTable}
          onReorderExercise={handleReorderExercise}
        />

        {/* Flash Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 relative">
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
              <div className="text-sm font-semibold text-gray-600">
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
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {currentExercise.exerciseName}
            </h2>
            {!isCardioExercise && (
              <p className="text-lg text-gray-600">
                Set {currentSetNumber} of {currentExercise.totalSets}
              </p>
            )}
          </div>

          {/* Input Fields */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex-1 max-w-[150px]">
              <label className="text-sm text-gray-600 font-medium mb-2 block text-center">
                {isCardio ? 'Distance (mi)' : 'Weight (lbs)'}
              </label>
              {isMobile ? (
                <button
                  onClick={() => handleOpenPicker('weight')}
                  className={`w-full px-4 py-4 rounded-xl text-2xl font-bold text-center transition-all border-2 ${
                    currentSetData.weight
                      ? 'bg-blue-100 text-blue-700 border-blue-500'
                      : 'bg-gray-100 text-gray-400 border-gray-300'
                  }`}
                >
                  {currentSetData.weight || '---'}
                </button>
              ) : (
                <input
                  type="number"
                  step={isCardio ? "0.1" : "0.5"}
                  value={currentSetData.weight}
                  onChange={(e) => setCurrentSetData({ ...currentSetData, weight: e.target.value })}
                  placeholder={isCardio ? 'mi' : 'lbs'}
                  className="w-full px-4 py-4 rounded-xl text-2xl font-bold text-center border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-all"
                />
              )}
            </div>

            <div className="flex-1 max-w-[150px]">
              <label className="text-sm text-gray-600 font-medium mb-2 block text-center">
                {isCardio ? 'Time (min)' : isTimed ? 'Seconds' : 'Reps'}
              </label>
              {isMobile ? (
                <button
                  onClick={() => handleOpenPicker('reps')}
                  className={`w-full px-4 py-4 rounded-xl text-2xl font-bold text-center transition-all border-2 ${
                    currentSetData.reps
                      ? 'bg-blue-100 text-blue-700 border-blue-500'
                      : 'bg-gray-100 text-gray-400 border-gray-300'
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
                  className="w-full px-4 py-4 rounded-xl text-2xl font-bold text-center border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-all"
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
            className="w-full py-4 rounded-xl font-bold text-lg transition-all bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
          >
            ✓ Complete Set
          </button>

          {/* Navigation Button */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePrevious}
              disabled={currentSetIndex === 0}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                currentSetIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
              }`}
            >
              ← Previous Set
            </button>
          </div>
        </div>

        {/* Set Counter */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">
            Progress: {completedSetsCount}/{totalSets} sets completed
          </p>
          <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedSetsCount / totalSets) * 100}%` }}
            />
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

import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth } from '../firebase'; // Make sure auth is imported
import db from '../firebase';
import DropDown from '../DropDown';
import MuscleGroupWorkout from '../components/MuscleGroupWorkout';
import Navbar from '../Navbar';
import WorkoutNotesInput from '../WorkoutNotesInput';
import { generateSummary } from '../summaryUtil';
import { MUSCLE_GROUP_OPTIONS, SET_RANGE_OPTIONS, STORAGE_KEYS, FIREBASE_FIELDS } from '../constants';

function HypertrophyPage() {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [numberOfSets, setNumberOfSets] = useState(null);
  const [exerciseData, setExerciseData] = useState({});
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [previousWorkoutData, setPreviousWorkoutData] = useState(null);
  const [previousCustomExercises, setPreviousCustomExercises] = useState([]);

  // RECOVER DRAFT ON LOAD ---
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);
      // Check for data in both old and new format
      const hasData = (parsed.inputs && Object.keys(parsed.inputs).length > 0) ||
                      (parsed.exerciseData && Object.keys(parsed.exerciseData).length > 0);

      if (hasData) {
        const confirmResume = window.confirm(
          'We found an unsaved workout from your last session. Would you like to resume it?',
        );

        if (confirmResume) {
          // Handle muscle group (old: selection, new: selectedMuscleGroup)
          if (parsed.selectedMuscleGroup || parsed.selection) {
            setSelectedMuscleGroup(parsed.selectedMuscleGroup || parsed.selection);
          }

          // Handle set count (old: setCountSelection, new: numberOfSets)
          if (parsed.numberOfSets || parsed.setCountSelection) {
            setNumberOfSets(parsed.numberOfSets || parsed.setCountSelection);
          }

          // Handle exercise data (old: inputs, new: exerciseData)
          if (parsed.exerciseData || parsed.inputs) {
            const dataToRestore = parsed.exerciseData || parsed.inputs;

            // Convert old format to new format if needed
            const convertedData = {};
            Object.keys(dataToRestore).forEach(key => {
              const exercise = dataToRestore[key];
              convertedData[key] = {
                sets: exercise.sets || exercise.input || [],
                exerciseName: exercise.exerciseName || exercise.selection || '',
              };
            });

            setExerciseData(convertedData);
          }

          if (parsed.note) setNote(parsed.note);
          console.log('Workout draft restored from local storage.');
        } else {
          // If they say No, clear the old draft so they start fresh
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);
        }
      }
    }
  }, []);

  // AUTO-SAVE TO LOCAL STORAGE ---
  useEffect(() => {
    // Only save if the user has at least started a workout (selected a muscle group)
    if (selectedMuscleGroup) {
      const draft = {
        selectedMuscleGroup,
        numberOfSets,
        exerciseData,
        note
      };
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT, JSON.stringify(draft));
    }
  }, [selectedMuscleGroup, numberOfSets, exerciseData, note]);

  // PREVENT ACCIDENTAL TAB CLOSING ---
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (Object.keys(exerciseData).length > 0) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [exerciseData]);

  // Fetch all custom exercises from user's workout history
  const fetchPreviousCustomExercises = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(
        collection(db, 'workoutLogs'),
        where(FIREBASE_FIELDS.USER_ID, '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const customExercises = new Map(); // Use Map to deduplicate by name

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
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
              });
            }
          }
        });
      });

      setPreviousCustomExercises(Array.from(customExercises.values()));
    } catch (error) {
      console.error('Error fetching custom exercises:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Optional: Redirect to home if they aren't logged in
        // navigate("/");
      } else {
        // Once we have a user, fetch their data
        fetchPreviousCustomExercises();
        if (selectedMuscleGroup) {
          fetchPreviousWorkout(new Date()).then((data) => setPreviousWorkoutData(data));
        }
      }
    });
    return () => unsubscribe();
  }, [selectedMuscleGroup]); // Re-run when they change the muscle group

  // Previous Workout
  const fetchPreviousWorkout = async (currentDate) => {
    const user = auth.currentUser; // Get the logged-in user
    if (!user) return null;

    try {
      // Try querying with new field name first
      let q = query(
        collection(db, 'workoutLogs'),
        where(FIREBASE_FIELDS.USER_ID, '==', user.uid),
        where(FIREBASE_FIELDS.MUSCLE_GROUP, '==', selectedMuscleGroup),
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
          where(FIREBASE_FIELDS.LEGACY_TARGET, '==', selectedMuscleGroup),
          where(FIREBASE_FIELDS.DATE, '<', currentDate),
          orderBy(FIREBASE_FIELDS.DATE, 'desc'),
          limit(1),
        );
        querySnapshot = await getDocs(q);
      }

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() }; // Return previous workout
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch previous workout', error);
      return null;
    }
  };

  // Workout Selection: Weight x Reps input
  const handleExerciseDataChange = (categoryKey, exerciseName, setIndex, setInput) => {
    const updatedExerciseData = { ...exerciseData };
    if (!updatedExerciseData[categoryKey]) {
      const setsArray = new Array(numberOfSets).fill('');
      updatedExerciseData[categoryKey] = {
        sets: setsArray,
        exerciseName: exerciseName,
      };
    }

    if (setIndex === -1) {
      // -1 means changing the exercise selection
      updatedExerciseData[categoryKey].exerciseName = exerciseName;
    } else {
      // Auto-expand array if user is adding a set beyond current length
      const currentSets = updatedExerciseData[categoryKey].sets;
      while (currentSets.length <= setIndex) {
        currentSets.push('');
      }
      // Update the specific set
      updatedExerciseData[categoryKey].sets[setIndex] = setInput;
    }

    console.log(updatedExerciseData);
    setExerciseData(updatedExerciseData);
  };

  // Remove a specific set from an exercise
  const handleRemoveSet = (categoryKey, setIndex) => {
    const updatedExerciseData = { ...exerciseData };

    // Initialize if doesn't exist yet
    if (!updatedExerciseData[categoryKey]) {
      const setsArray = new Array(numberOfSets).fill('');
      updatedExerciseData[categoryKey] = {
        sets: setsArray,
        exerciseName: '',
      };
    }

    // Now remove the set
    updatedExerciseData[categoryKey].sets = updatedExerciseData[categoryKey].sets.filter((_, i) => i !== setIndex);
    setExerciseData(updatedExerciseData);
  };

  const handleMuscleGroupSelect = (option) => {
    setSelectedMuscleGroup(option);
  };

  const handleSetCountSelect = (option) => {
    setNumberOfSets(option);
  };

  // Save Workout
  const handleSaveWorkout = async () => {
    console.log(exerciseData);
    setIsSaving(true);
    try {
      // create date var
      const workoutDate = new Date();
      const user = auth.currentUser; // Get the logged-in user

      if (!user) {
        alert('You must be logged in to save a workout!');
        return;
      }
      // get previous workout directly
      console.log(workoutDate);
      const prevWorkout = await fetchPreviousWorkout(workoutDate);
      console.log('fetch prev workout:', prevWorkout);
      // Get previous workout data in the right format for summary generation
      const prevExerciseData = prevWorkout?.exerciseData || prevWorkout?.inputs;

      // Generate New Summary (no monthly data on initial save, only has previous workout)
      setIsGeneratingSummary(true);
      const newSummary = await generateSummary(exerciseData, note, prevExerciseData, []);
      setIsGeneratingSummary(false);

      // Save WorkoutLog with new field names
      const docRef = await addDoc(collection(db, 'workoutLogs'), {
        [FIREBASE_FIELDS.USER_ID]: user.uid,
        [FIREBASE_FIELDS.MUSCLE_GROUP]: selectedMuscleGroup,
        [FIREBASE_FIELDS.NUMBER_OF_SETS]: numberOfSets,
        [FIREBASE_FIELDS.DATE]: workoutDate,
        [FIREBASE_FIELDS.EXERCISE_DATA]: exerciseData,
        [FIREBASE_FIELDS.NOTE]: note,
        [FIREBASE_FIELDS.SUMMARY]: newSummary,
      });

      // CLEAR LOCAL STORAGE ON SUCCESS ---
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);

      // Get the document ID
      const workoutId = docRef.id;
      console.log(workoutId);

      // Redirect to another page with the document ID in the URL
      window.location.href = `/SavedWorkout/${workoutId}`;
    } catch (error) {
      console.error('ERROR SAVING WORKOUT:', error);
      alert('Error saving workout. Please try again.');
    } finally {
      setIsSaving(false); // End loading
      setIsGeneratingSummary(false);
    }
  };

  const handleReset = () => {
    const confirmReset = window.confirm(
      'Are you sure you want to start a new workout? This will clear all current progress.',
    );

    if (confirmReset) {
      // 1. Reset all React state
      setSelectedMuscleGroup(null);
      setNumberOfSets(null);
      setExerciseData({});
      setNote('');
      setPreviousWorkoutData(null);

      // 2. Clear the local storage draft
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);

      // 3. Scroll to top so user sees the "Step 1" section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const setRangeLabel = useMemo(() => {
    return SET_RANGE_OPTIONS.find((option) => option.value === numberOfSets)?.label;
  }, [numberOfSets]);

  return (
    <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen pb-32 font-serif">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-14">
        <h1 className="text-5xl font-extrabold mb-4 text-gray-800">Hypertrophy Training</h1>
        <p className="text-lg text-gray-700 italic mb-10">
          Training program designed to increase muscle size and mass.
        </p>
        {/* Only show "Restart" if there is actually data to clear */}
        {(selectedMuscleGroup || Object.keys(exerciseData).length > 0) && (
          <div className="flex justify-start mb-6">
            <button
              onClick={handleReset}
              className="text-sm font-medium text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors border border-gray-400 rounded-lg px-3 py-1 bg-white/50 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Restart Session
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-sky-50 rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Step 1: Select Muscle Group</h2>
            <DropDown options={MUSCLE_GROUP_OPTIONS} value={selectedMuscleGroup} onChange={handleMuscleGroupSelect} />
          </div>

          <div className="bg-sky-50 rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Step 2: Choose Set × Rep Range</h2>
            <DropDown
              options={SET_RANGE_OPTIONS}
              value={numberOfSets}
              onChange={handleSetCountSelect}
            />
          </div>
        </div>

        <div className={`mb-10 ${isSaving ? 'pointer-events-none opacity-50' : ''}`}>
          {selectedMuscleGroup && numberOfSets && (
            <MuscleGroupWorkout
              muscleGroup={selectedMuscleGroup}
              numberOfSets={numberOfSets}
              setRangeLabel={setRangeLabel}
              exerciseData={exerciseData}
              onExerciseDataChange={handleExerciseDataChange}
              onRemoveSet={handleRemoveSet}
              previousExerciseData={previousWorkoutData?.exerciseData || previousWorkoutData?.inputs}
              previousCustomExercises={previousCustomExercises}
            />
          )}
        </div>

        {selectedMuscleGroup && numberOfSets && (
          <div className={`mb-10 ${isSaving ? 'pointer-events-none opacity-50' : ''}`}>
            <WorkoutNotesInput value={note} onChange={setNote} />
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-end space-y-4 md:space-y-0 md:space-x-4 items-end">
          {isGeneratingSummary && (
            <div className="text-blue-600 font-semibold animate-pulse">
              🤖 Generating AI summary...
            </div>
          )}
          <button
            onClick={handleSaveWorkout}
            disabled={isSaving} // disable button while saving
            className={`px-6 py-3 rounded-full text-sky-50 font-semibold shadow-lg transition-all duration-300
                                ${
                                  isSaving
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-700 hover:bg-blue-800 active:bg-blue-600 active:scale-95'
                                }`}
          >
            {isSaving ? (isGeneratingSummary ? 'Generating Summary...' : 'Saving...') : 'Save Workout'}
          </button>
          <Link to="/SavedWorkouts">
            <button
              disabled={isSaving}
              className={`w-full px-6 py-3 rounded-full text-sky-50 font-semibold shadow-lg transition-all duration-300 ${
                isSaving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-800 hover:bg-blue-600 active:bg-gray-600 active:scale-95'
              }`}
            >
              View Workouts
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HypertrophyPage;

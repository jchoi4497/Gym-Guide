import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase'; // Make sure auth is imported
import db from '../firebase';
import DropDown from '../DropDown';
import MuscleGroupWorkout from '../components/MuscleGroupWorkout';
import OptionalWorkoutSections from '../components/OptionalWorkoutSections';
import MuscleGroupAutocomplete from '../components/MuscleGroupAutocomplete';
import Navbar from '../Navbar';
import WorkoutNotesInput from '../WorkoutNotesInput';
import { generateSummary } from '../summaryUtil';
import { MUSCLE_GROUP_OPTIONS, SET_RANGE_OPTIONS, STORAGE_KEYS, FIREBASE_FIELDS } from '../constants';
import { getMuscleGroupFromCategory } from '../utils/categoryDetection';

function HypertrophyPage() {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [numberOfSets, setNumberOfSets] = useState(null);
  const [exerciseData, setExerciseData] = useState({});
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [previousWorkoutData, setPreviousWorkoutData] = useState(null);
  const [previousCustomExercises, setPreviousCustomExercises] = useState([]);
  const [previousCustomMuscleGroups, setPreviousCustomMuscleGroups] = useState([]);

  // Custom input states
  const [customMuscleGroupName, setCustomMuscleGroupName] = useState('');
  const [customSetCount, setCustomSetCount] = useState('');
  const [customRepCount, setCustomRepCount] = useState('');

  // Section position states (true = top, false = bottom)
  const [cardioAtTop, setCardioAtTop] = useState(false);
  const [absAtTop, setAbsAtTop] = useState(false);

  // Section visibility states
  const [showCardio, setShowCardio] = useState(false);
  const [showAbs, setShowAbs] = useState(false);

  // Favorite exercises
  const [favoriteExercises, setFavoriteExercises] = useState([]);

  // Workout date (default to today in local timezone)
  const [workoutDate, setWorkoutDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format: YYYY-MM-DD in local timezone
  });

  // Determine actual muscle group name to use
  const actualMuscleGroup = useMemo(() => {
    if (selectedMuscleGroup === 'custom' && customMuscleGroupName) {
      return customMuscleGroupName;
    }
    return selectedMuscleGroup;
  }, [selectedMuscleGroup, customMuscleGroupName]);

  // Determine actual number of sets to use
  const actualNumberOfSets = useMemo(() => {
    if (numberOfSets === 'custom' && customSetCount) {
      return parseInt(customSetCount);
    }
    return numberOfSets;
  }, [numberOfSets, customSetCount]);

  // Check if both required selections are complete
  const isWorkoutConfigured = useMemo(() => {
    const hasMuscleGroup = selectedMuscleGroup &&
      (selectedMuscleGroup !== 'custom' || customMuscleGroupName.trim());
    const hasSets = numberOfSets &&
      (numberOfSets !== 'custom' || (customSetCount && parseInt(customSetCount) > 0));
    return hasMuscleGroup && hasSets;
  }, [selectedMuscleGroup, customMuscleGroupName, numberOfSets, customSetCount]);

  const setRangeLabel = useMemo(() => {
    if (numberOfSets === 'custom' && customSetCount) {
      if (customRepCount) {
        return `${customSetCount}x${customRepCount}`;
      }
      return `Custom (${customSetCount} sets)`;
    }
    return SET_RANGE_OPTIONS.find((option) => option.value === numberOfSets)?.label;
  }, [numberOfSets, customSetCount, customRepCount]);

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

          // Restore custom fields if present
          if (parsed.customMuscleGroupName) setCustomMuscleGroupName(parsed.customMuscleGroupName);
          if (parsed.customSetCount) setCustomSetCount(parsed.customSetCount);
          if (parsed.customRepCount) setCustomRepCount(parsed.customRepCount);

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
        note,
        customMuscleGroupName,
        customSetCount,
        customRepCount
      };
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT, JSON.stringify(draft));
    }
  }, [selectedMuscleGroup, numberOfSets, exerciseData, note, customMuscleGroupName, customSetCount, customRepCount]);

  // PREVENT ACCIDENTAL TAB CLOSING ---
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Don't show warning if user is saving (isSaving = true)
      if (Object.keys(exerciseData).length > 0 && !isSaving) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [exerciseData, isSaving]);

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

      console.log('Previous custom exercises from history:', exerciseArray);
      console.log('Previous custom muscle groups:', muscleGroupArray);

      setPreviousCustomExercises(exerciseArray);
      setPreviousCustomMuscleGroups(muscleGroupArray);

      // Try to fetch from "My Exercises" page (might fail if rules not set up)
      try {
        const customExDoc = await getDoc(doc(db, 'userCustomExercises', user.uid));
        if (customExDoc.exists()) {
          const myExercises = customExDoc.data().exercises || [];
          console.log('Custom exercises from My Exercises page:', myExercises);

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
        console.log('Could not fetch from My Exercises page (you may need to set up Firebase rules):', customExError.message);
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Optional: Redirect to home if they aren't logged in
        // navigate("/");
      } else {
        // Once we have a user, fetch their data
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
  }, [actualMuscleGroup]); // Re-run when the actual muscle group changes

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
    const user = auth.currentUser; // Get the logged-in user
    if (!user) return null;

    // Use provided muscle group or fall back to actualMuscleGroup
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
        return { id: doc.id, ...doc.data() }; // Return previous workout
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch previous workout', error);
      return null;
    }
  };

  // Workout Selection: Weight x Reps input
  const handleExerciseDataChange = (categoryKey, exerciseName, setIndex, setInput, detectedCategory) => {
    console.log('handleExerciseDataChange called:', { categoryKey, exerciseName, setIndex, setInput, detectedCategory, actualNumberOfSets });
    const updatedExerciseData = { ...exerciseData };
    if (!updatedExerciseData[categoryKey]) {
      const setsArray = new Array(actualNumberOfSets).fill('');
      console.log('Creating new exercise with', actualNumberOfSets, 'sets');
      updatedExerciseData[categoryKey] = {
        sets: setsArray,
        exerciseName: exerciseName,
      };
    }

    if (setIndex === -1) {
      // -1 means changing the exercise selection
      updatedExerciseData[categoryKey].exerciseName = exerciseName;
      // Store detected category if provided
      if (detectedCategory) {
        updatedExerciseData[categoryKey].detectedCategory = detectedCategory;
        console.log('Stored detected category:', detectedCategory, 'for exercise:', exerciseName);
      }
      // Ensure sets array exists and has correct length
      if (!updatedExerciseData[categoryKey].sets || updatedExerciseData[categoryKey].sets.length === 0) {
        updatedExerciseData[categoryKey].sets = new Array(actualNumberOfSets).fill('');
      }
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
      const setsArray = new Array(actualNumberOfSets).fill('');
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
    // Clear custom name if switching away from custom
    if (option !== 'custom') {
      setCustomMuscleGroupName('');
    }
    // Clear exercise data when changing muscle group
    setExerciseData({});
  };

  const handleSetCountSelect = (option) => {
    setNumberOfSets(option);
    // Clear custom values if switching away from custom
    if (option !== 'custom') {
      setCustomSetCount('');
      setCustomRepCount('');
    }
    // Clear exercise data when changing set count to rebuild with new count
    setExerciseData({});
  };

  // Auto-save custom exercises to "My Exercises" when saving workout
  const autoSaveCustomExercises = async (userId, exerciseDataToSave) => {
    console.log('autoSaveCustomExercises called with:', exerciseDataToSave);
    try {
      // Get current custom exercises
      const customExDoc = await getDoc(doc(db, 'userCustomExercises', userId));
      const existingExercises = customExDoc.exists() ? customExDoc.data().exercises || [] : [];
      console.log('Existing exercises in My Exercises:', existingExercises.length);

      // Find new custom exercises to add
      const newExercises = [];
      Object.entries(exerciseDataToSave).forEach(([key, exercise]) => {
        const exerciseName = exercise.exerciseName || exercise.selection;
        const detectedCategory = exercise.detectedCategory;

        console.log('Checking exercise:', { key, exerciseName, detectedCategory });

        // Save all custom exercises (with or without detected category)
        if (exerciseName && (key.startsWith('custom_') || !exerciseName.match(/^[a-z]+$/))) {
          const normalizedName = exerciseName.toLowerCase().trim();

          // Check if already exists
          const alreadyExists = existingExercises.some(
            ex => ex.name.toLowerCase().trim() === normalizedName
          );

          if (!alreadyExists) {
            newExercises.push({
              id: `auto_${Date.now()}_${Math.random()}`,
              name: exerciseName,
              category: detectedCategory || 'uncategorized',
              muscleGroup: getMuscleGroupFromCategory(detectedCategory) || 'custom',
              notes: 'Auto-saved from workout',
              createdAt: new Date().toISOString(),
              isCustomCategory: !detectedCategory,
            });
          }
        }
      });

      // Save if there are new exercises
      console.log('New exercises to auto-save:', newExercises);
      if (newExercises.length > 0) {
        const allExercises = [...existingExercises, ...newExercises];
        await setDoc(doc(db, 'userCustomExercises', userId), { exercises: allExercises });
        console.log('✅ Auto-saved', newExercises.length, 'custom exercises to My Exercises');
      } else {
        console.log('No new custom exercises to auto-save (either already exist or no detected categories)');
      }
    } catch (error) {
      console.error('❌ Could not auto-save custom exercises:', error);
      // Don't block the workout save if this fails
    }
  };

  // Save Workout
  const handleSaveWorkout = async () => {
    console.log(exerciseData);
    setIsSaving(true);
    try {
      // Use the selected workout date - parse as local time, not UTC
      const [year, month, day] = workoutDate.split('-');
      const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
      const user = auth.currentUser; // Get the logged-in user

      if (!user) {
        alert('You must be logged in to save a workout!');
        return;
      }

      // Auto-save custom exercises to "My Exercises"
      await autoSaveCustomExercises(user.uid, exerciseData);
      // get previous workout directly
      console.log(selectedDate);
      const prevWorkout = await fetchPreviousWorkout(selectedDate, actualMuscleGroup);
      console.log('fetch prev workout:', prevWorkout);
      // Get previous workout data in the right format for summary generation
      const prevExerciseData = prevWorkout?.exerciseData || prevWorkout?.inputs;

      // Generate New Summary (no monthly data on initial save, only has previous workout)
      setIsGeneratingSummary(true);
      const newSummary = await generateSummary(exerciseData, note, prevExerciseData, []);
      setIsGeneratingSummary(false);

      // Save WorkoutLog with new field names (use actual values for custom)
      const docRef = await addDoc(collection(db, 'workoutLogs'), {
        [FIREBASE_FIELDS.USER_ID]: user.uid,
        [FIREBASE_FIELDS.MUSCLE_GROUP]: actualMuscleGroup,
        [FIREBASE_FIELDS.NUMBER_OF_SETS]: actualNumberOfSets,
        [FIREBASE_FIELDS.DATE]: selectedDate,
        [FIREBASE_FIELDS.EXERCISE_DATA]: exerciseData,
        [FIREBASE_FIELDS.NOTE]: note,
        [FIREBASE_FIELDS.SUMMARY]: newSummary,
        createdAt: new Date(), // Exact timestamp for ordering
      });

      // CLEAR LOCAL STORAGE ON SUCCESS ---
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);

      // Get the document ID
      const workoutId = docRef.id;
      console.log('Workout saved with ID:', workoutId);

      // Small delay so console logs can be seen
      await new Promise(resolve => setTimeout(resolve, 500));

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          <div className="bg-sky-50 rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Step 1: Select Muscle Group</h2>
            <DropDown options={MUSCLE_GROUP_OPTIONS} value={selectedMuscleGroup} onChange={handleMuscleGroupSelect} />

            {selectedMuscleGroup === 'custom' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name your workout (e.g., "Push Day", "Upper Body")
                </label>
                <MuscleGroupAutocomplete
                  value={customMuscleGroupName}
                  onChange={setCustomMuscleGroupName}
                  previousMuscleGroups={previousCustomMuscleGroups}
                />
              </div>
            )}
          </div>

          <div className="bg-sky-50 rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Step 2: Choose Set × Rep Range</h2>
            <DropDown
              options={SET_RANGE_OPTIONS}
              value={numberOfSets}
              onChange={handleSetCountSelect}
            />

            {numberOfSets === 'custom' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of sets per exercise
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={customSetCount}
                    onChange={(e) => setCustomSetCount(e.target.value)}
                    placeholder="e.g., 4"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target reps per set (optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={customRepCount}
                    onChange={(e) => setCustomRepCount(e.target.value)}
                    placeholder="e.g., 10"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-sky-50 rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Step 3: Workout Date</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select date for this workout
            </label>
            <input
              type="date"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
              max={(() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              })()}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
            <p className="mt-2 text-xs text-gray-500 italic">
              Change this if you're adding a past workout
            </p>
          </div>
        </div>

        {/* Optional sections at top */}
        {isWorkoutConfigured && (cardioAtTop || absAtTop) && (
          <div className={`mb-10 ${isSaving ? 'pointer-events-none opacity-50' : ''}`}>
            <OptionalWorkoutSections
              numberOfSets={actualNumberOfSets}
              exerciseData={exerciseData}
              onExerciseDataChange={handleExerciseDataChange}
              onRemoveSet={handleRemoveSet}
              cardioAtTop={cardioAtTop}
              absAtTop={absAtTop}
              onToggleCardioPosition={() => setCardioAtTop(!cardioAtTop)}
              onToggleAbsPosition={() => setAbsAtTop(!absAtTop)}
              showCardio={showCardio}
              setShowCardio={setShowCardio}
              showAbs={showAbs}
              setShowAbs={setShowAbs}
              position="top"
            />
          </div>
        )}

        <div className={`mb-10 ${isSaving ? 'pointer-events-none opacity-50' : ''}`}>
          {isWorkoutConfigured && (
            <MuscleGroupWorkout
              muscleGroup={actualMuscleGroup}
              numberOfSets={actualNumberOfSets}
              setRangeLabel={setRangeLabel}
              exerciseData={exerciseData}
              onExerciseDataChange={handleExerciseDataChange}
              onRemoveSet={handleRemoveSet}
              previousExerciseData={previousWorkoutData?.exerciseData || previousWorkoutData?.inputs}
              previousCustomExercises={previousCustomExercises}
              favoriteExercises={favoriteExercises}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </div>

        {/* Optional sections at bottom */}
        {isWorkoutConfigured && (!cardioAtTop || !absAtTop) && (
          <div className={`mb-10 ${isSaving ? 'pointer-events-none opacity-50' : ''}`}>
            <OptionalWorkoutSections
              numberOfSets={actualNumberOfSets}
              exerciseData={exerciseData}
              onExerciseDataChange={handleExerciseDataChange}
              onRemoveSet={handleRemoveSet}
              cardioAtTop={cardioAtTop}
              absAtTop={absAtTop}
              onToggleCardioPosition={() => setCardioAtTop(!cardioAtTop)}
              onToggleAbsPosition={() => setAbsAtTop(!absAtTop)}
              showCardio={showCardio}
              setShowCardio={setShowCardio}
              showAbs={showAbs}
              setShowAbs={setShowAbs}
              position="bottom"
            />
          </div>
        )}

        {isWorkoutConfigured && (
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

import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth } from '../firebase'; // Make sure auth is imported
import db from '../firebase';
import DropDown from '../DropDown';
import ChestWorkout from '../WorkoutSplits/ChestWorkout';
import BackWorkout from '../WorkoutSplits/BackWorkout';
import LegsWorkout from '../WorkoutSplits/LegsWorkout';
import ShouldersWorkout from '../WorkoutSplits/ShouldersWorkout';
import Navbar from '../Navbar';
import WorkoutNotesInput from '../WorkoutNotesInput';
import { generateSummary } from '../summaryUtil';

function HypertrophyPage() {
  const [selection, setSelection] = useState(null);
  const [setCountSelection, setSetCountSelection] = useState(null);
  const [inputs, setInputs] = useState({});
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [previousWorkoutData, setPreviousWorkoutData] = useState(null);

  // RECOVER DRAFT ON LOAD ---
  useEffect(() => {
    const savedDraft = localStorage.getItem('active_workout_draft');
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);
      // Only ask if there's actually meaningful data (like inputs)
      const hasData = parsed.inputs && Object.keys(parsed.inputs).length > 0;

      if (hasData) {
        const confirmResume = window.confirm(
          'We found an unsaved workout from your last session. Would you like to resume it?',
        );

        if (confirmResume) {
          if (parsed.selection) setSelection(parsed.selection);
          if (parsed.setCountSelection) setSetCountSelection(parsed.setCountSelection);
          if (parsed.inputs) setInputs(parsed.inputs);
          if (parsed.note) setNote(parsed.note);
          console.log('Workout draft restored from local storage.');
        } else {
          // If they say No, clear the old draft so they start fresh
          localStorage.removeItem('active_workout_draft');
        }
      }
    }
  }, []);

  // AUTO-SAVE TO LOCAL STORAGE ---
  useEffect(() => {
    // Only save if the user has at least started a workout (selected a muscle group)
    if (selection) {
      const draft = { selection, setCountSelection, inputs, note };
      localStorage.setItem('active_workout_draft', JSON.stringify(draft));
    }
  }, [selection, setCountSelection, inputs, note]);

  // PREVENT ACCIDENTAL TAB CLOSING ---
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (Object.keys(inputs).length > 0) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [inputs]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Optional: Redirect to home if they aren't logged in
        // navigate("/");
      } else {
        // Once we have a user, fetch their data
        if (selection) {
          fetchPreviousWorkout(new Date()).then((data) => setPreviousWorkoutData(data));
        }
      }
    });
    return () => unsubscribe();
  }, [selection]); // Re-run when they change the muscle group

  // Previous Workout
  const fetchPreviousWorkout = async (currentDate) => {
    const user = auth.currentUser; // Get the logged-in user
    if (!user) return null;

    try {
      const q = query(
        collection(db, 'workoutLogs'),
        where('userId', '==', user.uid),
        where('target', '==', selection),
        where('date', '<', currentDate),
        orderBy('date', 'desc'),
        limit(1), // get 2 most recent workouts
      );
      const querySnapshot = await getDocs(q);
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

  // Workout Selection: Weigt x Reps input
  const onInput = (row, exercise, index, input) => {
    const inputData = { ...inputs };
    if (!inputData[row]) {
      const inputArr = new Array(setCountSelection).fill('');
      inputData[row] = {
        input: inputArr,
        selection: exercise,
      };
    }

    if (index === -1) {
      inputData[row].selection = exercise;
    } else {
      inputData[row].input[index] = input;
    }

    console.log(inputData);
    setInputs(inputData);
  };

  const handleSelect = (option) => {
    setSelection(option);
  };

  const repHandleSelect = (option) => {
    setSetCountSelection(option);
  };

  // Save Workout
  const handleSaveWorkout = async () => {
    console.log(inputs);
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
      // Generate New Summary
      const newSummary = await generateSummary(inputs, note, prevWorkout?.inputs);

      // Save WorkoutLog with ai summary
      const docRef = await addDoc(collection(db, 'workoutLogs'), {
        userId: user.uid,
        target: selection,
        reps: setCountSelection,
        date: workoutDate,
        inputs: inputs,
        note: note,
        summary: newSummary,
      });

      // CLEAR LOCAL STORAGE ON SUCCESS ---
      localStorage.removeItem('active_workout_draft');

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
    }
  };

  const handleReset = () => {
    const confirmReset = window.confirm(
      'Are you sure you want to start a new workout? This will clear all current progress.',
    );

    if (confirmReset) {
      // 1. Reset all React state
      setSelection(null);
      setSetCountSelection(null);
      setInputs({});
      setNote('');
      setPreviousWorkoutData(null);

      // 2. Clear the local storage draft
      localStorage.removeItem('active_workout_draft');

      // 3. Scroll to top so user sees the "Step 1" section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const options = [
    { label: 'Chest/Triceps', value: 'chest' },
    { label: 'Back/Biceps', value: 'back' },
    { label: 'Legs', value: 'legs' },
    { label: 'Shoulders/Forearms', value: 'shoulders' },
  ];

  //reps
  const setCountOptions = [
    { label: '3x15', value: 3 },
    { label: '4x12', value: 4 },
    { label: '5x8', value: 5 },
  ];

  const label = useMemo(() => {
    return setCountOptions.find((option) => option.value === setCountSelection)?.label;
  }, [setCountSelection]);

  return (
    <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen pb-32 font-serif">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-14">
        <h1 className="text-5xl font-extrabold mb-4 text-gray-800">Hypertrophy Training</h1>
        <p className="text-lg text-gray-700 italic mb-10">
          Training program designed to increase muscle size and mass.
        </p>
        {/* Only show "Restart" if there is actually data to clear */}
        {(selection || Object.keys(inputs).length > 0) && (
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
            <DropDown options={options} value={selection} onChange={handleSelect} />
          </div>

          <div className="bg-sky-50 rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Step 2: Choose Set × Rep Range</h2>
            <DropDown
              options={setCountOptions}
              value={setCountSelection}
              onChange={repHandleSelect}
            />
          </div>
        </div>

        <div className="mb-10">
          {selection === 'chest' && setCountSelection && (
            <ChestWorkout
              target={selection}
              reps={setCountSelection}
              label={label}
              inputs={inputs}
              onInput={onInput}
              previousInputs={previousWorkoutData?.inputs}
            />
          )}
          {selection === 'back' && setCountSelection && (
            <BackWorkout
              target={selection}
              reps={setCountSelection}
              label={label}
              inputs={inputs}
              onInput={onInput}
              previousInputs={previousWorkoutData?.inputs}
            />
          )}
          {selection === 'legs' && setCountSelection && (
            <LegsWorkout
              target={selection}
              reps={setCountSelection}
              label={label}
              inputs={inputs}
              onInput={onInput}
              previousInputs={previousWorkoutData?.inputs}
            />
          )}
          {selection === 'shoulders' && setCountSelection && (
            <ShouldersWorkout
              target={selection}
              reps={setCountSelection}
              label={label}
              inputs={inputs}
              onInput={onInput}
              previousInputs={previousWorkoutData?.inputs}
            />
          )}
        </div>

        {selection && setCountSelection && (
          <div className="mb-10">
            <WorkoutNotesInput value={note} onChange={setNote} />
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-end space-y-4 md:space-y-0 md:space-x-4">
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
            {isSaving ? 'Saving...' : 'Save Workout'}
          </button>
          <Link to="/SavedWorkouts">
            <button className="w-full bg-gray-800 hover:bg-blue-600 px-6 py-3 rounded-full text-sky-50 font-semibold shadow-lg transition-all duration-300 active:bg-gray-600 active:scale-95">
              View Workouts
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HypertrophyPage;

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import db, { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../Navbar';
import { generateSummary } from '../summaryUtil';
import WorkoutInputs from './WorkoutInputs';
import WorkoutNotes from './WorkoutNotes';
import WorkoutAnalysis from './WorkoutAnalysis';
import AddExerciseButton from '../AddExerciseButton';
import { FIREBASE_FIELDS, MUSCLE_GROUP_OPTIONS } from '../constants';

function SavedWorkout() {
  const { workoutId } = useParams();
  const [workoutData, setWorkoutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedInputs, setEditedInputs] = useState({});
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState('');
  const [previousWorkoutData, setPreviousWorkoutData] = useState(null);
  const [monthlyWorkoutData, setMonthlyWorkoutData] = useState([]);
  const [graphView, setGraphView] = useState('previous');
  const [exerciseOrder, setExerciseOrder] = useState([]);

  //used to get label of workout on savedworkout page
  const getLabel = (value) =>
    MUSCLE_GROUP_OPTIONS.find((option) => option.value === value)?.label || value;

  const categoryOrder = {
    chest: ['incline', 'chestpress', 'fly', 'tri', 'tri2'],
    back: ['pullup', 'row', 'lat', 'bicep', 'bicep2'],
    legs: ['squat', 'splitsquat', 'backextension', 'calfraise'],
    shoulders: ['reardelt', 'latraise', 'reardelt2', 'latraise2', 'wristcurl', 'reversewristcurl'],
  };

  const fetchPreviousWorkout = async (muscleGroup, currentDate) => {
    const user = auth.currentUser;
    if (!user || !muscleGroup || !currentDate) return;

    try {
      // Try with new field name first
      let q = query(
        collection(db, 'workoutLogs'),
        where(FIREBASE_FIELDS.USER_ID, '==', user.uid),
        where(FIREBASE_FIELDS.MUSCLE_GROUP, '==', muscleGroup),
        where(FIREBASE_FIELDS.DATE, '<', currentDate),
        orderBy(FIREBASE_FIELDS.DATE, 'desc'),
        limit(4),
      );

      let querySnapshot = await getDocs(q);

      // If no results, try with old field name (backward compatibility)
      if (querySnapshot.empty) {
        q = query(
          collection(db, 'workoutLogs'),
          where(FIREBASE_FIELDS.USER_ID, '==', user.uid),
          where(FIREBASE_FIELDS.LEGACY_TARGET, '==', muscleGroup),
          where(FIREBASE_FIELDS.DATE, '<', currentDate),
          orderBy(FIREBASE_FIELDS.DATE, 'desc'),
          limit(4),
        );
        querySnapshot = await getDocs(q);
      }

      const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Update both states immediately
      setMonthlyWorkoutData(docs);
      setPreviousWorkoutData(docs[0] || null); // Most recent for 'previous' view
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  // Can I add fetchpreviousworkout(workoutdata.date to this useeffect or create new one)
  useEffect(() => {
    // Only fetch if we have the requirements AND we haven't loaded history yet
    // Handle both old (target) and new (muscleGroup) field names
    const muscleGroup = workoutData?.muscleGroup || workoutData?.target;
    if (muscleGroup && workoutData?.date) {
      if (monthlyWorkoutData.length === 0) {
        fetchPreviousWorkout(muscleGroup, workoutData.date);
      }
    }
  }, [workoutData, monthlyWorkoutData.length]);
  // Removing graphView here stops the 'double read' when switching tabs

  const fetchData = async () => {
    const user = auth.currentUser;
    console.log('Current User UID:', user?.uid);
    if (!user) {
      setError('Please log in to view this workout.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const docRef = doc(db, 'workoutLogs', workoutId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // SECURITY CHECK: Ensure this workout belongs to the logged-in user
        if (data.userId !== user.uid) {
          setError('You do not have permission to view this workout.');
          return;
        }

        setWorkoutData(data);
        // Handle both old (inputs) and new (exerciseData) field names
        const exerciseData = data.exerciseData || data.inputs || {};
        setEditedInputs(exerciseData);
        setNote(data.note || '');
        setSummary(data.summary || '');
        // CREATE THE INITIAL ORDER
        const inputKeys = Object.keys(exerciseData);
        const muscleGroup = data.muscleGroup || data.target;
        const orderedKeysFromCategory = categoryOrder[muscleGroup] || [];
        // Filter existing keys based on your preferred order, then append any extras (custom ones)
        const sorted = [
          ...orderedKeysFromCategory.filter((key) => inputKeys.includes(key)),
          ...inputKeys.filter((key) => !orderedKeysFromCategory.includes(key)),
        ];
        setExerciseOrder(sorted);
      } else {
        setError('No such document found.');
      }
    } catch (error) {
      setError('Error fetching data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExercise = () => {
    const customId = `custom_${Date.now()}`;
    setExerciseOrder((prev) => [...prev, customId]);
    setEditedInputs((prev) => ({
      ...prev,
      [customId]: {
        exerciseName: '',
        sets: ['', '', '', ''],
        // Keep old field names for backward compatibility
        selection: '',
        input: ['', '', '', '']
      },
    }));
  };

  const handleRemoveExercise = (rowId) => {
    setExerciseOrder((prev) => prev.filter((id) => id !== rowId));
    setEditedInputs((prev) => {
      const updated = { ...prev };
      delete updated[rowId];
      return updated;
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData();
      }
    });
    return () => unsubscribe();
  }, [workoutId]);

  const handleSaveChanges = async () => {
    // 1. Get all names, filter out any undefined/null, and trim them
    const names = Object.values(editedInputs)
      .map((ex) => (ex.exerciseName || ex.selection)?.toLowerCase().trim())
      .filter((name) => name && name !== ''); // Only check rows that actually have a name

    // 2. Check for duplicates
    const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);

    if (duplicateNames.length > 0) {
      alert(`Duplicate exercise found: "${duplicateNames[0]}". Please use unique names.`);
      return; // STOP the save process
    }

    // 3. If no duplicates, proceed with saving
    try {
      setIsSaving(true);
      const prevExerciseData = previousWorkoutData?.exerciseData || previousWorkoutData?.inputs;
      const newSummary = await generateSummary(editedInputs, note, prevExerciseData);
      const docRef = doc(db, 'workoutLogs', workoutId);

      // Update with new field name, but keep old for backward compatibility
      await updateDoc(docRef, {
        [FIREBASE_FIELDS.EXERCISE_DATA]: editedInputs,
        [FIREBASE_FIELDS.LEGACY_INPUTS]: editedInputs, // Keep for backward compatibility
        [FIREBASE_FIELDS.NOTE]: note,
        [FIREBASE_FIELDS.SUMMARY]: newSummary,
      });

      setWorkoutData((prev) => ({
        ...prev,
        [FIREBASE_FIELDS.EXERCISE_DATA]: editedInputs,
        [FIREBASE_FIELDS.LEGACY_INPUTS]: editedInputs, // Keep for backward compatibility
        [FIREBASE_FIELDS.NOTE]: note,
        [FIREBASE_FIELDS.SUMMARY]: newSummary,
      }));

      setSummary(newSummary);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating workout:', error);
      // Optionally show an inline error message here instead of alert
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  // Handle both old and new field names
  const exerciseData = workoutData?.exerciseData || workoutData?.inputs;
  if (!workoutData || !exerciseData) return <div>No workout data found.</div>;

  const muscleGroup = workoutData.muscleGroup || workoutData.target;

  const orderedKeys = categoryOrder[muscleGroup] || [];
  const inputKeys = Object.keys(exerciseData);
  const orderedInputs = orderedKeys.filter((key) => inputKeys.includes(key));
  const remainingInputs = inputKeys.filter((key) => !orderedKeys.includes(key));
  const order = [...orderedInputs, ...remainingInputs];

  return (
    <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen font-serif pb-80">
      <Navbar />
      <div className="px-4 sm:px-20">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div className="text-5xl">{getLabel(muscleGroup)} Workout</div>
          <div className="flex items-center space-x-4">
            {workoutData.date && (
              <div className="text-5xl text-gray-600">
                {new Date(workoutData.date.seconds * 1000).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sm:px-20 px-4">
        {/* Chart View Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 mb-6 sm:mb-8 px-4 sm:px-0">
          <span className="text-lg font-medium text-gray-700">Compare Data:</span>
          <button
            onClick={() => setGraphView('previous')}
            className={`px-4 py-2 rounded-lg text-sky-50 text-sm font-semibold transition-all duration-200 shadow-md active:scale-95
                        ${
                          graphView === 'previous'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-500 hover:bg-gray-600'
                        }`}
          >
            Previous
          </button>
          <button
            onClick={() => setGraphView('monthly')}
            className={`px-4 py-2 rounded-lg text-sky-50 text-sm font-semibold transition-all duration-200 shadow-md active:scale-95
                        ${
                          graphView === 'monthly'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-500 hover:bg-gray-600'
                        }`}
          >
            Month
          </button>
        </div>

        {/* Workout Inputs */}
        <WorkoutInputs
          order={exerciseOrder}
          isEditing={isEditing}
          editedInputs={editedInputs}
          setEditedInputs={setEditedInputs}
          workoutData={workoutData}
          previousWorkoutData={previousWorkoutData}
          graphView={graphView}
          monthlyWorkoutData={monthlyWorkoutData}
          onRemove={handleRemoveExercise}
        />

        {isEditing && (
          <div className="mb-6">
            <AddExerciseButton onClick={handleAddExercise} />
          </div>
        )}

        {/* Workout Notes */}
        <WorkoutNotes value={note} onChange={setNote} isEditing={isEditing} />

        {/* OpenAI Analysis */}
        <WorkoutAnalysis summary={summary} />
      </div>

      <div className="m-6 flex flex-col justify-end sm:space-x-4 space-y-4 px-4 sm:px-20">
        <Link to="/SavedWorkouts">
          <button className="px-6 py-3 w-full sm:w-auto rounded-3xl shadow-lg text-sky-50 bg-gray-800 hover:bg-blue-600 active:bg-gray-600 transition-all duration-300 active:scale-95">
            View Workouts
          </button>
        </Link>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-3 w-full rounded text-sky-50 sm:w-auto self-start active:scale-95 transition-all ${
            isEditing
              ? 'bg-red-600 hover:bg-red-700 active:bg-red-400'
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-400'
          }`}
        >
          {isEditing ? 'Cancel' : 'Edit Workout'}
        </button>

        {isEditing && (
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className={`px-6 py-3 w-full rounded-3xl shadow-lg text-sky-50 transition-all duration-300 ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 active:bg-green-400'
            } w-auto sm:w-auto self-start active:scale-95`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>
    </div>
  );
}

export default SavedWorkout;

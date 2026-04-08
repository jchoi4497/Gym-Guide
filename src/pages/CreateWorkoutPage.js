import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../config/firebase';
import db from '../config/firebase';
import Navbar from '../components/Navbar';
import DropDown from '../components/DropDown';
import MuscleGroupAutocomplete from '../components/MuscleGroupAutocomplete';
import { MUSCLE_GROUP_OPTIONS, SET_RANGE_OPTIONS } from '../config/constants';

function CreateWorkoutPage() {
  const navigate = useNavigate();

  // Form selections
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [numberOfSets, setNumberOfSets] = useState(null);
  const [customMuscleGroupName, setCustomMuscleGroupName] = useState('');
  const [customSetCount, setCustomSetCount] = useState('');
  const [customRepCount, setCustomRepCount] = useState('');
  const [workoutDate, setWorkoutDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Loading state
  const [isCreating, setIsCreating] = useState(false);

  // Get actual muscle group name
  const actualMuscleGroup = selectedMuscleGroup === 'custom' && customMuscleGroupName
    ? customMuscleGroupName
    : selectedMuscleGroup;

  // Get actual number of sets
  const actualNumberOfSets = numberOfSets === 'custom' && customSetCount
    ? parseInt(customSetCount)
    : numberOfSets;

  // Check if ready to create workout
  const canCreateWorkout =
    selectedMuscleGroup &&
    (selectedMuscleGroup !== 'custom' || customMuscleGroupName.trim()) &&
    numberOfSets &&
    (numberOfSets !== 'custom' || (customSetCount && parseInt(customSetCount) > 0));

  const handleMuscleGroupSelect = (option) => {
    setSelectedMuscleGroup(option);
    // Clear custom name if switching away from custom
    if (option !== 'custom') {
      setCustomMuscleGroupName('');
    }
  };

  const handleSetCountSelect = (option) => {
    setNumberOfSets(option);
    // Clear custom values if switching away from custom
    if (option !== 'custom') {
      setCustomSetCount('');
      setCustomRepCount('');
    }
  };

  const handleCreateWorkout = async () => {
    if (!canCreateWorkout || !auth.currentUser) return;

    setIsCreating(true);

    try {
      // Create empty workout document in Firebase
      const workoutRef = await addDoc(collection(db, 'workouts'), {
        userId: auth.currentUser.uid,
        status: 'draft',
        type: 'program',
        muscleGroup: actualMuscleGroup,
        numberOfSets: actualNumberOfSets,
        customSetCount: numberOfSets === 'custom' ? parseInt(customSetCount) : null,
        customRepCount: numberOfSets === 'custom' && customRepCount ? parseInt(customRepCount) : null,
        exercises: {},
        workoutDate: workoutDate,
        createdAt: serverTimestamp(),
        lastModified: serverTimestamp(),
        note: '',
        showCardio: false,
        showAbs: false,
        cardioAtTop: false,
        absAtTop: false,
        sectionOrder: 'abs-first',
        mainExerciseOrder: []
      });

      console.log('✅ Created draft workout:', workoutRef.id);

      // Navigate to workout page with the new ID
      navigate(`/workout/${workoutRef.id}`);
    } catch (error) {
      console.error('Error creating workout:', error);
      alert('Failed to create workout. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen pb-20 font-serif">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-14 pb-20">
        <h1 className="text-5xl font-extrabold mb-4 text-gray-800">Create Workout</h1>
        <p className="text-lg text-gray-700 italic mb-10">
          Set up your workout and start training.
        </p>

        <div className="mb-6 bg-blue-100 border-l-4 border-blue-500 p-4 rounded flex justify-between items-center">
          <p className="text-blue-800 font-semibold">
            📚 Following Jonathan's Program - Select your muscle group and I'll load my proven exercises
          </p>
          <button
            onClick={() => navigate('/hypertrophy')}
            className="text-sm text-blue-700 hover:text-blue-900 underline font-semibold whitespace-nowrap ml-4"
          >
            ← Back to choices
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {/* Step 1: Muscle Group */}
          <div className="bg-sky-50 rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Step 1: Select Muscle Group</h2>
            <DropDown
              options={MUSCLE_GROUP_OPTIONS}
              value={selectedMuscleGroup}
              onChange={handleMuscleGroupSelect}
            />

            {selectedMuscleGroup === 'custom' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name your workout (e.g., "Push Day", "Upper Body")
                </label>
                <MuscleGroupAutocomplete
                  value={customMuscleGroupName}
                  onChange={setCustomMuscleGroupName}
                  previousMuscleGroups={[]}
                />
              </div>
            )}
          </div>

          {/* Step 2: Set x Rep Range */}
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

          {/* Step 3: Workout Date */}
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

        {/* Create Workout Button */}
        {canCreateWorkout && (
          <div className="flex justify-center mt-12">
            <button
              onClick={handleCreateWorkout}
              disabled={isCreating}
              className="px-12 py-4 bg-green-600 text-white text-xl font-bold rounded-full shadow-2xl hover:bg-green-700 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating Workout...' : 'Create Workout →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateWorkoutPage;

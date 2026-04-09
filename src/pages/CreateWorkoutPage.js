import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
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

  // Templates state
  const [recentTemplates, setRecentTemplates] = useState([]);

  // Wizard step state (1, 2, or 3)
  const [currentStep, setCurrentStep] = useState(1);

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

  // Fetch recent templates on mount
  useEffect(() => {
    const fetchRecentTemplates = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Fetch the user's template document directly (document ID = user.uid)
        const templateDoc = await getDoc(doc(db, 'userTemplates', user.uid));

        if (templateDoc.exists()) {
          const templatesArray = templateDoc.data().templates || [];

          // Sort by lastUsed and take the first 3
          const recentThree = templatesArray
            .sort((a, b) => {
              // Handle both Firestore Timestamp and ISO string
              const aTime = a.lastUsed
                ? (typeof a.lastUsed === 'string' ? new Date(a.lastUsed) : a.lastUsed.toDate?.() || new Date(0))
                : new Date(0);
              const bTime = b.lastUsed
                ? (typeof b.lastUsed === 'string' ? new Date(b.lastUsed) : b.lastUsed.toDate?.() || new Date(0))
                : new Date(0);
              return bTime - aTime;
            })
            .slice(0, 3);

          setRecentTemplates(recentThree);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchRecentTemplates();
      }
    });

    return () => unsubscribe();
  }, []);

  // Load template into form
  const handleLoadTemplate = (template) => {
    setSelectedMuscleGroup(template.muscleGroup || null);
    setCustomMuscleGroupName(template.customMuscleGroupName || '');
    setNumberOfSets(template.numberOfSets || null);
    setCustomSetCount(template.customSetCount?.toString() || '');
    setCustomRepCount(template.customRepCount?.toString() || '');
    // Auto-advance to step 3 (date selection) when template is loaded
    setCurrentStep(3);
  };

  const handleMuscleGroupSelect = (option) => {
    setSelectedMuscleGroup(option);
    // Clear custom name if switching away from custom
    if (option !== 'custom') {
      setCustomMuscleGroupName('');
      // Auto-advance to step 2 for non-custom selections
      setCurrentStep(2);
    }
  };

  const handleSetCountSelect = (option) => {
    setNumberOfSets(option);
    // Clear custom values if switching away from custom
    if (option !== 'custom') {
      setCustomSetCount('');
      setCustomRepCount('');
      // Auto-advance to step 3 for non-custom selections
      setCurrentStep(3);
    }
  };

  const handleCreateWorkout = async () => {
    if (!canCreateWorkout || !auth.currentUser) return;

    setIsCreating(true);

    try {
      // Parse workout date
      const [year, month, day] = workoutDate.split('-');
      const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);

      // Create draft workout directly in workoutLogs
      const workoutRef = await addDoc(collection(db, 'workoutLogs'), {
        userId: auth.currentUser.uid,
        status: 'draft',
        type: 'program',
        muscleGroup: actualMuscleGroup,
        numberOfSets: actualNumberOfSets,
        customSetCount: numberOfSets === 'custom' ? parseInt(customSetCount) : null,
        customRepCount: numberOfSets === 'custom' && customRepCount ? parseInt(customRepCount) : null,
        exerciseData: {},
        date: selectedDate,
        workoutDate: workoutDate,
        createdAt: serverTimestamp(),
        lastModified: serverTimestamp(),
        note: '',
        summary: '',
        showCardio: false,
        showAbs: false,
        cardioAtTop: false,
        absAtTop: false,
        sectionOrder: 'abs-first',
        mainExerciseOrder: [],
        exerciseOrder: []
      });

      console.log('✅ Created draft workout in workoutLogs:', workoutRef.id);

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

        {/* Quick Start - Template Dropdown */}
        {recentTemplates.length > 0 && (
          <div className="mb-10">
            <div className="bg-sky-50 rounded-3xl p-6 shadow-lg max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">💡 Quick Start - Load Template</h2>
                <Link to="/MyTemplates" className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                  Manage Templates →
                </Link>
              </div>
              <select
                onChange={(e) => {
                  const templateId = e.target.value;
                  if (templateId) {
                    const template = recentTemplates.find(t => t.id === templateId);
                    if (template) {
                      handleLoadTemplate(template);
                    }
                  }
                }}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white"
              >
                <option value="">Select a template to auto-fill...</option>
                {recentTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.muscleGroup || template.customMuscleGroupName} - {template.customSetCount || template.numberOfSets}x{template.customRepCount || '8-12'})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2 italic">
                Or fill in the form below to create from scratch
              </p>
            </div>
          </div>
        )}

        {/* Wizard Progress Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            1
          </div>
          <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            2
          </div>
          <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            3
          </div>
        </div>

        {/* Wizard Card - Shows one step at a time */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-sky-50 rounded-3xl p-8 shadow-xl">
            {/* Step 1: Select Workout */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-3xl font-bold mb-2 text-gray-800">Step 1: Select Workout</h2>
                <p className="text-gray-600 mb-6">Choose your muscle group or workout type</p>
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
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setCurrentStep(2)}
                        disabled={!customMuscleGroupName.trim()}
                        className="text-blue-600 hover:text-blue-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}

                {selectedMuscleGroup && selectedMuscleGroup !== 'custom' && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Set Range */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-3xl font-bold mb-2 text-gray-800">Step 2: Set × Rep Range</h2>
                <p className="text-gray-600 mb-6">Choose your training volume</p>
                <DropDown
                  options={SET_RANGE_OPTIONS}
                  value={numberOfSets}
                  onChange={handleSetCountSelect}
                />

                {numberOfSets === 'custom' && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of sets per exercise <span className="text-red-500">*</span>
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
                    <div className="mt-6 flex justify-between">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => setCurrentStep(3)}
                        disabled={!customSetCount || parseInt(customSetCount) <= 0}
                        className="text-blue-600 hover:text-blue-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}

                {numberOfSets && numberOfSets !== 'custom' && (
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Date */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-3xl font-bold mb-2 text-gray-800">Step 3: Workout Date</h2>
                <p className="text-gray-600 mb-6">When did you do this workout?</p>
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

                <button
                  onClick={() => setCurrentStep(2)}
                  className="mt-6 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  ← Back
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create Workout Button - Always show on step 3, disabled if incomplete */}
        {currentStep === 3 && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleCreateWorkout}
              disabled={!canCreateWorkout || isCreating}
              className="px-12 py-4 bg-green-600 text-white text-xl font-bold rounded-full shadow-2xl hover:bg-green-700 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isCreating ? 'Creating Workout...' : 'Create Workout →'}
            </button>
            {!canCreateWorkout && (
              <p className="text-sm text-red-600 italic">
                Please complete all required fields
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateWorkoutPage;

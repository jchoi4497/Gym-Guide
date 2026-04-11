import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { auth } from '../config/firebase';
import db from '../config/firebase';
import Navbar from '../components/Navbar';
import DropDown from '../components/DropDown';
import MuscleGroupAutocomplete from '../components/MuscleGroupAutocomplete';
import { MUSCLE_GROUP_OPTIONS, SET_RANGE_OPTIONS } from '../config/constants';
import { templateToExerciseData } from '../utils/templateHelpers';

function CreateWorkoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Templates state
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [loadedTemplate, setLoadedTemplate] = useState(null);

  // Wizard step state (1, 2, or 3)
  const [currentStep, setCurrentStep] = useState(1);

  // Draft workout detection
  const [draftWorkout, setDraftWorkout] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);

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

  // Load template from navigation state if provided
  useEffect(() => {
    const loadTemplateFromState = async () => {
      if (!location.state) return;

      let templateToLoad = null;

      // If template object is passed directly (built-in templates)
      if (location.state.template) {
        templateToLoad = location.state.template;
      }
      // If templateId is passed (user templates)
      else if (location.state.templateId && auth.currentUser) {
        try {
          const templateDoc = await getDoc(doc(db, 'userTemplates', auth.currentUser.uid));
          if (templateDoc.exists()) {
            const templates = templateDoc.data().templates || [];
            templateToLoad = templates.find(t => t.id === location.state.templateId);
          }
        } catch (error) {
          console.error('Error loading template:', error);
        }
      }

      // Load the template into the form
      if (templateToLoad) {
        setSelectedMuscleGroup(templateToLoad.muscleGroup || null);
        setCustomMuscleGroupName(templateToLoad.customMuscleGroupName || '');
        setNumberOfSets(templateToLoad.numberOfSets || null);
        setCustomSetCount(templateToLoad.customSetCount?.toString() || '');
        setCustomRepCount(templateToLoad.customRepCount?.toString() || '');
        setLoadedTemplate(templateToLoad);
        setCurrentStep(3); // Auto-advance to date selection
      }
    };

    loadTemplateFromState();
  }, [location.state]);

  // Check for draft workouts on mount
  useEffect(() => {
    const checkForDrafts = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(
          collection(db, 'workoutLogs'),
          where('userId', '==', user.uid),
          where('status', '==', 'draft'),
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const draftDoc = querySnapshot.docs[0];
          setDraftWorkout({ id: draftDoc.id, ...draftDoc.data() });
          setShowDraftModal(true);
        }
      } catch (error) {
        console.error('Error checking for drafts:', error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkForDrafts();
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch recent templates on mount
  useEffect(() => {
    const fetchRecentTemplates = async (userId) => {
      if (!userId) return;

      try {
        // Fetch the user's template document directly (document ID = user.uid)
        const templateDoc = await getDoc(doc(db, 'userTemplates', userId));

        if (templateDoc.exists()) {
          const templatesArray = templateDoc.data().templates || [];
          console.log('Fetched templates:', templatesArray.length);

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

          console.log('Recent templates:', recentThree);
          setRecentTemplates(recentThree);
        } else {
          console.log('No template document found');
          setRecentTemplates([]);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        setRecentTemplates([]);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        fetchRecentTemplates(currentUser.uid);
      } else {
        setRecentTemplates([]);
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
    setLoadedTemplate(template); // Save the template so we can access exercises later
    // Auto-advance to step 3 (date selection) when template is loaded
    setCurrentStep(3);
  };

  const handleMuscleGroupSelect = (option) => {
    setSelectedMuscleGroup(option);
    setLoadedTemplate(null); // Clear loaded template when manually changing selection
    // Clear custom name if switching away from custom
    if (option !== 'custom') {
      setCustomMuscleGroupName('');
      // Auto-advance to step 2 for non-custom selections
      setCurrentStep(2);
    }
  };

  const handleSetCountSelect = (option) => {
    setNumberOfSets(option);
    setLoadedTemplate(null); // Clear loaded template when manually changing selection
    // Clear custom values if switching away from custom
    if (option !== 'custom') {
      setCustomSetCount('');
      setCustomRepCount('');
      // Auto-advance to step 3 for non-custom selections
      setCurrentStep(3);
    }
  };

  const handleResumeDraft = () => {
    if (draftWorkout) {
      navigate(`/workout/${draftWorkout.id}`);
    }
  };

  const handleDeleteDraft = async () => {
    if (!draftWorkout) return;

    try {
      await deleteDoc(doc(db, 'workoutLogs', draftWorkout.id));
      setDraftWorkout(null);
      setShowDraftModal(false);
      console.log('Draft workout deleted');
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Failed to delete draft. Please try again.');
    }
  };

  const handleCreateWorkout = async () => {
    if (!canCreateWorkout || !auth.currentUser) return;

    setIsCreating(true);

    try {
      // Parse workout date
      const [year, month, day] = workoutDate.split('-');
      const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);

      // Convert template exercises to exerciseData format if template was loaded
      let exerciseData = {};
      if (loadedTemplate && loadedTemplate.exercises) {
        exerciseData = templateToExerciseData(loadedTemplate, actualNumberOfSets);
        console.log('✅ Loaded exercises from template:', Object.keys(exerciseData).length);
      }

      // Create draft workout directly in workoutLogs
      const workoutRef = await addDoc(collection(db, 'workoutLogs'), {
        userId: auth.currentUser.uid,
        status: 'draft',
        type: 'program',
        muscleGroup: actualMuscleGroup,
        numberOfSets: actualNumberOfSets,
        customSetCount: numberOfSets === 'custom' ? parseInt(customSetCount) : null,
        customRepCount: numberOfSets === 'custom' && customRepCount ? parseInt(customRepCount) : null,
        exerciseData: exerciseData,
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

  if (authLoading) {
    return (
      <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen pb-20 font-serif">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-20 text-center">
          <p className="text-xl text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen pb-20 font-serif">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 pt-14 pb-20">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-4xl font-extrabold mb-4 text-gray-800">Sign In Required</h1>
              <p className="text-xl text-gray-700 mb-8">
                Please sign in with Google to create and track your workouts.
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">What you'll get:</h2>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Create unlimited custom workouts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Track your progress over time</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Save workout templates for quick access</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>View stats and workout history</span>
                </li>
              </ul>
            </div>
            <p className="text-gray-600 text-sm">
              Use the "Sign In with Google" button in the navigation bar above to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen pb-32 font-serif">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-14 pb-16 sm:pb-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4 text-gray-800">Create Workout</h1>
        <p className="text-base sm:text-lg text-gray-700 italic mb-8 sm:mb-10">
          Set up your workout and start training.
        </p>

        {/* Quick Start - Template Dropdown */}
        <div className="mb-8 sm:mb-10">
          <div className="bg-sky-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">💡 Quick Start - Load Template</h2>
              <Link to="/Templates" className="text-blue-600 hover:text-blue-800 font-semibold text-sm whitespace-nowrap">
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
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg bg-white"
              disabled={recentTemplates.length === 0}
            >
              <option value="">
                {recentTemplates.length === 0
                  ? 'No templates yet - create one from Templates page'
                  : 'Select a template to auto-fill...'}
              </option>
              {recentTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.muscleGroup || template.customMuscleGroupName} - {template.customSetCount || template.numberOfSets}x{template.customRepCount || '8-12'})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2 italic">
              {recentTemplates.length === 0
                ? 'Create templates to quickly start workouts'
                : 'Or fill in the form below to create from scratch'}
            </p>
          </div>
        </div>

        {/* Wizard Progress Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            1
          </div>
          <div className={`w-12 sm:w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            2
          </div>
          <div className={`w-12 sm:w-16 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            3
          </div>
        </div>

        {/* Wizard Card - Shows one step at a time */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-10 pb-8">
          <div className="bg-sky-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl">
            {/* Step 1: Select Workout */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">Step 1: Select Workout</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">Choose your muscle group or workout type</p>
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
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">Step 2: Set × Rep Range</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">Choose your training volume</p>
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
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">Step 3: Workout Date</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">When did you do this workout?</p>
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
          <div className="flex flex-col items-center gap-2 px-4">
            <button
              onClick={handleCreateWorkout}
              disabled={!canCreateWorkout || isCreating}
              className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-green-600 text-white text-lg sm:text-xl font-bold rounded-full shadow-2xl hover:bg-green-700 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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

      {/* Draft Workout Modal */}
      {showDraftModal && draftWorkout && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Resume Draft Workout?
              </h2>
              <p className="text-gray-600">
                You have an unfinished workout
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                {draftWorkout.muscleGroup || 'Workout'}
              </h3>
              <div className="text-sm text-gray-600">
                <p>Created: {draftWorkout.createdAt ? new Date(draftWorkout.createdAt.toDate()).toLocaleDateString() : 'Recently'}</p>
                <p>Sets: {draftWorkout.numberOfSets || 'N/A'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleResumeDraft}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold transition-colors shadow-lg"
              >
                ▶️ Resume Draft
              </button>
              <button
                onClick={handleDeleteDraft}
                className="w-full py-3 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 font-semibold transition-colors"
              >
                Delete Draft
              </button>
              <button
                onClick={() => setShowDraftModal(false)}
                className="w-full py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateWorkoutPage;

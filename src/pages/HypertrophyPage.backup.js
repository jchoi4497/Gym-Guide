import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, getDoc, doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import db from '../firebase';
import DropDown from '../DropDown';
import MuscleGroupWorkout from '../components/MuscleGroupWorkout';
import OptionalWorkoutSections from '../components/OptionalWorkoutSections';
import MuscleGroupAutocomplete from '../components/MuscleGroupAutocomplete';
import TemplateSelector from '../components/TemplateSelector';
import Navbar from '../Navbar';
import WorkoutNotesInput from '../WorkoutNotesInput';
import { generateSummary } from '../summaryUtil';
import { MUSCLE_GROUP_OPTIONS, SET_RANGE_OPTIONS, STORAGE_KEYS, FIREBASE_FIELDS } from '../constants';
import { getMuscleGroupFromCategory } from '../utils/categoryDetection';

// Custom Hooks
import { useWorkoutDraft } from '../hooks/useWorkoutDraft';
import { useTemplateLoader } from '../hooks/useTemplateLoader';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { useExerciseData } from '../hooks/useExerciseData';
import { useStickyButton } from '../hooks/useStickyButton';
import { useWorkoutSaver } from '../hooks/useWorkoutSaver';

// UI Components
import WorkoutHeader from '../components/WorkoutHeader';
import WorkflowChoiceCards from '../components/WorkflowChoiceCards';
import TemplateWorkflowSection from '../components/TemplateWorkflowSection';
import CustomWorkflowSection from '../components/CustomWorkflowSection';
import WorkoutActionButtons from '../components/WorkoutActionButtons';

function HypertrophyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('template');

  // Basic workout state
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [numberOfSets, setNumberOfSets] = useState(null);
  const [note, setNote] = useState('');
  const [workflowMode, setWorkflowMode] = useState('choose');

  // Custom input states
  const [customMuscleGroupName, setCustomMuscleGroupName] = useState('');
  const [customSetCount, setCustomSetCount] = useState('');
  const [customRepCount, setCustomRepCount] = useState('');

  // Section states
  const [cardioAtTop, setCardioAtTop] = useState(false);
  const [absAtTop, setAbsAtTop] = useState(false);
  const [showCardio, setShowCardio] = useState(false);
  const [showAbs, setShowAbs] = useState(false);

  // Workout date (default to today in local timezone)
  const [workoutDate, setWorkoutDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Computed values
  const actualMuscleGroup = useMemo(() => {
    if (selectedMuscleGroup === 'custom' && customMuscleGroupName) {
      return customMuscleGroupName;
    }
    return selectedMuscleGroup;
  }, [selectedMuscleGroup, customMuscleGroupName]);

  const actualNumberOfSets = useMemo(() => {
    if (numberOfSets === 'custom' && customSetCount) {
      return parseInt(customSetCount);
    }
    return numberOfSets;
  }, [numberOfSets, customSetCount]);

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

  // Custom Hooks
  const {
    exerciseData,
    setExerciseData,
    batchInitializeExercises,
    handleExerciseDataChange,
    handleRemoveSet,
  } = useExerciseData(actualNumberOfSets);

  const {
    loadedTemplate,
    setLoadedTemplate,
    isLoadingTemplate,
    selectedTemplateFromDropdown,
    setSelectedTemplateFromDropdown,
    justLoadedTemplate,
    handleTemplateSelect,
  } = useTemplateLoader({
    templateId,
    setSelectedMuscleGroup,
    setCustomMuscleGroupName,
    setNumberOfSets,
    setCustomSetCount,
    setCustomRepCount,
    setShowCardio,
    setCardioAtTop,
    setShowAbs,
    setAbsAtTop,
    setExerciseData,
    setWorkflowMode,
  });

  const {
    previousWorkoutData,
    setPreviousWorkoutData,
    previousCustomExercises,
    previousCustomMuscleGroups,
    favoriteExercises,
    toggleFavorite,
    fetchPreviousWorkout,
    fetchRecentWorkouts,
  } = useWorkoutHistory(actualMuscleGroup);

  useWorkoutDraft({
    templateId,
    isLoadingTemplate,
    selectedTemplateFromDropdown,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    numberOfSets,
    setNumberOfSets,
    exerciseData,
    setExerciseData,
    note,
    setNote,
    customMuscleGroupName,
    setCustomMuscleGroupName,
    customSetCount,
    setCustomSetCount,
    customRepCount,
    setCustomRepCount,
    showCardio,
    setShowCardio,
    showAbs,
    setShowAbs,
    cardioAtTop,
    setCardioAtTop,
    absAtTop,
    setAbsAtTop,
    setLoadedTemplate,
    setSelectedTemplateFromDropdown,
    justLoadedTemplate,
  });

  const isButtonSticky = useStickyButton(isWorkoutConfigured);

  const { isSaving, isGeneratingSummary, handleSaveWorkout } = useWorkoutSaver({
    exerciseData,
    actualMuscleGroup,
    actualNumberOfSets,
    note,
    workoutDate,
    templateId,
    selectedTemplateFromDropdown,
    loadedTemplate,
    cardioAtTop,
    showCardio,
    absAtTop,
    showAbs,
    fetchPreviousWorkout,
  });

  // Handlers for muscle group and set count selection
  const handleMuscleGroupSelect = (option) => {
    setSelectedMuscleGroup(option);
    if (option !== 'custom') {
      setCustomMuscleGroupName('');
    }
    setExerciseData({});
  };

  const handleSetCountSelect = (option) => {
    setNumberOfSets(option);
    if (option !== 'custom') {
      setCustomSetCount('');
      setCustomRepCount('');
    }
    setExerciseData({});
  };
  // Start Workout (navigate to workout tracker)
  const handleStartWorkout = () => {
    // Prepare workout data to pass to StartWorkoutPage
    const workoutDataToPass = {
      workoutName: actualMuscleGroup || 'Workout',
      selectedMuscleGroup: actualMuscleGroup,
      numberOfSets: actualNumberOfSets,
      exerciseData,
      note,
      templateId: templateId || selectedTemplateFromDropdown,
      templateName: loadedTemplate?.name,
      showCardio,
      showAbs,
      cardioAtTop,
      absAtTop,
    };

    // Navigate to StartWorkoutPage with workout data
    navigate('/start-workout', { state: { workoutData: workoutDataToPass } });
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
      setLoadedTemplate(null);
      setSelectedTemplateFromDropdown(null);
      setCustomMuscleGroupName('');
      setCustomSetCount('');
      setCustomRepCount('');
      setShowCardio(false);
      setShowAbs(false);
      setJustLoadedTemplate(false);
      setWorkflowMode('choose'); // Reset to choice screen

      // 2. Clear the local storage draft
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);

      // 3. Scroll to top so user sees the choice screen
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-[150vh] pb-40 font-serif">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-14 pb-20 min-h-screen">
        <WorkoutHeader
          workflowMode={workflowMode}
          selectedMuscleGroup={selectedMuscleGroup}
          actualMuscleGroup={actualMuscleGroup}
          loadedTemplate={loadedTemplate}
          isLoadingTemplate={isLoadingTemplate}
          onReset={handleReset}
          exerciseData={exerciseData}
        />

        {/* Workflow Choice - Only show if nothing selected yet */}
        {workflowMode === 'choose' && !selectedMuscleGroup && !selectedTemplateFromDropdown && Object.keys(exerciseData).length === 0 && (
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">How would you like to train today?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Follow My Program Option */}
              <button
                onClick={() => setWorkflowMode('custom')}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white group relative"
              >
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                  RECOMMENDED
                </div>
                <div className="text-6xl mb-4">💪</div>
                <h3 className="text-2xl font-bold mb-3">Follow My Program</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Use my proven hypertrophy split. Just pick your muscle group and I'll give you the exercises.
                </p>
                <div className="bg-white/20 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span>✓</span>
                    <span>Quick & simple</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span>✓</span>
                    <span>My tested exercises</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Perfect for beginners</span>
                  </div>
                </div>
              </button>

              {/* Use Custom Templates Option */}
              <button
                onClick={() => setWorkflowMode('template')}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white group"
              >
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-2xl font-bold mb-3">Use Custom Templates</h3>
                <p className="text-purple-100 text-sm mb-4">
                  Load your saved templates or create new ones for custom splits (PPL, Upper/Lower, etc.)
                </p>
                <div className="bg-white/20 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span>✓</span>
                    <span>Your saved routines</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span>✓</span>
                    <span>Full customization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Advanced training</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Link to manage templates */}
            <div className="text-center mt-6">
              <Link to="/MyTemplates" className="text-purple-700 hover:text-purple-800 font-semibold text-sm underline">
                Manage My Custom Templates →
              </Link>
            </div>
          </div>
        )}

        {/* Template Mode - Show template selector */}
        {workflowMode === 'template' && (
          <div className="mb-8">
            <div className="bg-sky-50 rounded-3xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Choose Your Template</h2>
                <button
                  onClick={() => {
                    setWorkflowMode('choose');
                    setSelectedTemplateFromDropdown(null);
                    setLoadedTemplate(null);
                    setExerciseData({});
                    setSelectedMuscleGroup(null);
                    setNumberOfSets(null);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  ← Back to choices
                </button>
              </div>

              {/* Option 1: Use existing template */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Load an existing template
                </label>
                <TemplateSelector
                  onSelectTemplate={(templateId) => {
                    handleTemplateSelect(templateId);
                  }}
                  selectedTemplateId={selectedTemplateFromDropdown}
                />
              </div>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm">OR</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Option 2: Create new template */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Don't have a template for this workout yet?
                </p>
                <Link to="/MyTemplates">
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2">
                    <span>➕</span>
                    <span>Create New Template</span>
                  </button>
                </Link>
                <p className="text-xs text-gray-500 mt-2">
                  Build a custom template with your own exercises and save it for future workouts
                </p>
              </div>
            </div>

            {/* Show template info when loaded */}
            {loadedTemplate && (
              <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">{loadedTemplate.name}</h3>
                  {loadedTemplate.description && (
                    <p className="text-blue-800 mb-3">{loadedTemplate.description}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-blue-600 font-semibold">Muscle Group</div>
                      <div className="text-gray-800">{actualMuscleGroup}</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-blue-600 font-semibold">Sets × Reps</div>
                      <div className="text-gray-800">{setRangeLabel}</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-blue-600 font-semibold">Exercises</div>
                      <div className="text-gray-800">{Object.keys(exerciseData).length} loaded</div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-blue-700">
                    ✓ Template loaded! Scroll down to see exercises and start your workout.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Workout Date - Show in both modes when configured */}
        {(workflowMode === 'template' && loadedTemplate) && (
          <div className="mb-8">
            <div className="bg-sky-50 rounded-3xl p-6 shadow-lg max-w-2xl">
              <h2 className="text-2xl font-semibold mb-4">Workout Date</h2>
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
        )}

        {/* Custom Mode - Show manual steps */}
        {workflowMode === 'custom' && (
        <>
          <div className="mb-6 bg-blue-100 border-l-4 border-blue-500 p-4 rounded flex justify-between items-center">
            <p className="text-blue-800 font-semibold">
              📚 Following Jonathan's Program - Select your muscle group and I'll load my proven exercises
            </p>
            {!selectedMuscleGroup && (
              <button
                onClick={() => setWorkflowMode('choose')}
                className="text-sm text-blue-700 hover:text-blue-900 underline font-semibold whitespace-nowrap ml-4"
              >
                ← Back to choices
              </button>
            )}
          </div>
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
        </>
        )}

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
              onBatchInitializeExercises={batchInitializeExercises}
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

        {/* View Workouts button - not sticky */}
        {isWorkoutConfigured && (
          <div className="m-6 px-4 sm:px-20">
            <Link to="/SavedWorkouts">
              <button
                disabled={isSaving}
                className={`px-6 py-3 w-full sm:w-auto rounded-3xl shadow-lg text-sky-50 transition-all duration-300 ${
                  isSaving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-blue-600 active:bg-gray-600 active:scale-95'
                }`}
              >
                View Workouts
              </button>
            </Link>
          </div>
        )}

        {/* Action buttons - sticky on mobile when not at bottom */}
        {isWorkoutConfigured && (
          <div className={`flex flex-col justify-end space-y-4 ${
            isButtonSticky
              ? 'fixed bottom-0 left-0 right-0 bg-gradient-to-t from-sky-300 via-sky-300 to-transparent pt-6 pb-4 px-4 m-0 z-50'
              : 'm-6 px-4 sm:px-20'
          } sm:m-6 sm:px-20 sm:relative sm:bg-none sm:pt-0 sm:pb-0`}>
            {isGeneratingSummary && (
              <div className="text-blue-600 font-semibold animate-pulse">
                🤖 Generating AI summary...
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleStartWorkout}
                disabled={isSaving}
                className={`px-6 py-3 rounded-3xl shadow-lg text-white font-semibold transition-all duration-300 ${
                  isSaving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 active:bg-green-500 active:scale-95'
                }`}
              >
                ▶️ Start Workout
              </button>
              <button
                onClick={handleSaveWorkout}
                disabled={isSaving}
                className={`px-6 py-3 rounded-3xl shadow-lg text-sky-50 transition-all duration-300 ${
                  isSaving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-700 hover:bg-blue-800 active:bg-blue-600 active:scale-95'
                }`}
              >
                {isSaving ? (isGeneratingSummary ? 'Generating Summary...' : 'Saving...') : 'Save Workout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HypertrophyPage;

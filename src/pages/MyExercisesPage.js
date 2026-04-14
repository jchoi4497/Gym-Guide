import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import db from '../config/firebase';
import Navbar from '../components/Navbar';
import { EXERCISE_CATEGORIES } from '../config/exerciseConfig';
import { useTheme } from '../contexts/ThemeContext';

function MyExercisesPage() {
  const [customExercises, setCustomExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'name'
  const formRef = useRef(null);
  const { theme } = useTheme();

  // Form state
  const [exerciseName, setExerciseName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isBodyweight, setIsBodyweight] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');

  // Category options for dropdown
  const categoryOptions = [
    { label: '--- Chest ---', value: '', disabled: true },
    { label: 'Shoulder Press', value: EXERCISE_CATEGORIES.SHOULDER_PRESS },
    { label: 'Incline Press', value: EXERCISE_CATEGORIES.INCLINE_PRESS },
    { label: 'Chest Press', value: EXERCISE_CATEGORIES.CHEST_PRESS },
    { label: 'Chest Fly', value: EXERCISE_CATEGORIES.CHEST_FLY },
    { label: 'Triceps', value: EXERCISE_CATEGORIES.TRICEP_PRIMARY },

    { label: '--- Back ---', value: '', disabled: true },
    { label: 'Pull Up / Chin Up', value: EXERCISE_CATEGORIES.PULLUP },
    { label: 'Row', value: EXERCISE_CATEGORIES.ROW },
    { label: 'Lat Pulldown', value: EXERCISE_CATEGORIES.LAT_PULLDOWN },
    { label: 'Biceps', value: EXERCISE_CATEGORIES.BICEP_PRIMARY },

    { label: '--- Legs ---', value: '', disabled: true },
    { label: 'Squat / Leg Press', value: EXERCISE_CATEGORIES.SQUAT },
    { label: 'Split Squat / Lunge', value: EXERCISE_CATEGORIES.SPLIT_SQUAT },
    { label: 'Deadlift / RDL', value: EXERCISE_CATEGORIES.BACK_EXTENSION },
    { label: 'Calf Raise', value: EXERCISE_CATEGORIES.CALF_RAISE },

    { label: '--- Shoulders ---', value: '', disabled: true },
    { label: 'Rear Delt', value: EXERCISE_CATEGORIES.REAR_DELT_PRIMARY },
    { label: 'Lateral Raise', value: EXERCISE_CATEGORIES.LAT_RAISE_PRIMARY },
    { label: 'Front Raise', value: EXERCISE_CATEGORIES.FRONT_RAISE },
    { label: 'Wrist Curl', value: EXERCISE_CATEGORIES.WRIST_CURL },

    { label: '--- Cardio ---', value: '', disabled: true },
    { label: 'Cardio', value: EXERCISE_CATEGORIES.CARDIO },

    { label: '--- Abs ---', value: '', disabled: true },
    { label: 'Abs / Core', value: EXERCISE_CATEGORIES.ABS },
  ];

  // Muscle group options for manual selection
  const muscleGroupOptions = [
    { label: 'Back', value: 'back' },
    { label: 'Chest', value: 'chest' },
    { label: 'Legs', value: 'legs' },
    { label: 'Shoulders', value: 'shoulders' },
    { label: 'Arms', value: 'arms' },
    { label: 'Cardio', value: 'cardio' },
    { label: 'Core', value: 'core' },
    { label: 'Full Body', value: 'fullbody' },
    { label: 'Other', value: 'custom' },
  ];

  // Fetch custom exercises (no auto-import)
  useEffect(() => {
    fetchCustomExercises();
  }, []);

  const fetchCustomExercises = async () => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const docRef = doc(db, 'userCustomExercises', user.uid);
      const docSnap = await getDoc(docRef);
      const savedExercises = docSnap.exists() ? docSnap.data().exercises || [] : [];
      setCustomExercises(savedExercises);
    } catch (error) {
      console.error('Error fetching custom exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCustomExercises = async (exercises) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, 'userCustomExercises', user.uid);
      await setDoc(docRef, { exercises });
      setCustomExercises(exercises);
    } catch (error) {
      console.error('Error saving custom exercises:', error);
      alert('Error saving exercises. Please try again.');
    }
  };

  const handleAddExercise = async () => {
    const categoryToUse = isCreatingCategory ? customCategory.trim() : selectedCategory;

    if (!exerciseName.trim() || !categoryToUse) {
      alert('Please enter exercise name and select/create a category');
      return;
    }

    if (!selectedMuscleGroup) {
      alert('Please select a muscle group');
      return;
    }

    const newExercise = {
      id: `custom_${Date.now()}`,
      name: exerciseName.trim(),
      category: categoryToUse,
      muscleGroup: selectedMuscleGroup,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      isCustomCategory: isCreatingCategory,
      isBodyweight: isBodyweight,
      metricType: isBodyweight ? 'bodyweight' : 'weighted',
    };

    await saveCustomExercises([...customExercises, newExercise]);

    // Reset form
    setExerciseName('');
    setSelectedCategory('');
    setCustomCategory('');
    setNotes('');
    setIsBodyweight(false);
    setSelectedMuscleGroup('');
    setIsAdding(false);
    setIsCreatingCategory(false);
  };

  const handleEditExercise = async () => {
    const categoryToUse = isCreatingCategory ? customCategory.trim() : selectedCategory;

    if (!exerciseName.trim() || !categoryToUse) {
      alert('Please enter exercise name and select/create a category');
      return;
    }

    if (!selectedMuscleGroup) {
      alert('Please select a muscle group');
      return;
    }

    const updated = customExercises.map(ex =>
      ex.id === editingId
        ? {
            ...ex,
            name: exerciseName.trim(),
            category: categoryToUse,
            muscleGroup: selectedMuscleGroup,
            notes: notes.trim(),
            isCustomCategory: isCreatingCategory,
            isBodyweight: isBodyweight,
            metricType: isBodyweight ? 'bodyweight' : 'weighted',
          }
        : ex
    );

    await saveCustomExercises(updated);

    // Reset form
    setExerciseName('');
    setSelectedCategory('');
    setCustomCategory('');
    setNotes('');
    setSelectedMuscleGroup('');
    setEditingId(null);
    setIsCreatingCategory(false);
  };

  const handleDeleteExercise = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exercise?')) return;

    const filtered = customExercises.filter(ex => ex.id !== id);
    await saveCustomExercises(filtered);
  };

  const startEdit = (exercise) => {
    setEditingId(exercise.id);
    setExerciseName(exercise.name);

    // Check if the category exists in preset options
    const categoryExists = categoryOptions.some(opt => opt.value === exercise.category && !opt.disabled);

    if (exercise.isCustomCategory || !categoryExists) {
      setIsCreatingCategory(true);
      setCustomCategory(exercise.category || '');
      setSelectedCategory('');
    } else {
      setIsCreatingCategory(false);
      setSelectedCategory(exercise.category || '');
      setCustomCategory('');
    }
    setNotes(exercise.notes || '');
    setIsBodyweight(exercise.isBodyweight || false);
    setSelectedMuscleGroup(exercise.muscleGroup || '');
    setIsAdding(false);
  };


  const cancelForm = () => {
    setExerciseName('');
    setSelectedCategory('');
    setCustomCategory('');
    setNotes('');
    setIsBodyweight(false);
    setSelectedMuscleGroup('');
    setIsAdding(false);
    setEditingId(null);
    setIsCreatingCategory(false);
  };

  // Sort exercises based on sortBy
  const sortedExercises = [...customExercises].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      // Sort by date (newest first)
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  if (isLoading) return <div className={`${theme.pageBg} min-h-screen flex items-center justify-center ${theme.cardText}`}>Loading...</div>;

  return (
    <div className={`${theme.pageBg} min-h-screen pb-32 font-serif`}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-14">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-5xl font-extrabold ${theme.headerText}`}>My Custom Exercises</h1>
          {!isAdding && !editingId && (
            <button
              onClick={() => {
                setIsAdding(true);
                setTimeout(() => {
                  formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className={`px-6 py-3 ${theme.btnPrimary} ${theme.btnPrimaryText} rounded-lg font-semibold shadow-lg transition-all active:scale-95`}
            >
              + Add Exercise
            </button>
          )}
        </div>

        <div className={`${theme.cardBgSecondary} border ${theme.cardBorder} rounded-lg p-4 mb-6`}>
          <p className={theme.cardText}>
            <strong>What is this page for?</strong> Organize your custom exercises with proper categories. This enables the graph toggle feature and better exercise comparison.
          </p>
          <ul className={`${theme.cardTextSecondary} text-sm mt-2 space-y-1`}>
            <li>✅ <strong>Auto-saved:</strong> Custom exercises are automatically added here when you complete workouts</li>
            <li>✏️ <strong>Manual:</strong> You can also add exercises here before creating workouts</li>
          </ul>

          {/* Sort Toggle */}
          {customExercises.length > 0 && !isAdding && !editingId && (
            <div className={`flex items-center gap-2 mt-4 pt-4 border-t ${theme.cardBorder}`}>
              <span className={`text-sm font-medium ${theme.cardText}`}>Sort by:</span>
              <button
                onClick={() => setSortBy('date')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'date'
                    ? `${theme.btnPrimary} ${theme.btnPrimaryText}`
                    : `${theme.btnSecondary} ${theme.btnSecondaryText}`
                }`}
              >
                📅 Date Added
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'name'
                    ? `${theme.btnPrimary} ${theme.btnPrimaryText}`
                    : `${theme.btnSecondary} ${theme.btnSecondaryText}`
                }`}
              >
                🔤 Name (A-Z)
              </button>
            </div>
          )}
        </div>

        {/* Add Form Only */}
        {isAdding && (
          <div ref={formRef} className={`${theme.cardBg} rounded-lg shadow-lg p-6 mb-8 border-4 ${theme.cardBorder}`}>
            <h2 className={`text-2xl font-bold mb-4 ${theme.cardText}`}>
              Add New Exercise
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${theme.cardText} mb-2`}>
                  Exercise Name *
                </label>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="e.g., Cable Shoulder Press"
                  className={`w-full px-4 py-2 border ${theme.inputBorder} ${theme.inputBg} rounded-lg focus:outline-none ${theme.inputFocus}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme.cardText} mb-2`}>
                  Category *
                </label>

                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      !isCreatingCategory
                        ? `${theme.btnPrimary} ${theme.btnPrimaryText}`
                        : `${theme.btnSecondary} ${theme.btnSecondaryText}`
                    }`}
                  >
                    Select Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(true)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isCreatingCategory
                        ? `${theme.btnPrimary} ${theme.btnPrimaryText}`
                        : `${theme.btnSecondary} ${theme.btnSecondaryText}`
                    }`}
                  >
                    Create Custom
                  </button>
                </div>

                {isCreatingCategory ? (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name..."
                    className={`w-full px-4 py-2 border ${theme.inputBorder} ${theme.inputBg} rounded-lg focus:outline-none ${theme.inputFocus}`}
                  />
                ) : (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`w-full px-4 py-2 border ${theme.inputBorder} ${theme.inputBg} rounded-lg focus:outline-none ${theme.inputFocus}`}
                  >
                    <option value="">Select a category...</option>
                    {categoryOptions.map((opt, idx) => (
                      <option key={idx} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme.cardText} mb-2`}>
                  Muscle Group *
                </label>
                <select
                  value={selectedMuscleGroup}
                  onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                  className={`w-full px-4 py-2 border ${theme.inputBorder} ${theme.inputBg} rounded-lg focus:outline-none ${theme.inputFocus}`}
                >
                  <option value="">Select muscle group...</option>
                  {muscleGroupOptions.map((opt, idx) => (
                    <option key={idx} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme.cardText} mb-2`}>
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about this exercise..."
                  rows={3}
                  className={`w-full px-4 py-2 border ${theme.inputBorder} ${theme.inputBg} rounded-lg focus:outline-none ${theme.inputFocus}`}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBodyweight}
                    onChange={(e) => setIsBodyweight(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className={`text-sm font-medium ${theme.cardText}`}>
                    Bodyweight Exercise (e.g., Pull-ups, Push-ups)
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddExercise}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all active:scale-95"
                >
                  Add Exercise
                </button>
                <button
                  onClick={cancelForm}
                  className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-semibold transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exercise List */}
        <div className="space-y-4">
          {customExercises.length === 0 ? (
            <div className={`${theme.cardBg} rounded-lg shadow-lg p-8 text-center ${theme.cardTextSecondary}`}>
              <p className="text-xl mb-2">No custom exercises yet</p>
              <p>Click "Add Exercise" to create your first custom exercise</p>
            </div>
          ) : (
            sortedExercises.map((exercise) => (
              <div
                key={exercise.id}
                className={`rounded-lg shadow-lg p-6 transition-colors ${
                  editingId === exercise.id
                    ? `${theme.cardBgSecondary} border-4 ${theme.cardBorder}`
                    : theme.cardBg
                }`}
              >
                {editingId === exercise.id ? (
                  /* Inline Edit Form */
                  <div className="space-y-4">
                    <h2 className={`text-2xl font-bold mb-4 ${theme.cardText}`}>Edit Exercise</h2>

                    <div>
                      <label className={`block text-sm font-medium ${theme.cardText} mb-2`}>
                        Exercise Name *
                      </label>
                      <input
                        type="text"
                        value={exerciseName}
                        onChange={(e) => setExerciseName(e.target.value)}
                        placeholder="e.g., Cable Shoulder Press"
                        className={`w-full px-4 py-2 border ${theme.inputBorder} ${theme.inputBg} rounded-lg focus:outline-none ${theme.inputFocus}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${theme.cardText} mb-2`}>
                        Category *
                      </label>

                      <div className="flex gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setIsCreatingCategory(false)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            !isCreatingCategory
                              ? `${theme.btnPrimary} ${theme.btnPrimaryText}`
                              : `${theme.btnSecondary} ${theme.btnSecondaryText}`
                          }`}
                        >
                          Select Preset
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCreatingCategory(true)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            isCreatingCategory
                              ? `${theme.btnPrimary} ${theme.btnPrimaryText}`
                              : `${theme.btnSecondary} ${theme.btnSecondaryText}`
                          }`}
                        >
                          Create Custom
                        </button>
                      </div>

                      {isCreatingCategory ? (
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Enter custom category name..."
                          className={`w-full px-4 py-2 border ${theme.inputBorder} ${theme.inputBg} rounded-lg focus:outline-none ${theme.inputFocus}`}
                        />
                      ) : (
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className={`w-full px-4 py-2 border ${theme.inputBorder} ${theme.inputBg} rounded-lg focus:outline-none ${theme.inputFocus}`}
                        >
                          <option value="">Select a category...</option>
                          {categoryOptions.map((opt, idx) => (
                            <option key={idx} value={opt.value} disabled={opt.disabled}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${theme.cardText} mb-2`}>
                        Muscle Group *
                      </label>
                      <select
                        value={selectedMuscleGroup}
                        onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                        className={`w-full px-4 py-2 border ${theme.inputBorder} ${theme.inputBg} rounded-lg focus:outline-none ${theme.inputFocus}`}
                      >
                        <option value="">Select muscle group...</option>
                        {muscleGroupOptions.map((opt, idx) => (
                          <option key={idx} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${theme.cardText} mb-2`}>
                        Notes (optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any notes about this exercise..."
                        rows={3}
                        className={`w-full px-4 py-2 border ${theme.inputBorder} ${theme.inputBg} rounded-lg focus:outline-none ${theme.inputFocus}`}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isBodyweight}
                          onChange={(e) => setIsBodyweight(e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                        <span className={`text-sm font-medium ${theme.cardText}`}>
                          Bodyweight Exercise (e.g., Pull-ups, Push-ups)
                        </span>
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleEditExercise}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all active:scale-95"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={cancelForm}
                        className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-semibold transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal Card View */
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-2xl font-bold ${theme.cardText} mb-2 break-words`}>{exercise.name}</h3>
                      <div className={`flex gap-2 text-sm ${theme.cardTextSecondary} flex-wrap`}>
                        <span className={`${theme.cardBgSecondary} ${theme.cardText} px-3 py-1 rounded-full break-words`}>
                          {exercise.category}
                        </span>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                          {exercise.muscleGroup}
                        </span>
                        {exercise.isBodyweight && (
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                            💪 Bodyweight
                          </span>
                        )}
                      </div>
                      {exercise.notes && (
                        <p className={`mt-2 ${theme.cardTextSecondary} italic break-words`}>{exercise.notes}</p>
                      )}
                    </div>

                    <div className="flex gap-2 sm:flex-shrink-0">
                      <button
                        onClick={() => startEdit(exercise)}
                        className={`px-4 py-2 ${theme.btnPrimary} ${theme.btnPrimaryText} rounded-lg text-sm font-medium transition-all active:scale-95 whitespace-nowrap`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExercise(exercise.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all active:scale-95 whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyExercisesPage;

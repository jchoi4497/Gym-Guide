import { useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../firebase';
import db from '../firebase';
import Navbar from '../Navbar';
import { EXERCISE_CATEGORIES } from '../config/exerciseConfig';
import { FIREBASE_FIELDS } from '../constants';
import { getMuscleGroupFromCategory, detectCategoryFromName } from '../utils/categoryDetection';

function MyExercisesPage() {
  const [customExercises, setCustomExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'name'

  // Form state
  const [exerciseName, setExerciseName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isBodyweight, setIsBodyweight] = useState(false);

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

  // Fetch custom exercises from Firebase
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

      if (docSnap.exists()) {
        const data = docSnap.data();
        setCustomExercises(data.exercises || []);
      }
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

    const newExercise = {
      id: `custom_${Date.now()}`,
      name: exerciseName.trim(),
      category: categoryToUse,
      muscleGroup: getMuscleGroupFromCategory(categoryToUse) || 'custom',
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
    setIsAdding(false);
    setIsCreatingCategory(false);
  };

  const handleEditExercise = async () => {
    const categoryToUse = isCreatingCategory ? customCategory.trim() : selectedCategory;

    if (!exerciseName.trim() || !categoryToUse) {
      alert('Please enter exercise name and select/create a category');
      return;
    }

    const updated = customExercises.map(ex =>
      ex.id === editingId
        ? {
            ...ex,
            name: exerciseName.trim(),
            category: categoryToUse,
            muscleGroup: getMuscleGroupFromCategory(categoryToUse) || ex.muscleGroup || 'custom',
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
    if (exercise.isCustomCategory) {
      setIsCreatingCategory(true);
      setCustomCategory(exercise.category);
    } else {
      setIsCreatingCategory(false);
      setSelectedCategory(exercise.category);
    }
    setNotes(exercise.notes || '');
    setIsBodyweight(exercise.isBodyweight || false);
    setIsAdding(false);
  };

  // Import exercises from workout history
  const handleImportFromHistory = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Please sign in to import exercises.');
      return;
    }

    try {
      const q = query(
        collection(db, 'workoutLogs'),
        where(FIREBASE_FIELDS.USER_ID, '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      console.log('Found', querySnapshot.size, 'workout documents');
      const foundExercises = new Map();

      querySnapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const exerciseData = data.exerciseData || data.inputs || {};

        console.log('Checking workout:', docSnapshot.id, 'with', Object.keys(exerciseData).length, 'exercises');

        Object.entries(exerciseData).forEach(([key, exercise]) => {
          const exerciseName = exercise.exerciseName || exercise.selection;

          // Only include custom exercises (not preset IDs)
          if (exerciseName && (key.startsWith('custom_') || !exerciseName.match(/^[a-z]+$/))) {
            const normalizedName = exerciseName.toLowerCase().trim();

            // Skip if already in My Exercises
            const alreadyExists = customExercises.some(
              ex => ex.name.toLowerCase().trim() === normalizedName
            );

            if (!alreadyExists && !foundExercises.has(normalizedName)) {
              const detectedCategory = exercise.detectedCategory || detectCategoryFromName(exerciseName);

              console.log('Found custom exercise:', exerciseName, 'Category:', detectedCategory);

              foundExercises.set(normalizedName, {
                id: `imported_${Date.now()}_${Math.random()}`,
                name: exerciseName,
                category: detectedCategory || 'uncategorized',
                muscleGroup: detectedCategory ? getMuscleGroupFromCategory(detectedCategory) || 'custom' : 'custom',
                notes: 'Imported from workout history',
                createdAt: new Date().toISOString(),
                isCustomCategory: !detectedCategory,
              });
            }
          }
        });
      });

      console.log('Total custom exercises found:', foundExercises.size);

      const importedCount = foundExercises.size;

      if (importedCount === 0) {
        alert('No new exercises found in workout history.');
        return;
      }

      const confirmed = window.confirm(
        `Found ${importedCount} custom exercise(s) from your workout history. Import them?`
      );

      if (confirmed) {
        const allExercises = [...customExercises, ...Array.from(foundExercises.values())];
        await saveCustomExercises(allExercises);
        alert(`Successfully imported ${importedCount} exercise(s)!`);
      }
    } catch (error) {
      console.error('Error importing from history:', error);
      alert('Error importing exercises. Please try again.');
    }
  };

  const cancelForm = () => {
    setExerciseName('');
    setSelectedCategory('');
    setCustomCategory('');
    setNotes('');
    setIsBodyweight(false);
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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen pb-32 font-serif">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-14">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-extrabold text-gray-800">My Custom Exercises</h1>
          {!isAdding && !editingId && (
            <div className="flex gap-3">
              <button
                onClick={handleImportFromHistory}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-lg transition-all active:scale-95"
              >
                📥 Import from History
              </button>
              <button
                onClick={() => setIsAdding(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition-all active:scale-95"
              >
                + Add Exercise
              </button>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-gray-700">
            <strong>What is this page for?</strong> Organize your custom exercises with proper categories.
            This enables the graph toggle feature and better exercise comparison.
          </p>
          <ul className="text-gray-600 text-sm mt-2 space-y-1">
            <li>✅ <strong>Auto-saved:</strong> Custom exercises are automatically added here when you save workouts</li>
            <li>✏️ <strong>Manual:</strong> You can also add exercises here before creating workouts</li>
            <li>📥 <strong>Import:</strong> Click "Import from History" to find exercises from old workouts (before auto-save)</li>
          </ul>

          {/* Sort Toggle */}
          {customExercises.length > 0 && !isAdding && !editingId && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-blue-200">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <button
                onClick={() => setSortBy('date')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'date'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📅 Date Added
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'name'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🔤 Name (A-Z)
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Edit Exercise' : 'Add New Exercise'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="e.g., Cable Shoulder Press"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>

                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      !isCreatingCategory
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Select Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(true)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isCreatingCategory
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about this exercise..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBodyweight}
                    onChange={(e) => setIsBodyweight(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Bodyweight Exercise (e.g., Pull-ups, Push-ups)
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={editingId ? handleEditExercise : handleAddExercise}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all active:scale-95"
                >
                  {editingId ? 'Save Changes' : 'Add Exercise'}
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
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
              <p className="text-xl mb-2">No custom exercises yet</p>
              <p>Click "Add Exercise" to create your first custom exercise</p>
            </div>
          ) : (
            sortedExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white rounded-2xl shadow-lg p-6 flex justify-between items-start"
              >
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{exercise.name}</h3>
                  <div className="flex gap-2 text-sm text-gray-600 flex-wrap">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
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
                    <p className="mt-2 text-gray-600 italic">{exercise.notes}</p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEdit(exercise)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all active:scale-95"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all active:scale-95"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyExercisesPage;

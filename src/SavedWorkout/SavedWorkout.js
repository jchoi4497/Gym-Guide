import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import db, { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import { generateSummary } from '../utils/summaryUtil';
import WorkoutInputs from './WorkoutInputs';
import WorkoutNotes from './WorkoutNotes';
import WorkoutAnalysis from './WorkoutAnalysis';
import AddExerciseButton from '../components/AddExerciseButton';
import OptionalWorkoutSections from '../components/OptionalWorkoutSections';
import SaveAsTemplateButton from '../components/SaveAsTemplateButton';
import { FIREBASE_FIELDS, MUSCLE_GROUP_OPTIONS } from '../config/constants';
import { useTheme } from '../contexts/ThemeContext';

function SavedWorkout() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [workoutData, setWorkoutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [editedInputs, setEditedInputs] = useState({});
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState('');
  const [previousWorkoutData, setPreviousWorkoutData] = useState(null);
  const [monthlyWorkoutData, setMonthlyWorkoutData] = useState([]);
  const [graphView, setGraphView] = useState('previous');
  const [exerciseOrder, setExerciseOrder] = useState([]);
  const [previousCustomExercises, setPreviousCustomExercises] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editedDate, setEditedDate] = useState('');

  // Optional sections state
  const [showCardio, setShowCardio] = useState(false);
  const [showAbs, setShowAbs] = useState(false);
  const [cardioAtTop, setCardioAtTop] = useState(false);
  const [absAtTop, setAbsAtTop] = useState(false);
  const [sectionOrder, setSectionOrder] = useState('abs-first'); // 'abs-first' or 'cardio-first'

  // Sticky button state for mobile
  const [isButtonSticky, setIsButtonSticky] = useState(true);

  // Expand/collapse all state - default to expanded (true)
  const [expandAll, setExpandAll] = useState(true);

  //used to get label of workout on savedworkout page
  const getLabel = (value) =>
    MUSCLE_GROUP_OPTIONS.find((option) => option.value === value)?.label || value;

  const categoryOrder = {
    chest: ['incline', 'chestpress', 'fly', 'tri', 'tri2'],
    back: ['pullup', 'row', 'lat', 'bicep', 'bicep2'],
    legs: ['squat', 'splitsquat', 'backextension', 'backextension2', 'calfraise'],
    shoulders: ['shoulderpress', 'reardelt', 'latraise', 'reardelt2', 'latraise2', 'frontraise', 'wristcurl', 'reversewristcurl'],
  };

  const fetchPreviousWorkout = async (muscleGroup, currentDate) => {
    const user = auth.currentUser;
    if (!user || !muscleGroup || !currentDate) return;

    // Check if this is a preset muscle group or custom
    const isPresetMuscleGroup = ['chest', 'back', 'legs', 'shoulders'].includes(muscleGroup);

    try {
      let q;

      if (isPresetMuscleGroup) {
        // For preset muscle groups, fetch workouts from the same muscle group
        // But ALSO fetch recent workouts from all groups for abs/cardio comparison

        // Query 1: Same muscle group workouts (for main exercises)
        q = query(
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

        const muscleGroupDocs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Query 2: Recent workouts from ALL muscle groups (for abs/cardio comparison)
        const allWorkoutsQuery = query(
          collection(db, 'workoutLogs'),
          where(FIREBASE_FIELDS.USER_ID, '==', user.uid),
          where(FIREBASE_FIELDS.DATE, '<', currentDate),
          orderBy(FIREBASE_FIELDS.DATE, 'desc'),
          limit(10), // Get more workouts to find abs/cardio exercises
        );

        const allWorkoutsSnapshot = await getDocs(allWorkoutsQuery);
        const allDocs = allWorkoutsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Combine both datasets: prioritize same muscle group, then add others
        // Remove duplicates by using a Map keyed by document ID
        const combinedMap = new Map();

        // Add same muscle group workouts first (these are prioritized)
        muscleGroupDocs.forEach(doc => combinedMap.set(doc.id, doc));

        // Add workouts from all muscle groups (for abs/cardio)
        allDocs.forEach(doc => {
          if (!combinedMap.has(doc.id)) {
            combinedMap.set(doc.id, doc);
          }
        });

        // Convert back to array and sort by date (most recent first)
        const combinedDocs = Array.from(combinedMap.values()).sort((a, b) => {
          const aTime = a.date?.seconds || 0;
          const bTime = b.date?.seconds || 0;
          return bTime - aTime;
        });

        // Use combined docs for monthly data (includes both same muscle group and others)
        setMonthlyWorkoutData(combinedDocs);
        setPreviousWorkoutData(muscleGroupDocs[0] || allDocs[0] || null);
      } else {
        // For custom muscle groups, fetch recent workouts across ALL muscle groups
        // This allows exercise-level comparison (e.g., "Push Day" can compare with "Chest/Triceps")
        q = query(
          collection(db, 'workoutLogs'),
          where(FIREBASE_FIELDS.USER_ID, '==', user.uid),
          where(FIREBASE_FIELDS.DATE, '<', currentDate),
          orderBy(FIREBASE_FIELDS.DATE, 'desc'),
          limit(20), // Fetch more workouts for exercise matching across different splits
        );

        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // For custom groups, use all docs for comparison (DataChart will match by exercise name)
        setMonthlyWorkoutData(docs);
        setPreviousWorkoutData(docs[0] || null);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

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

        // Check if workout has cardio or abs data and auto-show those sections
        const hasCardio = Object.keys(exerciseData).some(key =>
          key.includes('cardio') || exerciseData[key]?.exerciseName?.toLowerCase().includes('cardio')
        );
        const hasAbs = Object.keys(exerciseData).some(key =>
          key.includes('abs') || exerciseData[key]?.exerciseName?.toLowerCase().includes('abs')
        );
        if (hasCardio) setShowCardio(true);
        if (hasAbs) setShowAbs(true);

        // Set the date for editing (convert Firebase timestamp to YYYY-MM-DD)
        if (data.date) {
          const workoutDate = data.date.toDate ? data.date.toDate() : new Date(data.date.seconds * 1000);
          const year = workoutDate.getFullYear();
          const month = String(workoutDate.getMonth() + 1).padStart(2, '0');
          const day = String(workoutDate.getDate()).padStart(2, '0');
          setEditedDate(`${year}-${month}-${day}`);
        }

        // Load exercise order - use saved order if available, otherwise create default
        if (data.exerciseOrder && data.exerciseOrder.length > 0) {
          // CRITICAL FIX: Check if saved order is incomplete (missing exercises)
          const exerciseKeys = Object.keys(exerciseData);
          const mainExerciseKeys = exerciseKeys.filter(k =>
            !k.toLowerCase().includes('cardio') &&
            !k.toLowerCase().includes('abs')
          );
          const savedOrderMainKeys = data.exerciseOrder.filter(k =>
            !k.toLowerCase().includes('cardio') &&
            !k.toLowerCase().includes('abs')
          );

          // If saved order is missing exercises, reconstruct it
          if (savedOrderMainKeys.length < mainExerciseKeys.length) {
            console.warn('⚠️ [SavedWorkout] Incomplete exerciseOrder detected!', {
              saved: savedOrderMainKeys.length,
              actual: mainExerciseKeys.length,
              missing: mainExerciseKeys.filter(k => !data.exerciseOrder.includes(k))
            });

            // Reconstruct: use saved order for exercises that are in it, then append missing ones
            const missingKeys = mainExerciseKeys.filter(k => !data.exerciseOrder.includes(k));
            const reconstructedOrder = [...data.exerciseOrder, ...missingKeys];
            console.log('💾 [SavedWorkout] Reconstructed order:', reconstructedOrder);
            setExerciseOrder(reconstructedOrder);
          } else {
            // Saved order is complete, use it as-is
            setExerciseOrder(data.exerciseOrder);
          }
        } else {
          // No saved order - create default from category order (for old workouts)
          const inputKeys = Object.keys(exerciseData);
          const muscleGroup = data.muscleGroup || data.target;
          const orderedKeysFromCategory = categoryOrder[muscleGroup] || [];
          const sorted = [
            ...orderedKeysFromCategory.filter((key) => inputKeys.includes(key)),
            ...inputKeys.filter((key) => !orderedKeysFromCategory.includes(key)),
          ];
          setExerciseOrder(sorted);
        }

        // Load section order and positions if available
        if (data.sectionOrder) {
          setSectionOrder(data.sectionOrder);
        }
        if (data.cardioAtTop !== undefined) {
          setCardioAtTop(data.cardioAtTop);
        }
        if (data.absAtTop !== undefined) {
          setAbsAtTop(data.absAtTop);
        }
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
    setHasUnsavedChanges(true);

    // Scroll down to show the new exercise after state updates
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      });
    });
  };

  const handleRemoveExercise = (rowId) => {
    setExerciseOrder((prev) => prev.filter((id) => id !== rowId));
    setEditedInputs((prev) => {
      const updated = { ...prev };
      delete updated[rowId];
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const handleReorderExercises = (newOrder) => {
    setExerciseOrder(newOrder);
    setHasUnsavedChanges(true);
  };

  // Handler for optional sections (cardio/abs)
  const handleOptionalExerciseChange = (categoryKey, exerciseName, setIndex, setInput, selectionId) => {
    const updatedInputs = { ...editedInputs };
    const numberOfSets = workoutData?.numberOfSets || 4;

    if (!updatedInputs[categoryKey]) {
      const setsArray = new Array(numberOfSets).fill('');
      updatedInputs[categoryKey] = {
        sets: setsArray,
        exerciseName: exerciseName,
        selection: selectionId || exerciseName,
      };
    }

    if (setIndex === -1) {
      // -1 means changing the exercise selection
      updatedInputs[categoryKey].exerciseName = exerciseName;
      if (selectionId !== null && selectionId !== undefined) {
        updatedInputs[categoryKey].selection = selectionId;
      }
    } else {
      // Otherwise updating a specific set
      updatedInputs[categoryKey].sets[setIndex] = setInput;
    }

    setEditedInputs(updatedInputs);
    setHasUnsavedChanges(true);
  };

  // Toggle functions for optional sections
  const handleToggleCardioPosition = () => {
    setCardioAtTop(!cardioAtTop);
    setHasUnsavedChanges(true);
  };

  const handleToggleAbsPosition = () => {
    setAbsAtTop(!absAtTop);
    setHasUnsavedChanges(true);
  };

  // Move handlers for cardio/abs sections
  const handleCardioMoveUp = () => {
    if (!cardioAtTop) {
      // Cardio is at bottom
      if (!absAtTop) {
        // Both at bottom - check order
        if (sectionOrder === 'abs-first') {
          // Abs is first, Cardio is second - swap them
          setSectionOrder('cardio-first');
        } else {
          // Cardio is already first at bottom - move to top
          setCardioAtTop(true);
        }
      } else {
        // Abs is at top, Cardio at bottom - just move Cardio to top
        setCardioAtTop(true);
      }
    } else {
      // Cardio is already at top - maybe swap order if both at top
      if (absAtTop && sectionOrder === 'cardio-first') {
        setSectionOrder('abs-first');
      }
    }
    setHasUnsavedChanges(true);
  };

  const handleCardioMoveDown = () => {
    if (cardioAtTop) {
      // Cardio is at top
      if (absAtTop) {
        // Both at top - check order
        if (sectionOrder === 'cardio-first') {
          // Cardio is first, Abs is second - swap them
          setSectionOrder('abs-first');
        } else {
          // Cardio is already second at top - move to bottom
          setCardioAtTop(false);
        }
      } else {
        // Abs is at bottom, Cardio at top - just move Cardio to bottom
        setCardioAtTop(false);
      }
    } else {
      // Cardio is already at bottom - maybe swap order if both at bottom
      if (!absAtTop && sectionOrder === 'abs-first') {
        setSectionOrder('cardio-first');
      }
    }
    setHasUnsavedChanges(true);
  };

  const handleAbsMoveUp = () => {
    if (!absAtTop) {
      // Abs is at bottom
      if (!cardioAtTop) {
        // Both at bottom - check order
        if (sectionOrder === 'cardio-first') {
          // Cardio is first, Abs is second - swap them
          setSectionOrder('abs-first');
        } else {
          // Abs is already first at bottom - move to top
          setAbsAtTop(true);
        }
      } else {
        // Cardio is at top, Abs at bottom - just move Abs to top
        setAbsAtTop(true);
      }
    } else {
      // Abs is already at top - maybe swap order if both at top
      if (cardioAtTop && sectionOrder === 'abs-first') {
        setSectionOrder('cardio-first');
      }
    }
    setHasUnsavedChanges(true);
  };

  const handleAbsMoveDown = () => {
    if (absAtTop) {
      // Abs is at top
      if (cardioAtTop) {
        // Both at top - check order
        if (sectionOrder === 'abs-first') {
          // Abs is first, Cardio is second - swap them
          setSectionOrder('cardio-first');
        } else {
          // Abs is already second at top - move to bottom
          setAbsAtTop(false);
        }
      } else {
        // Cardio is at bottom, Abs at top - just move Abs to bottom
        setAbsAtTop(false);
      }
    } else {
      // Abs is already at bottom - maybe swap order if both at bottom
      if (!cardioAtTop && sectionOrder === 'cardio-first') {
        setSectionOrder('abs-first');
      }
    }
    setHasUnsavedChanges(true);
  };

  // Handler for removing sets from optional sections
  const handleRemoveOptionalSet = (rowId, setIndex) => {
    const updatedInputs = { ...editedInputs };
    if (updatedInputs[rowId]?.sets) {
      updatedInputs[rowId].sets = updatedInputs[rowId].sets.filter((_, idx) => idx !== setIndex);
      // Also update input array for backward compatibility
      if (updatedInputs[rowId].input) {
        updatedInputs[rowId].input = updatedInputs[rowId].input.filter((_, idx) => idx !== setIndex);
      }
      setEditedInputs(updatedInputs);
      setHasUnsavedChanges(true);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData();
        fetchPreviousCustomExercises();
      }
    });
    return () => unsubscribe();
  }, [workoutId]);

  // Scroll to top when entering edit mode
  useEffect(() => {
    if (isEditing) {
      // Instant scroll to top (smooth doesn't work reliably in this context)
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [isEditing]);

  // Handle sticky button on mobile - unstick when user scrolls near bottom
  useEffect(() => {
    // Wait for content to load before setting up scroll handler
    if (isLoading || !workoutData) return;

    let animationFrameId;
    let lastScrollY = -1;
    let lastDocHeight = -1;

    const checkScroll = () => {
      // Only on mobile (screen width < 640px - Tailwind's sm breakpoint)
      if (window.innerWidth >= 640) {
        setIsButtonSticky(false);
        animationFrameId = requestAnimationFrame(checkScroll);
        return;
      }

      // Try multiple ways to get scroll position
      const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

      // Try multiple ways to get document height (body.scrollHeight works better on some mobile browsers)
      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.offsetHeight
      );

      // Check if scroll position OR document height changed
      if (currentScrollY !== lastScrollY || documentHeight !== lastDocHeight) {
        lastScrollY = currentScrollY;
        lastDocHeight = documentHeight;

        const scrollPosition = currentScrollY + window.innerHeight;
        const distanceFromBottom = documentHeight - scrollPosition;

        // If page content hasn't loaded yet (too short), default to sticky
        if (documentHeight < 1000) {
          setIsButtonSticky(true);
        } else {
          // Use hysteresis to prevent flickering:
          // - Unstick when within 200px of bottom
          // - Re-stick when scrolling back up beyond 300px from bottom
          // This creates a 100px buffer zone to prevent rapid toggling
          setIsButtonSticky((prevSticky) => {
            if (prevSticky) {
              // Currently sticky - unstick only if very close to bottom
              return distanceFromBottom >= 200;
            } else {
              // Currently not sticky - stick only if far enough from bottom
              return distanceFromBottom >= 300;
            }
          });
        }
      }

      animationFrameId = requestAnimationFrame(checkScroll);
    };

    // Start the animation frame loop
    animationFrameId = requestAnimationFrame(checkScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isLoading, workoutData]);

  // Track changes to editedInputs, note, and date
  useEffect(() => {
    if (isEditing && workoutData) {
      const originalExerciseData = workoutData.exerciseData || workoutData.inputs || {};
      const originalNote = workoutData.note || '';

      // Check if date changed
      let originalDateString = '';
      if (workoutData.date) {
        const workoutDate = workoutData.date.toDate ? workoutData.date.toDate() : new Date(workoutData.date.seconds * 1000);
        const year = workoutDate.getFullYear();
        const month = String(workoutDate.getMonth() + 1).padStart(2, '0');
        const day = String(workoutDate.getDate()).padStart(2, '0');
        originalDateString = `${year}-${month}-${day}`;
      }

      const inputsChanged = JSON.stringify(editedInputs) !== JSON.stringify(originalExerciseData);
      const noteChanged = note !== originalNote;
      const dateChanged = editedDate !== originalDateString;
      const orderChanged = JSON.stringify(exerciseOrder) !== JSON.stringify(
        Object.keys(originalExerciseData)
      );
      const sectionOrderChanged = workoutData.sectionOrder !== sectionOrder;
      const cardioPositionChanged = workoutData.cardioAtTop !== cardioAtTop;
      const absPositionChanged = workoutData.absAtTop !== absAtTop;

      if (inputsChanged || noteChanged || dateChanged || orderChanged || sectionOrderChanged || cardioPositionChanged || absPositionChanged) {
        setHasUnsavedChanges(true);
      }
    }
  }, [editedInputs, note, editedDate, exerciseOrder, sectionOrder, cardioAtTop, absAtTop, isEditing, workoutData]);

  // Warn before leaving page with unsaved changes (browser close/refresh)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isEditing && hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditing, hasUnsavedChanges]);

  // Block navigation within the app (Link clicks, back button)
  useEffect(() => {
    const handleLinkClick = (e) => {
      // Check if user is editing with unsaved changes
      if (isEditing && hasUnsavedChanges) {
        // Check if the click target is a link or inside a link
        const link = e.target.closest('a');
        if (link && link.href) {
          const confirmed = window.confirm(
            'You have unsaved changes. Are you sure you want to leave? All changes will be lost.'
          );
          if (!confirmed) {
            e.preventDefault();
            e.stopPropagation();
          } else {
            // User confirmed, allow navigation and clear unsaved flag
            setHasUnsavedChanges(false);
          }
        }
      }
    };

    // Handle browser back/forward buttons
    const handlePopState = () => {
      if (isEditing && hasUnsavedChanges) {
        const confirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to leave? All changes will be lost.'
        );
        if (!confirmed) {
          // Push state back to stay on current page
          window.history.pushState(null, '', window.location.href);
        } else {
          setHasUnsavedChanges(false);
        }
      }
    };

    // Push initial state to enable popstate detection
    if (isEditing && hasUnsavedChanges) {
      window.history.pushState(null, '', window.location.href);
    }

    // Attach to document to catch all link clicks
    document.addEventListener('click', handleLinkClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isEditing, hasUnsavedChanges]);

  const handleSaveChanges = async () => {
    // Validate that all exercises have names
    const hasEmptyNames = Object.values(editedInputs).some(ex => {
      const name = (ex.exerciseName || ex.selection)?.trim();
      return !name || name === '';
    });

    if (hasEmptyNames) {
      alert('Please fill in all exercise names before saving.');
      return;
    }

    // Note: Duplicate names are allowed - what matters is that exercise keys are unique
    // (which is guaranteed by the data structure)
    try {
      setIsSaving(true);
      setIsGeneratingSummary(true);
      const prevExerciseData = previousWorkoutData?.exerciseData || previousWorkoutData?.inputs;
      const newSummary = await generateSummary(editedInputs, note, prevExerciseData, monthlyWorkoutData, exerciseOrder);
      setIsGeneratingSummary(false);
      const docRef = doc(db, 'workoutLogs', workoutId);

      // Convert edited date string to Date object
      const [year, month, day] = editedDate.split('-');
      const updatedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);

      // Update with new field name, but keep old for backward compatibility
      await updateDoc(docRef, {
        [FIREBASE_FIELDS.EXERCISE_DATA]: editedInputs,
        [FIREBASE_FIELDS.LEGACY_INPUTS]: editedInputs, // Keep for backward compatibility
        [FIREBASE_FIELDS.NOTE]: note,
        [FIREBASE_FIELDS.SUMMARY]: newSummary,
        [FIREBASE_FIELDS.DATE]: updatedDate,
        exerciseOrder: exerciseOrder, // Save the exercise order
        sectionOrder: sectionOrder, // Save cardio/abs section order
        cardioAtTop: cardioAtTop, // Save cardio position
        absAtTop: absAtTop, // Save abs position
      });

      // Refetch data from Firebase to ensure UI is in sync with database
      await fetchData();

      setIsEditing(false);
      setHasUnsavedChanges(false); // Reset unsaved changes flag
    } catch (error) {
      console.error('Error updating workout:', error);
      // Optionally show an inline error message here instead of alert
    } finally {
      setIsSaving(false);
      setIsGeneratingSummary(false);
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel? All changes will be lost.'
      );
      if (!confirmCancel) {
        return; // Don't cancel if user clicks "Cancel" on confirmation
      }
    }

    // Reset to original data
    const originalExerciseData = workoutData.exerciseData || workoutData.inputs || {};
    setEditedInputs(originalExerciseData);
    setNote(workoutData.note || '');

    // Reset order - use saved order if available, otherwise recreate from category order
    if (workoutData.exerciseOrder && workoutData.exerciseOrder.length > 0) {
      setExerciseOrder(workoutData.exerciseOrder);
    } else {
      const inputKeys = Object.keys(originalExerciseData);
      const muscleGroup = workoutData.muscleGroup || workoutData.target;
      const orderedKeysFromCategory = categoryOrder[muscleGroup] || [];
      const sorted = [
        ...orderedKeysFromCategory.filter((key) => inputKeys.includes(key)),
        ...inputKeys.filter((key) => !orderedKeysFromCategory.includes(key)),
      ];
      setExerciseOrder(sorted);
    }

    // Reset section order and positions
    setSectionOrder(workoutData.sectionOrder || 'abs-first');
    setCardioAtTop(workoutData.cardioAtTop || false);
    setAbsAtTop(workoutData.absAtTop || false);

    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  // Handle both old and new field names
  const exerciseData = workoutData?.exerciseData || workoutData?.inputs;
  if (!workoutData || !exerciseData) return <div>No workout data found.</div>;

  const muscleGroup = workoutData.muscleGroup || workoutData.target;

  // Use saved exercise order if available, otherwise fall back to category order
  // When editing, use editedInputs to include newly added exercises
  const dataForOrderFilter = isEditing ? editedInputs : exerciseData;

  // Filter out cardio/abs exercises (they're handled by OptionalWorkoutSections)
  const filterOutCardioAbs = (key) => {
    const lowerKey = key.toLowerCase();
    return !lowerKey.includes('cardio') && !lowerKey.includes('abs');
  };

  let displayOrder;
  if (exerciseOrder && exerciseOrder.length > 0) {
    // Filter to only include exercises that exist in current data AND exclude cardio/abs
    displayOrder = exerciseOrder.filter((key) => key in dataForOrderFilter && filterOutCardioAbs(key));
  } else {
    // Fallback to hardcoded order for old workouts
    const orderedKeys = categoryOrder[muscleGroup] || [];
    const inputKeys = Object.keys(dataForOrderFilter).filter(filterOutCardioAbs);
    const orderedInputs = orderedKeys.filter((key) => inputKeys.includes(key));
    const remainingInputs = inputKeys.filter((key) => !orderedKeys.includes(key));
    displayOrder = [...orderedInputs, ...remainingInputs];
  }

  return (
    <div className={`${theme.pageBg} min-h-screen font-serif pb-80`}>
      <Navbar />
      <div className="px-4 sm:px-20">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div className={`text-5xl ${theme.headerText}`}>{getLabel(muscleGroup)} Workout</div>
          <div className="flex flex-col items-end gap-2">
            {isEditing ? (
              <div className="flex flex-col">
                <label className={`text-sm font-medium ${theme.cardText} mb-1`}>Workout Date:</label>
                <input
                  type="date"
                  value={editedDate}
                  onChange={(e) => {
                    setEditedDate(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  max={(() => {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    const day = String(today.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                  })()}
                  className={`px-3 py-2 rounded-md border ${theme.inputBorder} ${theme.inputBg} focus:outline-none ${theme.inputFocus} text-lg`}
                />
              </div>
            ) : (
              workoutData.date && (
                <div className={`text-5xl ${theme.cardTextSecondary}`}>
                  {new Date(workoutData.date.seconds * 1000).toLocaleDateString()}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="sm:px-20 px-4">
        {/* Chart View Buttons */}
        <div className={`flex flex-wrap items-center justify-end gap-2 mb-6 sm:mb-8 px-4 sm:px-0 ${isSaving ? 'pointer-events-none opacity-50' : ''}`}>
          <span className={`text-lg font-medium ${theme.cardText}`}>Compare Data:</span>
          <button
            onClick={() => setGraphView('previous')}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg ${theme.btnPrimaryText} text-sm font-semibold transition-all duration-200 shadow-md active:scale-95
                        ${
                          graphView === 'previous'
                            ? theme.btnPrimary
                            : theme.btnSecondary
                        }`}
          >
            Previous
          </button>
          <button
            onClick={() => setGraphView('monthly')}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg ${theme.btnPrimaryText} text-sm font-semibold transition-all duration-200 shadow-md active:scale-95
                        ${
                          graphView === 'monthly'
                            ? theme.btnPrimary
                            : theme.btnSecondary
                        }`}
          >
            Month
          </button>
        </div>

        {/* Expand/Collapse All Button */}
        <div className="mb-4 px-4 sm:px-0 flex justify-end">
          <button
            onClick={() => setExpandAll(!expandAll)}
            className={`px-4 py-2 ${theme.btnPrimary} ${theme.btnPrimaryText} rounded-lg font-semibold transition-colors text-sm`}
          >
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        {/* Optional Cardio & Abs Sections at TOP - Always show checkboxes */}
        <div className="mb-6">
          <div className={isSaving ? 'pointer-events-none opacity-50' : ''}>
            <OptionalWorkoutSections
              numberOfSets={workoutData?.numberOfSets || 4}
              exerciseData={isEditing ? editedInputs : exerciseData}
              onExerciseDataChange={handleOptionalExerciseChange}
              onRemoveSet={handleRemoveOptionalSet}
              position="top"
              showCardio={showCardio}
              setShowCardio={setShowCardio}
              showAbs={showAbs}
              setShowAbs={setShowAbs}
              cardioAtTop={cardioAtTop}
              absAtTop={absAtTop}
              sectionOrder={sectionOrder}
              onToggleCardioPosition={handleToggleCardioPosition}
              onToggleAbsPosition={handleToggleAbsPosition}
              onCardioMoveUp={handleCardioMoveUp}
              onCardioMoveDown={handleCardioMoveDown}
              onAbsMoveUp={handleAbsMoveUp}
              onAbsMoveDown={handleAbsMoveDown}
              isEditingSets={isEditing}
              disableCheckboxes={!isEditing}
              isSavedWorkoutEditMode={isEditing}
              previousCustomExercises={previousCustomExercises}
              expandAll={expandAll}
              previousWorkoutData={previousWorkoutData}
              monthlyWorkoutData={monthlyWorkoutData}
              graphView={graphView}
            />
          </div>
        </div>

        {/* Workout Inputs */}
        <div className={isSaving ? 'pointer-events-none opacity-50' : ''}>
          <WorkoutInputs
            order={displayOrder}
            isEditing={isEditing}
            editedInputs={editedInputs}
            setEditedInputs={setEditedInputs}
            workoutData={workoutData}
            previousWorkoutData={previousWorkoutData}
            graphView={graphView}
            monthlyWorkoutData={monthlyWorkoutData}
            onRemove={handleRemoveExercise}
            onReorder={handleReorderExercises}
            previousCustomExercises={previousCustomExercises}
            expandAll={expandAll}
          />
        </div>

        {isEditing && (
          <div className="mb-6">
            <div className={isSaving ? 'pointer-events-none opacity-50' : ''}>
              <AddExerciseButton onClick={handleAddExercise} />
            </div>
          </div>
        )}

        {/* Optional Cardio & Abs Sections at BOTTOM - Always show checkboxes */}
        <div className="mb-6">
          <div className={isSaving ? 'pointer-events-none opacity-50' : ''}>
            <OptionalWorkoutSections
              numberOfSets={workoutData?.numberOfSets || 4}
              exerciseData={isEditing ? editedInputs : exerciseData}
              onExerciseDataChange={handleOptionalExerciseChange}
              onRemoveSet={handleRemoveOptionalSet}
              position="bottom"
              showCardio={showCardio}
              setShowCardio={setShowCardio}
              showAbs={showAbs}
              setShowAbs={setShowAbs}
              cardioAtTop={cardioAtTop}
              absAtTop={absAtTop}
              sectionOrder={sectionOrder}
              onToggleCardioPosition={handleToggleCardioPosition}
              onToggleAbsPosition={handleToggleAbsPosition}
              onCardioMoveUp={handleCardioMoveUp}
              onCardioMoveDown={handleCardioMoveDown}
              onAbsMoveUp={handleAbsMoveUp}
              onAbsMoveDown={handleAbsMoveDown}
              isEditingSets={isEditing}
              disableCheckboxes={!isEditing}
              isSavedWorkoutEditMode={isEditing}
              previousCustomExercises={previousCustomExercises}
              expandAll={expandAll}
              previousWorkoutData={previousWorkoutData}
              monthlyWorkoutData={monthlyWorkoutData}
              graphView={graphView}
            />
          </div>
        </div>

        {/* Workout Notes */}
        <div className={isSaving ? 'pointer-events-none opacity-50' : ''}>
          <WorkoutNotes value={note} onChange={setNote} isEditing={isEditing} />
        </div>

        {/* OpenAI Analysis */}
        <WorkoutAnalysis summary={summary} />
      </div>

      {/* View Workouts button - not sticky */}
      <div className="m-6 px-4 sm:px-20">
        <Link to="/SavedWorkouts">
          <button
            disabled={isSaving}
            className={`px-6 py-3 w-full sm:w-auto rounded-3xl shadow-lg ${theme.btnPrimaryText} transition-all duration-300 ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : `${theme.btnSecondary} active:scale-95`
            }`}
          >
            View Workouts
          </button>
        </Link>
      </div>

      {/* Action buttons - sticky on mobile when not at bottom (only when NOT editing) */}
      {!isEditing && (
        <div className={`flex flex-col justify-end space-y-4 ${
          isButtonSticky
            ? `fixed bottom-0 left-0 right-0 ${theme.pageBg} bg-opacity-95 pt-6 pb-4 px-4 m-0 z-50`
            : 'm-6 px-4 sm:px-20'
        } sm:m-6 sm:px-20 sm:relative sm:bg-none sm:pt-0 sm:pb-0`}>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setIsEditing(true);
                setHasUnsavedChanges(false);
              }}
              className={`px-6 py-3 rounded ${theme.btnPrimaryText} transition-all ${theme.btnPrimary} active:scale-95`}
            >
              Edit Workout
            </button>
            <SaveAsTemplateButton
              workoutData={workoutData}
              buttonText="Save as Template"
              buttonClassName={`px-6 py-3 rounded ${theme.btnPrimaryText} transition-all ${theme.btnSecondary} active:scale-95`}
            />
          </div>
        </div>
      )}

      {/* Cancel/Save buttons - sticky on mobile when not at bottom (only when editing) */}
      {isEditing && (
        <div className={`flex flex-col justify-end space-y-4 ${
          isButtonSticky
            ? `fixed bottom-0 left-0 right-0 ${theme.pageBg} bg-opacity-95 pt-6 pb-4 px-4 m-0 z-50`
            : 'm-6 px-4 sm:px-20'
        } sm:m-6 sm:px-20 sm:relative sm:bg-none sm:pt-0 sm:pb-0`}>
          <button
            onClick={handleCancelEdit}
            disabled={isSaving}
            className={`px-6 py-3 w-full rounded text-sky-50 sm:w-auto self-start transition-all ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 active:bg-red-400 active:scale-95'
            }`}
          >
            Cancel
          </button>

          <div className="flex flex-col gap-2">
            {isGeneratingSummary && (
              <div className={`${theme.headerText} font-semibold animate-pulse`}>
                🤖 Generating AI summary...
              </div>
            )}
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className={`px-6 py-3 w-full rounded-3xl shadow-lg text-sky-50 transition-all duration-300 ${
                isSaving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 active:bg-green-400'
              } w-auto sm:w-auto self-start active:scale-95`}
            >
              {isSaving ? (isGeneratingSummary ? 'Generating Summary...' : 'Saving...') : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedWorkout;

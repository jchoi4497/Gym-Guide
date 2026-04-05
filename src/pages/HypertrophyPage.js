import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc } from 'firebase/firestore';
import { auth } from '../config/firebase'; // Make sure auth is imported
import db from '../config/firebase';
import DropDown from '../components/DropDown';
import MuscleGroupWorkout from '../components/MuscleGroupWorkout';
import OptionalWorkoutSections from '../components/OptionalWorkoutSections';
import MuscleGroupAutocomplete from '../components/MuscleGroupAutocomplete';
import TemplateSelector from '../components/TemplateSelector';
import Navbar from '../components/Navbar';
import WorkoutNotesInput from '../components/WorkoutNotesInput';
import { generateSummary } from '../utils/summaryUtil';
import { MUSCLE_GROUP_OPTIONS, SET_RANGE_OPTIONS, STORAGE_KEYS, FIREBASE_FIELDS } from '../config/constants';
import { getMuscleGroupFromCategory } from '../utils/categoryDetection';
import { loadTemplate, templateToExerciseData, updateTemplateLastUsed } from '../utils/templateHelpers';

function HypertrophyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('template'); // Get template ID from URL

  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [numberOfSets, setNumberOfSets] = useState(null);
  const [exerciseData, setExerciseData] = useState({});
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [previousWorkoutData, setPreviousWorkoutData] = useState(null);
  const [previousCustomExercises, setPreviousCustomExercises] = useState([]);
  const [previousCustomMuscleGroups, setPreviousCustomMuscleGroups] = useState([]);
  const [loadedTemplate, setLoadedTemplate] = useState(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [selectedTemplateFromDropdown, setSelectedTemplateFromDropdown] = useState(null);
  const [justLoadedTemplate, setJustLoadedTemplate] = useState(false);

  // Workflow mode: 'choose' | 'template' | 'custom'
  const [workflowMode, setWorkflowMode] = useState('choose');

  // Custom input states
  const [customMuscleGroupName, setCustomMuscleGroupName] = useState('');
  const [customSetCount, setCustomSetCount] = useState('');
  const [customRepCount, setCustomRepCount] = useState('');

  // Section position states (true = top, false = bottom)
  const [cardioAtTop, setCardioAtTop] = useState(false);
  const [absAtTop, setAbsAtTop] = useState(false);

  // Order when both sections are in same position ('abs-first' | 'cardio-first')
  const [sectionOrder, setSectionOrder] = useState('abs-first');

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

  // Sticky button state for mobile
  const [isButtonSticky, setIsButtonSticky] = useState(true);

  // Edit sets mode state (shared across all workout sections)
  const [isEditingSets, setIsEditingSets] = useState(false);
  const [expandAll, setExpandAll] = useState(false); // Expand/collapse all state - default collapsed

  // Cardio/Abs expanded state (persists across position changes)
  const [absExpanded, setAbsExpanded] = useState(true);
  const [cardioExpanded, setCardioExpanded] = useState(true);

  // Exercise order state (tracks user's reordering of main workout exercises)
  const [mainExerciseOrder, setMainExerciseOrder] = useState([]);

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

  // LOAD TEMPLATE FROM URL ---
  useEffect(() => {
    const loadTemplateData = async () => {
      if (!templateId) return;

      const user = auth.currentUser;
      if (!user) return;

      setIsLoadingTemplate(true);

      const template = await loadTemplate(user.uid, templateId);

      if (template) {
        setLoadedTemplate(template);
        setSelectedTemplateFromDropdown(templateId); // Also set dropdown value

        // Apply template data to form
        setSelectedMuscleGroup(template.muscleGroup || null);
        setCustomMuscleGroupName(template.customMuscleGroupName || '');
        setNumberOfSets(template.numberOfSets || null);
        setCustomSetCount(template.customSetCount?.toString() || '');
        setCustomRepCount(template.customRepCount?.toString() || '');

        // Set optional sections
        setShowCardio(template.includeCardio || false);
        setCardioAtTop(template.cardioAtTop || false);
        setShowAbs(template.includeAbs || false);
        setAbsAtTop(template.absAtTop || false);
        setSectionOrder(template.sectionOrder || 'abs-first');

        // Pre-fill exercises once we have the set count
        const setsCount = template.customSetCount || template.numberOfSets || 4;
        console.log('📋 [Template Load URL] Converting template to exerciseData, sets:', setsCount);
        const prefilledExercises = templateToExerciseData(template, setsCount);
        console.log('📋 [Template Load URL] prefilledExercises result:', prefilledExercises);
        console.log('📋 [Template Load URL] Setting exerciseData to:', prefilledExercises);
        setExerciseData(prefilledExercises);

        // CRITICAL FIX: Also populate mainExerciseOrder with template exercise keys
        // Filter out cardio/abs keys (they're handled separately)
        const templateExerciseKeys = Object.keys(prefilledExercises).filter(key =>
          !key.startsWith('cardio') &&
          !key.startsWith('custom_cardio') &&
          !key.startsWith('abs') &&
          !key.startsWith('custom_abs')
        );
        console.log('📋 [Template Load URL] Setting mainExerciseOrder to:', templateExerciseKeys);
        setMainExerciseOrder(templateExerciseKeys);

        // Update template's last used timestamp
        await updateTemplateLastUsed(user.uid, templateId);

        // Clear any existing draft since we're starting fresh with a template
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);

        // Set flag to prevent auto-save from immediately triggering
        setJustLoadedTemplate(true);
        setTimeout(() => setJustLoadedTemplate(false), 1000); // Reset after 1 second

        // Set workflow mode to template
        setWorkflowMode('template');
      }

      setIsLoadingTemplate(false);
    };

    // Only load template if user is authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && templateId) {
        loadTemplateData();
      }
    });

    return () => unsubscribe();
  }, [templateId]);

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
    // Skip draft recovery if loading from a template (URL or dropdown)
    if (templateId || isLoadingTemplate || selectedTemplateFromDropdown) {
      // Clear draft when using a template
      if (templateId || selectedTemplateFromDropdown) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);
      }
      return;
    }

    // First check for active workout session (from StartWorkoutPage)
    const activeSession = localStorage.getItem('activeWorkoutSession');
    if (activeSession) {
      try {
        const session = JSON.parse(activeSession);

        // Restore from active session - rebuild exerciseData from exercises array
        const restoredExerciseData = {};
        session.exercises.forEach(ex => {
          // Only restore exercises with valid names
          if (ex.exerciseName && ex.exerciseName.trim()) {
            restoredExerciseData[ex.key] = {
              exerciseName: ex.exerciseName,
              sets: ex.completedSets.map(s => {
                if (s.weight) {
                  return `${s.weight}x${s.reps}`;
                }
                return s.reps || '';
              }),
            };
          } else {
            console.warn('[Session Recovery] Skipping exercise with no name:', ex.key, ex);
          }
        });
        setExerciseData(restoredExerciseData);

        // Restore other workout settings from session.workoutData
        if (session.workoutData) {
          if (session.workoutData.selectedMuscleGroup) {
            setSelectedMuscleGroup(session.workoutData.selectedMuscleGroup);
          }
          if (session.workoutData.numberOfSets) {
            setNumberOfSets(session.workoutData.numberOfSets);
          }
          if (session.workoutData.note) {
            setNote(session.workoutData.note);
          }
          if (session.workoutData.showCardio !== undefined) {
            setShowCardio(session.workoutData.showCardio);
          }
          if (session.workoutData.showAbs !== undefined) {
            setShowAbs(session.workoutData.showAbs);
          }
          if (session.workoutData.cardioAtTop !== undefined) {
            setCardioAtTop(session.workoutData.cardioAtTop);
          }
          if (session.workoutData.absAtTop !== undefined) {
            setAbsAtTop(session.workoutData.absAtTop);
          }
          if (session.workoutData.sectionOrder) {
            setSectionOrder(session.workoutData.sectionOrder);
          }
          if (session.workoutData.workflowMode) {
            setWorkflowMode(session.workoutData.workflowMode);
          }
          // CRITICAL FIX: Restore mainExerciseOrder for proper saving
          if (session.workoutData.mainExerciseOrder) {
            console.log('🔄 [Session Recovery] Restoring mainExerciseOrder:', session.workoutData.mainExerciseOrder);
            setMainExerciseOrder(session.workoutData.mainExerciseOrder);
          }
        }

        return; // Don't check draft if we have active session
      } catch (err) {
        console.error('Failed to restore active session:', err);
      }
    }

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

            // Convert old format to new format if needed, but preserve all fields
            const convertedData = {};
            Object.keys(dataToRestore).forEach(key => {
              const exercise = dataToRestore[key];
              const exerciseName = exercise.exerciseName || exercise.selection || '';

              // Only restore exercises that have valid names
              if (exerciseName && exerciseName.trim()) {
                convertedData[key] = {
                  ...exercise, // Keep all existing fields (selection, linkedExerciseId, detectedCategory, etc.)
                  sets: exercise.sets || exercise.input || [],
                  exerciseName: exerciseName,
                };
              } else {
                console.warn('[Draft Recovery] Skipping exercise with no name:', key, exercise);
              }
            });

            setExerciseData(convertedData);
          }

          if (parsed.note) setNote(parsed.note);

          // Restore custom fields if present
          if (parsed.customMuscleGroupName) setCustomMuscleGroupName(parsed.customMuscleGroupName);
          if (parsed.customSetCount) setCustomSetCount(parsed.customSetCount);
          if (parsed.customRepCount) setCustomRepCount(parsed.customRepCount);

          // Restore template selection if present
          if (parsed.templateId) {
            setSelectedTemplateFromDropdown(parsed.templateId);
            // Optionally reload the full template data
            const user = auth.currentUser;
            if (user) {
              loadTemplate(user.uid, parsed.templateId).then(template => {
                if (template) setLoadedTemplate(template);
              });
            }
          }

          // Restore cardio/abs sections if present
          if (parsed.showCardio !== undefined) setShowCardio(parsed.showCardio);
          if (parsed.showAbs !== undefined) setShowAbs(parsed.showAbs);
          if (parsed.cardioAtTop !== undefined) setCardioAtTop(parsed.cardioAtTop);
          if (parsed.absAtTop !== undefined) setAbsAtTop(parsed.absAtTop);
          if (parsed.sectionOrder) setSectionOrder(parsed.sectionOrder);

          // Restore workflow mode if present
          if (parsed.workflowMode) setWorkflowMode(parsed.workflowMode);

          // CRITICAL FIX: Restore mainExerciseOrder for proper saving
          if (parsed.mainExerciseOrder) {
            console.log('🔄 [Draft Recovery] Restoring mainExerciseOrder:', parsed.mainExerciseOrder);
            setMainExerciseOrder(parsed.mainExerciseOrder);
          }
        } else {
          // If they say No, clear the old draft so they start fresh
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);
        }
      }
    }
  }, [templateId, isLoadingTemplate, selectedTemplateFromDropdown]);

  // DEBUG: Monitor exerciseData changes
  useEffect(() => {
    console.log('🔄 [exerciseData Changed]', {
      keys: Object.keys(exerciseData),
      count: Object.keys(exerciseData).length,
      data: exerciseData
    });
  }, [exerciseData]);

  // AUTO-SAVE TO LOCAL STORAGE ---
  useEffect(() => {
    // Skip auto-save if we just loaded a template (give user a chance to start working)
    if (justLoadedTemplate) {
      return;
    }

    // Only save if the user has at least started a workout (selected a muscle group)
    if (selectedMuscleGroup) {
      const draft = {
        selectedMuscleGroup,
        numberOfSets,
        exerciseData,
        note,
        customMuscleGroupName,
        customSetCount,
        customRepCount,
        templateId: selectedTemplateFromDropdown, // Save template ID for recovery
        showCardio,
        showAbs,
        cardioAtTop,
        absAtTop,
        sectionOrder,
        workflowMode, // Save workflow mode to restore correct screen
        mainExerciseOrder, // CRITICAL FIX: Save exercise order for proper saving
      };
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT, JSON.stringify(draft));
    }
  }, [selectedMuscleGroup, numberOfSets, exerciseData, note, customMuscleGroupName, customSetCount, customRepCount, selectedTemplateFromDropdown, showCardio, showAbs, cardioAtTop, absAtTop, sectionOrder, workflowMode, mainExerciseOrder, justLoadedTemplate]);

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

      setPreviousCustomExercises(exerciseArray);
      setPreviousCustomMuscleGroups(muscleGroupArray);

      // Try to fetch from "My Exercises" page (might fail if rules not set up)
      try {
        const customExDoc = await getDoc(doc(db, 'userCustomExercises', user.uid));
        if (customExDoc.exists()) {
          const myExercises = customExDoc.data().exercises || [];

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
        // My Exercises page data not available
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

  // Handle sticky button on mobile - unstick when user scrolls near bottom
  useEffect(() => {
    if (!isWorkoutConfigured) return; // Only run when workout is configured

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
          // - Unstick when within 150px of bottom
          // - Re-stick when scrolling back up beyond 400px from bottom
          setIsButtonSticky((prevSticky) => {
            if (prevSticky) {
              // Currently sticky - unstick only if very close to bottom
              return distanceFromBottom >= 150;
            } else {
              // Currently not sticky - stick only if far enough from bottom
              return distanceFromBottom >= 400;
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
  }, [isWorkoutConfigured]);

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

  // Batch initialize multiple exercises at once (optimal for initial load)
  const batchInitializeExercises = (exercisesToInit) => {
    // Safety check - don't initialize if actualNumberOfSets is invalid
    if (!actualNumberOfSets || actualNumberOfSets < 1) {
      console.warn('[batchInitializeExercises] Skipping - invalid actualNumberOfSets:', actualNumberOfSets);
      return;
    }

    setExerciseData(prevExerciseData => {
      const updatedExerciseData = { ...prevExerciseData };

      exercisesToInit.forEach(({ categoryKey, exerciseName }) => {
        if (!updatedExerciseData[categoryKey] || !updatedExerciseData[categoryKey].exerciseName) {
          const setsArray = new Array(actualNumberOfSets).fill('');
          updatedExerciseData[categoryKey] = {
            sets: setsArray,
            exerciseName: exerciseName,
          };
        }
      });

      return updatedExerciseData;
    });

    // Also add to mainExerciseOrder
    const newKeys = exercisesToInit.map(ex => ex.categoryKey);
    setMainExerciseOrder(prev => {
      // Only add keys that aren't already in the order
      const keysToAdd = newKeys.filter(key => !prev.includes(key));
      return [...prev, ...keysToAdd];
    });
  };

  // Workout Selection: Weight x Reps input
  const handleExerciseDataChange = (categoryKey, exerciseName, setIndex, setInput, detectedCategory) => {
    if (categoryKey.startsWith('abs')) {
      console.log('🔧 [handleExerciseDataChange ABS]', {
        categoryKey,
        exerciseName,
        setIndex,
        setInput,
        detectedCategory
      });
    }

    // Use functional setState to ensure we always get the latest state
    setExerciseData(prevExerciseData => {
      if (categoryKey.startsWith('abs')) {
        console.log('🔧 [handleExerciseDataChange ABS] prevExerciseData[categoryKey]:', prevExerciseData[categoryKey]);
        console.log('🔧 [handleExerciseDataChange ABS] prevExerciseData[categoryKey].sets:', prevExerciseData[categoryKey]?.sets);
      }

      const updatedExerciseData = { ...prevExerciseData };

      // Check if this is cardio or abs
      const isCardio = categoryKey.startsWith('cardio') || categoryKey.startsWith('custom_cardio');
      const isAbs = categoryKey.startsWith('abs') || categoryKey.startsWith('custom_abs');
      const isCardioOrAbs = isCardio || isAbs;

    if (!updatedExerciseData[categoryKey]) {
      // Cardio: dynamic fields (empty array)
      // Abs: fixed number of sets (like regular exercises)
      // Regular exercises: use actualNumberOfSets
      const safeSetsCount = actualNumberOfSets && actualNumberOfSets > 0 ? actualNumberOfSets : 4;
      const setsArray = isCardio ? [] : new Array(safeSetsCount).fill('');
      updatedExerciseData[categoryKey] = {
        sets: setsArray,
        exerciseName: exerciseName,
      };

      // Add to mainExerciseOrder if it's a new main exercise (not cardio/abs)
      if (!isCardioOrAbs) {
        setMainExerciseOrder(prev => [...prev, categoryKey]);
      }
    }

    if (setIndex === -1) {
      // -1 means changing the exercise selection
      updatedExerciseData[categoryKey].exerciseName = exerciseName;
      // Store detected category or selection ID
      if (detectedCategory) {
        if (isCardioOrAbs) {
          // For cardio/abs, store the exercise ID as "selection" for field lookup
          updatedExerciseData[categoryKey].selection = detectedCategory;
        } else {
          // For regular exercises, store as detectedCategory
          updatedExerciseData[categoryKey].detectedCategory = detectedCategory;
        }
      }
      // Ensure sets array exists and has correct length
      if (!updatedExerciseData[categoryKey].sets || updatedExerciseData[categoryKey].sets.length === 0) {
        // Cardio: dynamic fields (empty array)
        // Abs: fixed sets (use actualNumberOfSets)
        // Regular exercises: use actualNumberOfSets (default to 4)
        const safeSetsCount = actualNumberOfSets && actualNumberOfSets > 0 ? actualNumberOfSets : 4;
        updatedExerciseData[categoryKey].sets = isCardio ? [] : new Array(safeSetsCount).fill('');
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

      if (categoryKey.startsWith('abs')) {
        console.log('🔧 [handleExerciseDataChange ABS] AFTER update:', {
          categoryKey,
          exerciseName: updatedExerciseData[categoryKey].exerciseName,
          sets: updatedExerciseData[categoryKey].sets,
          setsLength: updatedExerciseData[categoryKey].sets?.length
        });
      }

      return updatedExerciseData;
    });
  };

  // Remove an entire exercise
  const handleRemoveExercise = (categoryKey) => {
    const updatedExerciseData = { ...exerciseData };
    delete updatedExerciseData[categoryKey];
    setExerciseData(updatedExerciseData);

    // Also remove from mainExerciseOrder
    const isCardioOrAbs = categoryKey.startsWith('cardio') || categoryKey.startsWith('custom_cardio') ||
                          categoryKey.startsWith('abs') || categoryKey.startsWith('custom_abs');
    if (!isCardioOrAbs) {
      setMainExerciseOrder(prev => prev.filter(key => key !== categoryKey));
    }
  };

  // Handle reordering of main workout exercises
  const handleReorderExercises = (newOrder) => {
    setMainExerciseOrder(newOrder);
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

  // Handle moving cardio section up
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
      // Cardio is at top
      if (absAtTop) {
        // Both at top - check order
        if (sectionOrder === 'abs-first') {
          // Abs is first, Cardio is second - swap them
          setSectionOrder('cardio-first');
        }
        // else Cardio is already first, can't go higher
      }
      // else Cardio is alone at top, can't go higher
    }
  };

  // Handle moving cardio section down
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
      // Cardio is at bottom
      if (!absAtTop) {
        // Both at bottom - check order
        if (sectionOrder === 'cardio-first') {
          // Cardio is first, Abs is second - swap them
          setSectionOrder('abs-first');
        }
        // else Cardio is already second, can't go lower
      }
      // else Cardio is alone at bottom, can't go lower
    }
  };

  // Handle moving abs section up
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
      // Abs is at top
      if (cardioAtTop) {
        // Both at top - check order
        if (sectionOrder === 'cardio-first') {
          // Cardio is first, Abs is second - swap them
          setSectionOrder('abs-first');
        }
        // else Abs is already first, can't go higher
      }
      // else Abs is alone at top, can't go higher
    }
  };

  // Handle moving abs section down
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
      // Abs is at bottom
      if (!cardioAtTop) {
        // Both at bottom - check order
        if (sectionOrder === 'abs-first') {
          // Abs is first, Cardio is second - swap them
          setSectionOrder('cardio-first');
        }
        // else Abs is already second, can't go lower
      }
      // else Abs is alone at bottom, can't go lower
    }
  };

  const handleMuscleGroupSelect = (option) => {
    // Check if user has entered any workout data before clearing
    const hasWorkoutData = Object.keys(exerciseData).some(key => {
      const exercise = exerciseData[key];
      return exercise.sets && exercise.sets.some(set => set && set.trim() !== '');
    });

    if (hasWorkoutData) {
      const confirmed = window.confirm(
        'Changing the muscle group will clear all your current workout data. Are you sure you want to continue?'
      );
      if (!confirmed) {
        return; // Don't change if user cancels
      }
    }

    setSelectedMuscleGroup(option);
    // Clear custom name if switching away from custom
    if (option !== 'custom') {
      setCustomMuscleGroupName('');
    }
    // Clear exercise data when changing muscle group
    setExerciseData({});
  };

  const handleSetCountSelect = (option) => {
    // Check if user has entered any workout data before clearing
    const hasWorkoutData = Object.keys(exerciseData).some(key => {
      const exercise = exerciseData[key];
      return exercise.sets && exercise.sets.some(set => set && set.trim() !== '');
    });

    if (hasWorkoutData) {
      const confirmed = window.confirm(
        'Changing the set count will clear all your current workout data. Are you sure you want to continue?'
      );
      if (!confirmed) {
        return; // Don't change if user cancels
      }
    }

    setNumberOfSets(option);
    // Clear custom values if switching away from custom
    if (option !== 'custom') {
      setCustomSetCount('');
      setCustomRepCount('');
    }
    // Clear exercise data when changing set count to rebuild with new count
    setExerciseData({});
  };

  // Handle template selection from dropdown
  const handleTemplateSelect = async (templateId) => {
    if (!templateId) {
      // User selected "Start from Scratch" - switch to custom mode
      setWorkflowMode('custom');
      setSelectedTemplateFromDropdown(null);
      setLoadedTemplate(null);
      setSelectedMuscleGroup(null);
      setNumberOfSets(null);
      setCustomMuscleGroupName('');
      setCustomSetCount('');
      setCustomRepCount('');
      setExerciseData({});
      setShowCardio(false);
      setShowAbs(false);
      setJustLoadedTemplate(false);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setIsLoadingTemplate(true);
    setSelectedTemplateFromDropdown(templateId);

    const template = await loadTemplate(user.uid, templateId);

    if (template) {
      setLoadedTemplate(template);

      // Apply template data to form
      setSelectedMuscleGroup(template.muscleGroup || null);
      setCustomMuscleGroupName(template.customMuscleGroupName || '');
      setNumberOfSets(template.numberOfSets || null);
      setCustomSetCount(template.customSetCount?.toString() || '');
      setCustomRepCount(template.customRepCount?.toString() || '');

      // Set optional sections
      setShowCardio(template.includeCardio || false);
      setCardioAtTop(template.cardioAtTop || false);
      setShowAbs(template.includeAbs || false);
      setAbsAtTop(template.absAtTop || false);
      setSectionOrder(template.sectionOrder || 'abs-first');

      // Pre-fill exercises once we have the set count
      const setsCount = template.customSetCount || template.numberOfSets || 4;
      console.log('📋 [Template Load] Converting template to exerciseData, sets:', setsCount);
      const prefilledExercises = templateToExerciseData(template, setsCount);
      console.log('📋 [Template Load] prefilledExercises result:', prefilledExercises);
      console.log('📋 [Template Load] Setting exerciseData to:', prefilledExercises);
      setExerciseData(prefilledExercises);

      // CRITICAL FIX: Also populate mainExerciseOrder with template exercise keys
      // Filter out cardio/abs keys (they're handled separately)
      const templateExerciseKeys = Object.keys(prefilledExercises).filter(key =>
        !key.startsWith('cardio') &&
        !key.startsWith('custom_cardio') &&
        !key.startsWith('abs') &&
        !key.startsWith('custom_abs')
      );
      console.log('📋 [Template Load] Setting mainExerciseOrder to:', templateExerciseKeys);
      setMainExerciseOrder(templateExerciseKeys);

      // Update template's last used timestamp
      await updateTemplateLastUsed(user.uid, templateId);

      // Clear any existing draft since we're starting fresh with a template
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);

      // Set flag to prevent auto-save from immediately triggering
      setJustLoadedTemplate(true);
      setTimeout(() => setJustLoadedTemplate(false), 1000); // Reset after 1 second

      // Keep in template mode
      setWorkflowMode('template');
    }

    setIsLoadingTemplate(false);
  };

  // Auto-save custom exercises to "My Exercises" when saving workout
  const autoSaveCustomExercises = async (userId, exerciseDataToSave) => {
    try {
      // Get current custom exercises
      const customExDoc = await getDoc(doc(db, 'userCustomExercises', userId));
      const existingExercises = customExDoc.exists() ? customExDoc.data().exercises || [] : [];

      // Find new custom exercises to add
      const newExercises = [];
      Object.entries(exerciseDataToSave).forEach(([key, exercise]) => {
        const exerciseName = exercise.exerciseName || exercise.selection;
        const detectedCategory = exercise.detectedCategory;

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
      if (newExercises.length > 0) {
        const allExercises = [...existingExercises, ...newExercises];
        await setDoc(doc(db, 'userCustomExercises', userId), { exercises: allExercises });
      }
    } catch (error) {
      // Don't block the workout save if this fails
    }
  };

  // Save Workout
  const handleSaveWorkout = async () => {
    console.log('💾 [handleSaveWorkout] Starting save process');
    console.log('💾 [handleSaveWorkout] exerciseData at start:', exerciseData);
    console.log('💾 [handleSaveWorkout] exerciseData keys:', Object.keys(exerciseData));
    console.log('💾 [handleSaveWorkout] exerciseData count:', Object.keys(exerciseData).length);

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
      const prevWorkout = await fetchPreviousWorkout(selectedDate, actualMuscleGroup);
      // Get previous workout data in the right format for summary generation
      const prevExerciseData = prevWorkout?.exerciseData || prevWorkout?.inputs;

      // Create exercise order array based on actual display order
      const allKeys = Object.keys(exerciseData);
      console.log('💾 [handleSaveWorkout] allKeys:', allKeys);
      const cardioKeys = allKeys.filter(k => k.startsWith('cardio') || k.startsWith('custom_cardio'));
      const absKeys = allKeys.filter(k => k.startsWith('abs') || k.startsWith('custom_abs'));
      console.log('💾 [handleSaveWorkout] cardioKeys:', cardioKeys);
      console.log('💾 [handleSaveWorkout] absKeys:', absKeys);

      // Use the tracked mainExerciseOrder instead of just filtering keys
      // This preserves the user's drag-and-drop reordering
      console.log('💾 [handleSaveWorkout] mainExerciseOrder:', mainExerciseOrder);

      // CRITICAL SAFETY NET: If mainExerciseOrder is empty, reconstruct from exerciseData
      // This handles edge cases where mainExerciseOrder got lost (old drafts, bugs, etc.)
      let mainKeys = mainExerciseOrder.filter(k => k in exerciseData);
      if (mainKeys.length === 0 && allKeys.length > 0) {
        console.warn('⚠️ [handleSaveWorkout] mainExerciseOrder was empty! Reconstructing from exerciseData keys');
        // Get all non-cardio, non-abs keys as the main exercises
        const reconstructedKeys = allKeys.filter(k =>
          !k.startsWith('cardio') &&
          !k.startsWith('custom_cardio') &&
          !k.startsWith('abs') &&
          !k.startsWith('custom_abs')
        );
        mainKeys = reconstructedKeys;
        console.log('💾 [handleSaveWorkout] Reconstructed mainKeys:', mainKeys);
      }
      console.log('💾 [handleSaveWorkout] mainKeys after filter:', mainKeys);

      // Build sections at top respecting order
      const topSections = [];
      if (cardioAtTop && absAtTop) {
        if (sectionOrder === 'abs-first') {
          if (showAbs) topSections.push(...absKeys);
          if (showCardio) topSections.push(...cardioKeys);
        } else {
          if (showCardio) topSections.push(...cardioKeys);
          if (showAbs) topSections.push(...absKeys);
        }
      } else {
        if (cardioAtTop && showCardio) topSections.push(...cardioKeys);
        if (absAtTop && showAbs) topSections.push(...absKeys);
      }

      // Build sections at bottom respecting order
      const bottomSections = [];
      if (!cardioAtTop && !absAtTop) {
        if (sectionOrder === 'abs-first') {
          if (showAbs) bottomSections.push(...absKeys);
          if (showCardio) bottomSections.push(...cardioKeys);
        } else {
          if (showCardio) bottomSections.push(...cardioKeys);
          if (showAbs) bottomSections.push(...absKeys);
        }
      } else {
        if (!cardioAtTop && showCardio) bottomSections.push(...cardioKeys);
        if (!absAtTop && showAbs) bottomSections.push(...absKeys);
      }

      const exerciseOrder = [
        ...topSections,
        ...mainKeys,
        ...bottomSections,
      ];

      console.log('💾 [handleSaveWorkout] Final exerciseOrder:', exerciseOrder);

      // Validate exerciseData - filter out exercises without names (corrupted/incomplete data)
      console.log('🔍 [handleSaveWorkout] Starting validation');
      const validatedExerciseData = {};
      let removedExercises = [];

      Object.entries(exerciseData).forEach(([key, exercise]) => {
        console.log(`🔍 [handleSaveWorkout] Validating "${key}":`, exercise);
        const exerciseName = exercise.exerciseName || exercise.selection;
        console.log(`🔍 [handleSaveWorkout] "${key}" exerciseName:`, exerciseName);

        if (exerciseName && exerciseName.trim()) {
          validatedExerciseData[key] = exercise;
          console.log(`✅ [handleSaveWorkout] "${key}" PASSED validation`);
        } else {
          removedExercises.push(key);
          console.warn(`❌ [handleSaveWorkout] "${key}" FAILED validation - no name:`, exercise);
        }
      });

      console.log('💾 [handleSaveWorkout] Validation complete');
      console.log('💾 [handleSaveWorkout] validatedExerciseData:', validatedExerciseData);
      console.log('💾 [handleSaveWorkout] removedExercises:', removedExercises);

      // Alert user if we're removing exercises
      if (removedExercises.length > 0) {
        alert(`Warning: ${removedExercises.length} exercise(s) had no name and were not saved. Please make sure all exercises have names before saving.`);
        setIsSaving(false);
        return;
      }

      // Generate New Summary (no monthly data on initial save, only has previous workout)
      setIsGeneratingSummary(true);
      const newSummary = await generateSummary(validatedExerciseData, note, prevExerciseData, [], exerciseOrder);
      setIsGeneratingSummary(false);

      // Save WorkoutLog with new field names (use actual values for custom)
      const workoutData = {
        [FIREBASE_FIELDS.USER_ID]: user.uid,
        [FIREBASE_FIELDS.MUSCLE_GROUP]: actualMuscleGroup,
        [FIREBASE_FIELDS.NUMBER_OF_SETS]: actualNumberOfSets,
        [FIREBASE_FIELDS.DATE]: selectedDate,
        [FIREBASE_FIELDS.EXERCISE_DATA]: validatedExerciseData,
        [FIREBASE_FIELDS.NOTE]: note,
        [FIREBASE_FIELDS.SUMMARY]: newSummary,
        exerciseOrder: exerciseOrder, // Store the order exercises were performed
        sectionOrder: sectionOrder, // Store cardio/abs section order
        cardioAtTop: cardioAtTop, // Store cardio position
        absAtTop: absAtTop, // Store abs position
        createdAt: new Date(), // Exact timestamp for ordering
      };

      // Add template ID if workout was started from a template (URL or dropdown)
      const activeTemplateId = templateId || selectedTemplateFromDropdown;
      if (activeTemplateId) {
        workoutData.templateId = activeTemplateId;
        workoutData.templateName = loadedTemplate?.name || 'Unknown Template';
      }

      const docRef = await addDoc(collection(db, 'workoutLogs'), workoutData);

      // CLEAR LOCAL STORAGE ON SUCCESS ---
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);

      // Get the document ID
      const workoutId = docRef.id;

      // Redirect to another page with the document ID in the URL
      window.location.href = `/SavedWorkout/${workoutId}`;
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Error saving workout. Please try again.');
    } finally {
      setIsSaving(false); // End loading
      setIsGeneratingSummary(false);
    }
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
      sectionOrder,
      workflowMode,
      mainExerciseOrder, // CRITICAL: Pass exercise order for proper saving
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
        {/* Only show generic title on choice screen */}
        {workflowMode === 'choose' && (
          <>
            <h1 className="text-5xl font-extrabold mb-4 text-gray-800">Create Workout</h1>
            <p className="text-lg text-gray-700 italic mb-10">
              Choose your training style and start logging your workout.
            </p>
          </>
        )}

        {/* Show specific title when following program */}
        {workflowMode === 'custom' && selectedMuscleGroup && (
          <>
            <h1 className="text-4xl font-extrabold mb-2 text-gray-800">
              {actualMuscleGroup ? `${actualMuscleGroup.charAt(0).toUpperCase() + actualMuscleGroup.slice(1)} Day` : 'Workout'}
            </h1>
            <p className="text-sm text-gray-600 italic mb-8">
              Following Jonathan's Hypertrophy Program
            </p>
          </>
        )}

        {/* Show template name when using template */}
        {workflowMode === 'template' && loadedTemplate && (
          <>
            <h1 className="text-4xl font-extrabold mb-2 text-gray-800">
              {loadedTemplate.name}
            </h1>
            {loadedTemplate.category && (
              <p className="text-sm text-gray-600 italic mb-8">
                {loadedTemplate.category} Training
              </p>
            )}
          </>
        )}

        {/* Loading Template Indicator */}
        {isLoadingTemplate && (
          <div className="bg-gray-100 p-3 mb-6 rounded-lg text-center">
            <p className="text-gray-700 text-sm">Loading template...</p>
          </div>
        )}

        {/* Only show "Restart" if there is actually data to clear OR if they've made a choice */}
        {(selectedMuscleGroup || Object.keys(exerciseData).length > 0 || workflowMode !== 'choose') && (
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
              sectionOrder={sectionOrder}
              onCardioMoveUp={handleCardioMoveUp}
              onCardioMoveDown={handleCardioMoveDown}
              onAbsMoveUp={handleAbsMoveUp}
              onAbsMoveDown={handleAbsMoveDown}
              showCardio={showCardio}
              setShowCardio={setShowCardio}
              showAbs={showAbs}
              setShowAbs={setShowAbs}
              position="top"
              isEditingSets={isEditingSets}
              previousCustomExercises={previousCustomExercises}
              expandAll={expandAll}
              absExpanded={absExpanded}
              setAbsExpanded={setAbsExpanded}
              cardioExpanded={cardioExpanded}
              setCardioExpanded={setCardioExpanded}
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
              onRemoveExercise={handleRemoveExercise}
              previousExerciseData={previousWorkoutData?.exerciseData || previousWorkoutData?.inputs}
              previousCustomExercises={previousCustomExercises}
              favoriteExercises={favoriteExercises}
              onToggleFavorite={toggleFavorite}
              isEditingSets={isEditingSets}
              onEditingSetsChange={setIsEditingSets}
              expandAll={expandAll}
              onExpandAllChange={setExpandAll}
              onReorderExercises={handleReorderExercises}
              exerciseOrder={mainExerciseOrder}
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
              sectionOrder={sectionOrder}
              onCardioMoveUp={handleCardioMoveUp}
              onCardioMoveDown={handleCardioMoveDown}
              onAbsMoveUp={handleAbsMoveUp}
              onAbsMoveDown={handleAbsMoveDown}
              showCardio={showCardio}
              setShowCardio={setShowCardio}
              showAbs={showAbs}
              setShowAbs={setShowAbs}
              position="bottom"
              isEditingSets={isEditingSets}
              previousCustomExercises={previousCustomExercises}
              expandAll={expandAll}
              absExpanded={absExpanded}
              setAbsExpanded={setAbsExpanded}
              cardioExpanded={cardioExpanded}
              setCardioExpanded={setCardioExpanded}
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

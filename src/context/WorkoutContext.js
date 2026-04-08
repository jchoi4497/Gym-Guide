/**
 * Workout Context - Centralized State Management
 * Replaces 24+ useState calls scattered across components
 *
 * Benefits:
 * - Single source of truth for workout state
 * - Easier to debug and test
 * - Consistent data flow
 * - Automatic persistence to localStorage
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createWorkout, isValidWorkout } from '../types/workout';
import { workoutDraft, workoutSession, clearAllWorkoutData } from '../services/storageService';

const WorkoutContext = createContext(null);

/**
 * Workout Provider Component
 */
export const WorkoutProvider = ({ children }) => {
  // ===== CORE WORKOUT STATE =====
  const [workout, setWorkout] = useState(() => createWorkout());

  // ===== WORKOUT DATE =====
  const [workoutDate, setWorkoutDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format: YYYY-MM-DD in local timezone
  });

  // ===== UI STATE =====
  const [workflowMode, setWorkflowMode] = useState('choose'); // 'choose' | 'template' | 'custom'
  const [customMuscleGroupName, setCustomMuscleGroupName] = useState('');
  const [customSetCount, setCustomSetCount] = useState('');
  const [customRepCount, setCustomRepCount] = useState('');

  // ===== TEMPLATE STATE =====
  const [loadedTemplate, setLoadedTemplate] = useState(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [selectedTemplateFromDropdown, setSelectedTemplateFromDropdown] = useState(null);

  // ===== SAVING STATE =====
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // ===== HISTORY STATE =====
  const [previousWorkoutData, setPreviousWorkoutData] = useState(null);
  const [previousCustomExercises, setPreviousCustomExercises] = useState([]);
  const [previousCustomMuscleGroups, setPreviousCustomMuscleGroups] = useState([]);

  // ===== FAVORITES STATE =====
  const [favoriteExercises, setFavoriteExercises] = useState([]);

  // ===== COMPUTED VALUES =====
  const actualMuscleGroup = useMemo(() => {
    if (workout.selectedMuscleGroup === 'custom' && customMuscleGroupName) {
      return customMuscleGroupName;
    }
    return workout.selectedMuscleGroup;
  }, [workout.selectedMuscleGroup, customMuscleGroupName]);

  const actualNumberOfSets = useMemo(() => {
    if (workout.numberOfSets === 'custom' && customSetCount) {
      return parseInt(customSetCount);
    }
    return workout.numberOfSets;
  }, [workout.numberOfSets, customSetCount]);

  const isWorkoutConfigured = useMemo(() => {
    const hasMuscleGroup = workout.selectedMuscleGroup &&
      (workout.selectedMuscleGroup !== 'custom' || customMuscleGroupName.trim());
    const hasSets = workout.numberOfSets &&
      (workout.numberOfSets !== 'custom' || (customSetCount && parseInt(customSetCount) > 0));
    return hasMuscleGroup && hasSets;
  }, [workout.selectedMuscleGroup, customMuscleGroupName, workout.numberOfSets, customSetCount]);

  // ===== WORKOUT ACTIONS =====

  /**
   * Update workout fields
   */
  const updateWorkout = useCallback((updates) => {
    setWorkout(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Update a single exercise in exerciseData
   */
  const updateExercise = useCallback((exerciseKey, exerciseData) => {
    setWorkout(prev => ({
      ...prev,
      exerciseData: {
        ...prev.exerciseData,
        [exerciseKey]: exerciseData,
      },
    }));
  }, []);

  /**
   * Remove an exercise from exerciseData
   */
  const removeExercise = useCallback((exerciseKey) => {
    setWorkout(prev => {
      const { [exerciseKey]: removed, ...remaining } = prev.exerciseData;
      return {
        ...prev,
        exerciseData: remaining,
      };
    });
  }, []);

  /**
   * Reset workout to initial state
   */
  const resetWorkout = useCallback(() => {
    setWorkout(createWorkout());
    setWorkflowMode('choose');
    setCustomMuscleGroupName('');
    setCustomSetCount('');
    setCustomRepCount('');
    setLoadedTemplate(null);
    setSelectedTemplateFromDropdown(null);
    clearAllWorkoutData();
  }, []);

  /**
   * Load workout from object (used for templates, previous workouts, etc.)
   */
  const loadWorkout = useCallback((workoutData) => {
    if (isValidWorkout(workoutData)) {
      setWorkout(workoutData);
    }
  }, []);

  // ===== PERSISTENCE =====

  /**
   * Auto-save draft to localStorage whenever workout changes
   */
  useEffect(() => {
    // Don't save if workout is empty or just initialized
    if (!workout.selectedMuscleGroup && !workout.numberOfSets) {
      return;
    }

    // Don't save while actively loading from template
    if (isLoadingTemplate) {
      return;
    }

    // Save draft
    const draft = {
      ...workout,
      customMuscleGroupName,
      customSetCount,
      customRepCount,
      workflowMode,
      templateId: selectedTemplateFromDropdown,
    };

    workoutDraft.save(draft);
  }, [
    workout,
    customMuscleGroupName,
    customSetCount,
    customRepCount,
    workflowMode,
    selectedTemplateFromDropdown,
    isLoadingTemplate,
  ]);

  /**
   * Restore draft on mount
   */
  useEffect(() => {
    // Check for active session first (from StartWorkoutPage)
    const activeSession = workoutSession.get();
    if (activeSession?.workoutData) {
      // Restore from active session
      const { workoutData } = activeSession;
      loadWorkout(createWorkout(workoutData));

      // Restore UI state
      if (workoutData.customMuscleGroupName) setCustomMuscleGroupName(workoutData.customMuscleGroupName);
      if (workoutData.customSetCount) setCustomSetCount(workoutData.customSetCount);

      return; // Don't check draft
    }

    // Otherwise, try to restore draft
    if (workoutDraft.hasData()) {
      const confirmed = window.confirm(
        'We found an unsaved workout from your last session. Would you like to resume it?'
      );

      if (confirmed) {
        const draft = workoutDraft.get();

        // Restore workout data
        loadWorkout(draft);

        // Restore UI state
        if (draft.customMuscleGroupName) setCustomMuscleGroupName(draft.customMuscleGroupName);
        if (draft.customSetCount) setCustomSetCount(draft.customSetCount);
        if (draft.customRepCount) setCustomRepCount(draft.customRepCount);
        if (draft.workflowMode) setWorkflowMode(draft.workflowMode);
        if (draft.templateId) setSelectedTemplateFromDropdown(draft.templateId);
      } else {
        workoutDraft.clear();
      }
    }
  }, []); // Only run on mount

  // ===== CONTEXT VALUE =====
  const value = {
    // State
    workout,
    workflowMode,
    customMuscleGroupName,
    customSetCount,
    customRepCount,
    loadedTemplate,
    isLoadingTemplate,
    selectedTemplateFromDropdown,
    isSaving,
    isGeneratingSummary,
    previousWorkoutData,
    previousCustomExercises,
    previousCustomMuscleGroups,
    favoriteExercises,
    workoutDate,

    // Computed
    actualMuscleGroup,
    actualNumberOfSets,
    isWorkoutConfigured,

    // Actions
    updateWorkout,
    updateExercise,
    removeExercise,
    resetWorkout,
    loadWorkout,

    // Setters (for gradual migration)
    setWorkout,
    setWorkflowMode,
    setCustomMuscleGroupName,
    setCustomSetCount,
    setCustomRepCount,
    setLoadedTemplate,
    setIsLoadingTemplate,
    setSelectedTemplateFromDropdown,
    setIsSaving,
    setIsGeneratingSummary,
    setPreviousWorkoutData,
    setPreviousCustomExercises,
    setPreviousCustomMuscleGroups,
    setFavoriteExercises,
    setWorkoutDate,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};

/**
 * Hook to use workout context
 */
export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within WorkoutProvider');
  }
  return context;
};

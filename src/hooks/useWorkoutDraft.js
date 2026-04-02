import { useEffect } from 'react';
import { auth } from '../firebase';
import { STORAGE_KEYS } from '../constants';
import { loadTemplate } from '../utils/templateHelpers';

/**
 * Custom hook to auto-save and restore workout drafts from localStorage
 * Handles both active workout sessions and draft workouts
 */
export function useWorkoutDraft({
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
}) {
  // RECOVER DRAFT ON LOAD
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
          restoredExerciseData[ex.key] = {
            exerciseName: ex.exerciseName,
            sets: ex.completedSets.map(s => {
              if (s.weight) {
                return `${s.weight}x${s.reps}`;
              }
              return s.reps || '';
            }),
          };
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
        }

        return; // Don't check draft if we have active session
      } catch (err) {
        console.error('Failed to restore active session:', err);
      }
    }

    // Check for regular draft
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
              convertedData[key] = {
                ...exercise, // Keep all existing fields (selection, linkedExerciseId, detectedCategory, etc.)
                sets: exercise.sets || exercise.input || [],
                exerciseName: exercise.exerciseName || exercise.selection || '',
              };
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
        } else {
          // If they say No, clear the old draft so they start fresh
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);
        }
      }
    }
  }, [
    templateId,
    isLoadingTemplate,
    selectedTemplateFromDropdown,
    setSelectedMuscleGroup,
    setNumberOfSets,
    setExerciseData,
    setNote,
    setCustomMuscleGroupName,
    setCustomSetCount,
    setCustomRepCount,
    setShowCardio,
    setShowAbs,
    setCardioAtTop,
    setAbsAtTop,
    setLoadedTemplate,
    setSelectedTemplateFromDropdown,
  ]);

  // AUTO-SAVE TO LOCAL STORAGE
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
      };
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT, JSON.stringify(draft));
    }
  }, [
    selectedMuscleGroup,
    numberOfSets,
    exerciseData,
    note,
    customMuscleGroupName,
    customSetCount,
    customRepCount,
    selectedTemplateFromDropdown,
    showCardio,
    showAbs,
    cardioAtTop,
    absAtTop,
    justLoadedTemplate,
  ]);

  // PREVENT ACCIDENTAL TAB CLOSING
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Don't show warning if user has no exercise data
      if (Object.keys(exerciseData).length > 0) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [exerciseData]);
}

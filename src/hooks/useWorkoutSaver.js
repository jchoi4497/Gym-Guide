import { useState } from 'react';
import { collection, addDoc, getDoc, doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import db from '../firebase';
import { generateSummary } from '../summaryUtil';
import { STORAGE_KEYS, FIREBASE_FIELDS } from '../constants';
import { getMuscleGroupFromCategory } from '../utils/categoryDetection';

/**
 * Custom hook to handle workout saving to Firebase
 * Manages the entire save flow including custom exercise auto-save and summary generation
 */
export function useWorkoutSaver({
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
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

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
      console.error('Error auto-saving custom exercises:', error);
    }
  };

  // Main save workout function
  const handleSaveWorkout = async () => {
    setIsSaving(true);
    try {
      // Use the selected workout date - parse as local time, not UTC
      const [year, month, day] = workoutDate.split('-');
      const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
      const user = auth.currentUser;

      if (!user) {
        alert('You must be logged in to save a workout!');
        return;
      }

      // Auto-save custom exercises to "My Exercises"
      await autoSaveCustomExercises(user.uid, exerciseData);

      // Get previous workout directly
      const prevWorkout = await fetchPreviousWorkout(selectedDate, actualMuscleGroup);
      const prevExerciseData = prevWorkout?.exerciseData || prevWorkout?.inputs;

      // Create exercise order array based on actual display order
      const allKeys = Object.keys(exerciseData);
      const cardioKeys = allKeys.filter(k => k.startsWith('cardio') || k.startsWith('custom_cardio'));
      const absKeys = allKeys.filter(k => k.startsWith('abs') || k.startsWith('custom_abs'));
      const mainKeys = allKeys.filter(k => !cardioKeys.includes(k) && !absKeys.includes(k));

      const exerciseOrder = [
        ...(cardioAtTop && showCardio ? cardioKeys : []),
        ...(absAtTop && showAbs ? absKeys : []),
        ...mainKeys,
        ...(!cardioAtTop && showCardio ? cardioKeys : []),
        ...(!absAtTop && showAbs ? absKeys : []),
      ];

      // Generate summary
      setIsGeneratingSummary(true);
      const newSummary = await generateSummary(exerciseData, note, prevExerciseData, [], exerciseOrder);
      setIsGeneratingSummary(false);

      // Validate exerciseData - filter out exercises without names (corrupted/incomplete data)
      const validatedExerciseData = {};
      let removedExercises = [];

      Object.entries(exerciseData).forEach(([key, exercise]) => {
        const exerciseName = exercise.exerciseName || exercise.selection;
        if (exerciseName && exerciseName.trim()) {
          validatedExerciseData[key] = exercise;
        } else {
          removedExercises.push(key);
          console.warn('[WorkoutSaver] Skipping exercise with no name:', key, exercise);
        }
      });

      // Alert user if we're removing exercises
      if (removedExercises.length > 0) {
        alert(`Warning: ${removedExercises.length} exercise(s) had no name and were not saved. Please make sure all exercises have names before saving.`);
        setIsSaving(false);
        setIsGeneratingSummary(false);
        return;
      }

      // Save WorkoutLog with new field names
      const workoutData = {
        [FIREBASE_FIELDS.USER_ID]: user.uid,
        [FIREBASE_FIELDS.MUSCLE_GROUP]: actualMuscleGroup,
        [FIREBASE_FIELDS.NUMBER_OF_SETS]: actualNumberOfSets,
        [FIREBASE_FIELDS.DATE]: selectedDate,
        [FIREBASE_FIELDS.EXERCISE_DATA]: validatedExerciseData,
        [FIREBASE_FIELDS.NOTE]: note,
        [FIREBASE_FIELDS.SUMMARY]: newSummary,
        exerciseOrder: exerciseOrder,
        createdAt: new Date(),
      };

      // Add template ID if workout was started from a template
      const activeTemplateId = templateId || selectedTemplateFromDropdown;
      if (activeTemplateId) {
        workoutData.templateId = activeTemplateId;
        workoutData.templateName = loadedTemplate?.name || 'Unknown Template';
      }

      const docRef = await addDoc(collection(db, 'workoutLogs'), workoutData);

      // Clear localStorage draft on success
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);

      // Get the document ID
      const workoutId = docRef.id;

      // Redirect to saved workout page
      window.location.href = `/SavedWorkout/${workoutId}`;
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Error saving workout. Please try again.');
    } finally {
      setIsSaving(false);
      setIsGeneratingSummary(false);
    }
  };

  return {
    isSaving,
    isGeneratingSummary,
    handleSaveWorkout,
  };
}

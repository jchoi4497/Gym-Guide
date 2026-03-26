import { doc, getDoc } from 'firebase/firestore';
import db from '../firebase';
import { getExerciseName } from '../config/exerciseConfig';

/**
 * Load a template from Firebase by template ID and user ID
 */
export async function loadTemplate(userId, templateId) {
  try {
    const templateDoc = await getDoc(doc(db, 'userTemplates', userId));

    if (!templateDoc.exists()) {
      return null;
    }

    const templates = templateDoc.data().templates || [];
    const template = templates.find(t => t.id === templateId);

    if (!template) {
      return null;
    }

    return template;
  } catch (error) {
    console.error('Error loading template:', error);
    return null;
  }
}

/**
 * Convert template exercises to exerciseData format for HypertrophyPage
 * Template format: { category: "incline", exerciseId: "dip", exerciseName: "Dumbbell Incline Press" }
 * HypertrophyPage format: { "incline": { exerciseName: "Dumbbell Incline Press", sets: [] } }
 */
export function templateToExerciseData(template, numberOfSets) {
  const exerciseData = {};

  if (!template.exercises || template.exercises.length === 0) {
    return exerciseData;
  }

  template.exercises.forEach((exercise) => {
    if (exercise.category && exercise.exerciseId) {
      // Use stored exerciseName, or convert exerciseId to full name, or fallback to exerciseId
      let displayName = exercise.exerciseName;

      if (!displayName) {
        // Try to convert the ID to the full name (for old templates without exerciseName)
        displayName = getExerciseName(exercise.exerciseId);
      }

      exerciseData[exercise.category] = {
        exerciseName: displayName, // Use the full name, not the ID
        sets: new Array(numberOfSets).fill(''), // Initialize empty sets
        detectedCategory: exercise.detectedCategory, // Preserve detected category
      };
    }
  });

  return exerciseData;
}

/**
 * Update template's last used timestamp
 */
export async function updateTemplateLastUsed(userId, templateId) {
  try {
    const templateDoc = await getDoc(doc(db, 'userTemplates', userId));

    if (!templateDoc.exists()) {
      return;
    }

    const templates = templateDoc.data().templates || [];
    const updatedTemplates = templates.map(t =>
      t.id === templateId
        ? { ...t, lastUsed: new Date().toISOString() }
        : t
    );

    const { setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'userTemplates', userId), { templates: updatedTemplates });
  } catch (error) {
    console.error('Error updating template last used:', error);
  }
}

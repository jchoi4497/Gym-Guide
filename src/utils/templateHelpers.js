import { doc, getDoc } from 'firebase/firestore';
import db from '../config/firebase';
import { getExerciseName } from '../config/exerciseConfig';

/**
 * Recursively remove undefined values from an object
 * Firebase doesn't allow undefined values, so we need to clean them out
 */
function cleanUndefinedValues(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefinedValues(item));
  } else if (obj !== null && typeof obj === 'object') {
    const cleaned = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        cleaned[key] = cleanUndefinedValues(obj[key]);
      }
    });
    return cleaned;
  }
  return obj;
}

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
 *
 * Returns: { exerciseData, mainExerciseOrder }
 */
export function templateToExerciseData(template, numberOfSets) {
  const exerciseData = {};
  const mainExerciseOrder = [];

  console.log('🔍 [templateToExerciseData] Starting conversion');
  console.log('🔍 [templateToExerciseData] Template:', template.name);
  console.log('🔍 [templateToExerciseData] Number of sets:', numberOfSets);
  console.log('🔍 [templateToExerciseData] Template exercises array:', template.exercises);

  if (!template.exercises || template.exercises.length === 0) {
    console.warn('⚠️ [templateToExerciseData] No exercises in template!');
    return { exerciseData, mainExerciseOrder };
  }

  // Ensure numberOfSets is a valid integer (handle string values from form inputs)
  const setsCount = parseInt(numberOfSets) || 4;
  console.log('🔍 [templateToExerciseData] Parsed sets count:', setsCount);

  template.exercises.forEach((exercise, index) => {
    console.log(`🔍 [templateToExerciseData] Processing exercise ${index}:`, exercise);

    if (exercise.category && exercise.exerciseId) {
      // Use stored exerciseName, or convert exerciseId to full name, or fallback to exerciseId
      let displayName = exercise.exerciseName;

      if (!displayName) {
        // Try to convert the ID to the full name (for old templates without exerciseName)
        displayName = getExerciseName(exercise.exerciseId);
        console.log(`🔍 [templateToExerciseData] Converted ID "${exercise.exerciseId}" to name "${displayName}"`);
      }

      // Build exercise object
      const exerciseObj = {
        exerciseName: displayName, // Use the full name, not the ID
        sets: new Array(setsCount).fill(''), // Initialize empty sets
      };

      // Only include detectedCategory if it exists (Firebase doesn't allow undefined)
      if (exercise.detectedCategory) {
        exerciseObj.detectedCategory = exercise.detectedCategory;
      }

      exerciseData[exercise.category] = exerciseObj;

      // Track order - only add main exercises (not cardio/abs sections)
      const isCardioOrAbs = exercise.category.toLowerCase().includes('cardio') ||
                           exercise.category.toLowerCase().includes('abs');
      if (!isCardioOrAbs) {
        mainExerciseOrder.push(exercise.category);
      }

      console.log(`✅ [templateToExerciseData] Added: ${exercise.category} -> ${displayName}`);
    } else {
      console.warn(`⚠️ [templateToExerciseData] Skipping exercise ${index} - missing category or exerciseId:`, exercise);
    }
  });

  console.log('🔍 [templateToExerciseData] Final exerciseData:', exerciseData);
  console.log('🔍 [templateToExerciseData] Total exercises loaded:', Object.keys(exerciseData).length);
  console.log('🔍 [templateToExerciseData] Main exercise order:', mainExerciseOrder);

  // Clean any undefined values before returning (Firebase safety)
  return {
    exerciseData: cleanUndefinedValues(exerciseData),
    mainExerciseOrder
  };
}

/**
 * Convert workout data to template format (opposite of templateToExerciseData)
 * Takes a workout's exerciseData and converts it back to template format
 */
export function workoutDataToTemplate(workoutData, userMetadata = {}) {
  console.log('[workoutDataToTemplate] Converting workout to template');
  console.log('[workoutDataToTemplate] Workout data:', workoutData);
  console.log('[workoutDataToTemplate] User metadata:', userMetadata);

  // Convert exerciseData back to exercises array
  const exercises = Object.entries(workoutData.exerciseData || {})
    .filter(([_, exercise]) => exercise.exerciseName?.trim())
    .map(([categoryKey, exercise]) => {
      const ex = {
        category: categoryKey,
        exerciseId: categoryKey,
        exerciseName: exercise.exerciseName,
      };
      // Only include detectedCategory if it exists
      if (exercise.detectedCategory) {
        ex.detectedCategory = exercise.detectedCategory;
      }
      return ex;
    });

  console.log('[workoutDataToTemplate] Converted exercises:', exercises);

  // Build template using same format as TemplateEditor
  const template = {
    name: userMetadata.name || `${workoutData.muscleGroup || workoutData.customMuscleGroupName} Template`,
    description: userMetadata.description || '',
    category: userMetadata.category || 'Hypertrophy',
    muscleGroup: workoutData.muscleGroup || 'custom',
    customMuscleGroupName: workoutData.customMuscleGroupName || '',
    numberOfSets: workoutData.numberOfSets || null,
    customSetCount: workoutData.customSetCount || null,
    customRepCount: workoutData.customRepCount || null,
    exercises: exercises,
    includeCardio: workoutData.showCardio || false,
    cardioAtTop: workoutData.cardioAtTop || false,
    includeAbs: workoutData.showAbs || false,
    absAtTop: workoutData.absAtTop || false,
    tags: userMetadata.tags || [],
    isFavorite: userMetadata.isFavorite || false,
  };

  console.log('[workoutDataToTemplate] Final template:', template);

  // Deep clean to remove any remaining undefined values
  return cleanUndefinedValues(template);
}

/**
 * Save template to Firebase (extracted from TemplateSelectionPage logic)
 */
export async function saveTemplateToFirebase(userId, templateData) {
  console.log('[saveTemplateToFirebase] Saving template for user:', userId);
  console.log('[saveTemplateToFirebase] Template data:', templateData);

  try {
    const { setDoc } = await import('firebase/firestore');

    // Get existing templates
    const templateDoc = await getDoc(doc(db, 'userTemplates', userId));
    const existingTemplates = templateDoc.exists() ? templateDoc.data().templates || [] : [];

    console.log('[saveTemplateToFirebase] Existing templates:', existingTemplates.length);

    // Create new template with generated ID and timestamps
    let templateToSave = {
      ...templateData,
      id: `template_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Remove icon if present
    if ('icon' in templateToSave) {
      delete templateToSave.icon;
    }

    // Deep clean to remove all undefined values (Firebase doesn't allow undefined)
    templateToSave = cleanUndefinedValues(templateToSave);

    console.log('[saveTemplateToFirebase] Template to save (cleaned):', templateToSave);

    // Add to templates array and save
    const updatedTemplates = [...existingTemplates, templateToSave];
    await setDoc(doc(db, 'userTemplates', userId), { templates: updatedTemplates });

    console.log('[saveTemplateToFirebase] Successfully saved template with ID:', templateToSave.id);
    return templateToSave;
  } catch (error) {
    console.error('[saveTemplateToFirebase] Error saving template:', error);
    throw error;
  }
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

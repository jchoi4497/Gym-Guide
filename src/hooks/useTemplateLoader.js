import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { STORAGE_KEYS } from '../constants';
import { loadTemplate, templateToExerciseData, updateTemplateLastUsed } from '../utils/templateHelpers';

/**
 * Custom hook to load templates from URL or dropdown selection
 * Handles template data parsing and applying to workout form
 */
export function useTemplateLoader({
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
}) {
  const [loadedTemplate, setLoadedTemplate] = useState(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [selectedTemplateFromDropdown, setSelectedTemplateFromDropdown] = useState(null);
  const [justLoadedTemplate, setJustLoadedTemplate] = useState(false);

  // LOAD TEMPLATE FROM URL
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

        // Pre-fill exercises once we have the set count
        const setsCount = template.customSetCount || template.numberOfSets || 4;
        const prefilledExercises = templateToExerciseData(template, setsCount);
        setExerciseData(prefilledExercises);

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
  }, [
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
  ]);

  // Handle template selection from dropdown
  const handleTemplateSelect = async (selectedTemplateId) => {
    if (!selectedTemplateId) {
      setSelectedTemplateFromDropdown(null);
      setLoadedTemplate(null);
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setIsLoadingTemplate(true);
    setSelectedTemplateFromDropdown(selectedTemplateId);

    const template = await loadTemplate(user.uid, selectedTemplateId);

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

      // Pre-fill exercises
      const setsCount = template.customSetCount || template.numberOfSets || 4;
      const prefilledExercises = templateToExerciseData(template, setsCount);
      setExerciseData(prefilledExercises);

      // Update template's last used timestamp
      await updateTemplateLastUsed(user.uid, selectedTemplateId);

      // Clear any existing draft since we're loading a template
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);

      // Set flag to prevent auto-save from immediately triggering
      setJustLoadedTemplate(true);
      setTimeout(() => setJustLoadedTemplate(false), 1000);

      // Set workflow mode to template
      setWorkflowMode('template');
    }

    setIsLoadingTemplate(false);
  };

  return {
    loadedTemplate,
    setLoadedTemplate,
    isLoadingTemplate,
    selectedTemplateFromDropdown,
    setSelectedTemplateFromDropdown,
    justLoadedTemplate,
    handleTemplateSelect,
  };
}

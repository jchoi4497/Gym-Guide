import { useState } from 'react';
import { auth } from '../config/firebase';
import SaveAsTemplateModal from './SaveAsTemplateModal';
import { workoutDataToTemplate, saveTemplateToFirebase } from '../utils/templateHelpers';
import { useTheme } from '../contexts/ThemeContext';

function SaveAsTemplateButton({ workoutData, buttonText = 'Save as Template', buttonClassName = '' }) {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);

  // Listen for auth state
  useState(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = () => {
    if (!auth.currentUser) {
      alert('Please sign in to save templates');
      return;
    }

    if (!workoutData) {
      alert('No workout data available');
      return;
    }

    setShowModal(true);
  };

  const handleSaveTemplate = async (userMetadata) => {
    console.log('[SaveAsTemplateButton] Starting save process');
    console.log('[SaveAsTemplateButton] User metadata:', userMetadata);

    if (!auth.currentUser) {
      alert('Please sign in to save templates');
      throw new Error('User not authenticated');
    }

    if (!workoutData) {
      alert('No workout data available');
      throw new Error('No workout data');
    }

    try {
      // Step 1: Convert workout data to template format
      const template = workoutDataToTemplate(workoutData, userMetadata);
      console.log('[SaveAsTemplateButton] Converted template:', template);

      // Step 2: Save to Firebase
      const savedTemplate = await saveTemplateToFirebase(auth.currentUser.uid, template);
      console.log('[SaveAsTemplateButton] Successfully saved:', savedTemplate);

      // Step 3: Close modal and show success
      setShowModal(false);
      alert(`Template "${savedTemplate.name}" saved successfully!`);
    } catch (error) {
      console.error('[SaveAsTemplateButton] Error saving template:', error);
      throw error; // Re-throw so modal can handle it
    }
  };

  // Generate default name for the template
  const defaultName = workoutData
    ? `${workoutData.muscleGroup || workoutData.customMuscleGroupName || 'Workout'} - ${new Date().toLocaleDateString()}`
    : 'My Template';

  // Default button styling if none provided
  const defaultButtonClass = buttonClassName || `px-6 py-3 ${theme.btnPrimary} ${theme.btnPrimaryText} font-semibold rounded-lg shadow-md transition-all hover:shadow-lg`;

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={defaultButtonClass}
        disabled={!workoutData}
      >
        {buttonText}
      </button>

      <SaveAsTemplateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveTemplate}
        defaultName={defaultName}
        workoutData={workoutData}
      />
    </>
  );
}

export default SaveAsTemplateButton;

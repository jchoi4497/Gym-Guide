import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import db from '../config/firebase';

function TemplateCard({ template, onUpdate, onEdit, onDelete, onDuplicate, isBuiltIn = false }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle favorite status
  const handleToggleFavorite = async (e) => {
    e.stopPropagation();

    const user = auth.currentUser;
    if (!user) return;

    try {
      const templateDoc = await getDoc(doc(db, 'userTemplates', user.uid));
      if (templateDoc.exists()) {
        const templates = templateDoc.data().templates || [];
        const updatedTemplates = templates.map(t =>
          t.id === template.id ? { ...t, isFavorite: !t.isFavorite } : t
        );
        await setDoc(doc(db, 'userTemplates', user.uid), { templates: updatedTemplates });
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Delete template
  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  // Format muscle group display
  const getMuscleGroupDisplay = () => {
    if (template.customMuscleGroupName) {
      return template.customMuscleGroupName;
    }
    if (template.muscleGroup) {
      return template.muscleGroup.charAt(0).toUpperCase() + template.muscleGroup.slice(1);
    }
    return 'Any Muscle Group';
  };

  // Format set/rep display
  const getSetRepDisplay = () => {
    if (template.customSetCount && template.customRepCount) {
      return `${template.customSetCount} × ${template.customRepCount}`;
    }
    if (template.customSetCount) {
      return `${template.customSetCount} sets`;
    }
    if (template.numberOfSets) {
      return `${template.numberOfSets} sets`;
    }
    return 'Flexible';
  };

  // Get exercise count
  const getExerciseCount = () => {
    if (template.exercises && template.exercises.length > 0) {
      return `${template.exercises.length} exercises`;
    }
    return 'Custom exercises';
  };

  const handleCardClick = () => {
    // For built-in templates, navigate to Create page with template data
    // For user templates, also navigate to Create page with template ID
    if (isBuiltIn) {
      // Pass the template via navigate state
      navigate('/Create', { state: { template } });
    } else {
      navigate('/Create', { state: { templateId: template.id } });
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  const handleDuplicateClick = (e) => {
    e.stopPropagation();
    if (onDuplicate) {
      onDuplicate();
    }
  };

  return (
    <div className="block">
      <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-2xl font-bold flex-1">{template.name}</h3>
            {!isBuiltIn && (
              <button
                onClick={handleToggleFavorite}
                className="text-2xl hover:scale-110 transition-transform ml-2"
              >
                {template.isFavorite ? '⭐' : '☆'}
              </button>
            )}
          </div>
          {template.category && (
            <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
              {template.category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4 min-h-[3rem]">
            {template.description || 'No description provided'}
          </p>

          {/* Template Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-semibold">🎯 Target:</span>
              <span>{getMuscleGroupDisplay()}</span>
            </div>
            {!isBuiltIn && (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="font-semibold">📊 Volume:</span>
                  <span>{getSetRepDisplay()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="font-semibold">🏋️ Exercises:</span>
                  <span>{getExerciseCount()}</span>
                </div>
              </>
            )}
          </div>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {template.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4">
            <button
              onClick={handleCardClick}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-2"
            >
              Start Workout
            </button>
            {!isBuiltIn && (onEdit || onDelete || onDuplicate) && (
              <div onClick={(e) => e.stopPropagation()} className="grid grid-cols-3 gap-2">
                {onEdit && (
                  <button
                    onClick={handleEditClick}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    Edit
                  </button>
                )}
                {onDuplicate && (
                  <button
                    onClick={handleDuplicateClick}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-semibold"
                  >
                    Copy
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDeleteClick}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Last Used */}
          {template.lastUsed && (
            <div className="mt-3 text-xs text-gray-500 text-center">
              Last used: {new Date(template.lastUsed).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateCard;

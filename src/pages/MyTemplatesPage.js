import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import db from '../config/firebase';
import Navbar from '../components/Navbar';
import TemplateEditor from '../components/TemplateEditor';

function MyTemplatesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  // Check if we're editing an existing template (from URL params)
  const editId = searchParams.get('edit');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchTemplates(currentUser.uid);
      } else {
        setIsLoading(false);
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (editId && templates.length > 0) {
      const template = templates.find(t => t.id === editId);
      if (template) {
        setEditingTemplate(template);
        setShowEditor(true);
      }
    }
  }, [editId, templates]);

  const fetchTemplates = async (userId) => {
    try {
      const templateDoc = await getDoc(doc(db, 'userTemplates', userId));
      if (templateDoc.exists()) {
        setTemplates(templateDoc.data().templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleSaveTemplate = async (templateData) => {
    if (!user) return;

    try {
      const templateDoc = await getDoc(doc(db, 'userTemplates', user.uid));
      let updatedTemplates = templateDoc.exists() ? templateDoc.data().templates || [] : [];

      let templateToSave;

      if (editingTemplate) {
        // Update existing template
        templateToSave = {
          ...templateData,
          id: editingTemplate.id,
          createdAt: editingTemplate.createdAt || new Date().toISOString(),
        };
        updatedTemplates = updatedTemplates.map(t =>
          t.id === editingTemplate.id ? templateToSave : t
        );
      } else {
        // Create new template
        templateToSave = {
          ...templateData,
          id: `template_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        updatedTemplates.push(templateToSave);
      }

      // Clean up undefined values and legacy fields in all templates (Firestore doesn't allow undefined)
      const cleanedTemplates = updatedTemplates.map(template => {
        const cleaned = { ...template };
        Object.keys(cleaned).forEach(key => {
          if (cleaned[key] === undefined) {
            delete cleaned[key];
          }
        });
        // Remove legacy icon field from old templates
        if ('icon' in cleaned) {
          delete cleaned.icon;
        }
        return cleaned;
      });

      await setDoc(doc(db, 'userTemplates', user.uid), { templates: cleanedTemplates });

      // Refresh templates
      await fetchTemplates(user.uid);

      // Close editor
      setShowEditor(false);
      setEditingTemplate(null);

      // Navigate back to templates list
      navigate('/MyTemplates');
    } catch (error) {
      console.error('Error saving template:', error);
      alert(`Failed to save template: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingTemplate(null);
    navigate('/MyTemplates');
  };

  const handleDelete = async (templateId) => {
    if (!user) return;

    const template = templates.find(t => t.id === templateId);
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${template?.name}"? This cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const templateDoc = await getDoc(doc(db, 'userTemplates', user.uid));
      if (templateDoc.exists()) {
        const updatedTemplates = templateDoc.data().templates.filter(t => t.id !== templateId);
        await setDoc(doc(db, 'userTemplates', user.uid), { templates: updatedTemplates });
        await fetchTemplates(user.uid);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const handleDuplicate = async (templateId) => {
    if (!user) return;

    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    try {
      const templateDoc = await getDoc(doc(db, 'userTemplates', user.uid));
      const updatedTemplates = templateDoc.exists() ? templateDoc.data().templates || [] : [];

      const duplicatedTemplate = {
        ...template,
        id: `template_${Date.now()}`,
        name: `${template.name} (Copy)`,
        createdAt: new Date().toISOString(),
        isFavorite: false,
      };

      updatedTemplates.push(duplicatedTemplate);
      await setDoc(doc(db, 'userTemplates', user.uid), { templates: updatedTemplates });
      await fetchTemplates(user.uid);
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Failed to duplicate template. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen pb-32 font-serif">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 pt-14 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl text-gray-700">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (showEditor) {
    return (
      <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen pb-32 font-serif">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-14">
          <h1 className="text-5xl font-extrabold mb-4 text-gray-800">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </h1>
          <p className="text-lg text-gray-700 italic mb-10">
            {editingTemplate
              ? 'Update your custom workout template'
              : 'Build your own workout template with custom exercises and structure'}
          </p>
          <TemplateEditor
            template={editingTemplate}
            onSave={handleSaveTemplate}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen pb-32 font-serif">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-14">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-extrabold mb-4 text-gray-800">My Templates</h1>
            <p className="text-lg text-gray-700 italic">
              Manage your custom workout templates
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-105 text-sm"
          >
            + Create New
          </button>
        </div>

        {/* Templates List */}
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold flex-1">{template.name}</h3>
                    {template.isFavorite && <span className="text-2xl ml-2">⭐</span>}
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
                    {template.description || 'No description'}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-700">
                    <div>
                      <strong>Target:</strong> {template.customMuscleGroupName || template.muscleGroup || 'Any'}
                    </div>
                    {template.exercises && (
                      <div>
                        <strong>Exercises:</strong> {template.exercises.length}
                      </div>
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
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setEditingTemplate(template);
                        setShowEditor(true);
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(template.id)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-semibold"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Timestamp */}
                  {template.createdAt && (
                    <div className="mt-3 text-xs text-gray-500 text-center">
                      Created: {new Date(template.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-sky-50 rounded-3xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">No Templates Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first custom template to save your favorite workout routines
            </p>
            <button
              onClick={handleCreateNew}
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg"
            >
              Create Your First Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTemplatesPage;

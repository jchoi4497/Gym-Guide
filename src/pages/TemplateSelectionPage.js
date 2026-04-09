import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import db from '../config/firebase';
import Navbar from '../components/Navbar';
import TemplateCard from '../components/TemplateCard';
import TemplateEditor from '../components/TemplateEditor';
import { MUSCLE_GROUPS } from '../config/constants';
import { DEFAULT_EXERCISES, getExerciseName } from '../config/exerciseConfig';

// Helper function to convert DEFAULT_EXERCISES to template format
function createBuiltInTemplate(muscleGroup, name, description) {
  const defaultExercises = DEFAULT_EXERCISES[muscleGroup] || [];

  const exercises = defaultExercises.map(exercise => ({
    category: exercise.id,
    exerciseId: exercise.selected,
    exerciseName: getExerciseName(exercise.selected),
  }));

  return {
    id: `builtin_${muscleGroup}`,
    name: name,
    description: description,
    muscleGroup: muscleGroup,
    numberOfSets: 4, // Default to 4 sets
    customSetCount: 4,
    customRepCount: 12,
    exercises: exercises,
    isBuiltIn: true,
    category: 'Hypertrophy',
  };
}

// Built-in templates for each muscle group
const BUILTIN_TEMPLATES = [
  createBuiltInTemplate(
    MUSCLE_GROUPS.CHEST,
    'Chest/Triceps Hypertrophy',
    'Complete chest and triceps workout with compound and isolation exercises.'
  ),
  createBuiltInTemplate(
    MUSCLE_GROUPS.BACK,
    'Back/Biceps Hypertrophy',
    'Full back development with pull-ups, rows, and bicep work.'
  ),
  createBuiltInTemplate(
    MUSCLE_GROUPS.LEGS,
    'Legs Hypertrophy',
    'Comprehensive leg workout targeting quads, hamstrings, glutes, and calves.'
  ),
  createBuiltInTemplate(
    MUSCLE_GROUPS.SHOULDERS,
    'Shoulders/Forearms Hypertrophy',
    'Complete shoulder development with rear delts, lateral raises, and forearm work.'
  ),
];

function TemplateSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userTemplates, setUserTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState('custom'); // 'builtin' or 'custom'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
  const [openMenuId, setOpenMenuId] = useState(null); // Track which template menu is open

  // Check if we're editing an existing template (from URL params)
  const editId = searchParams.get('edit');

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserTemplates(currentUser.uid);
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle edit mode from URL params
  useEffect(() => {
    if (editId && userTemplates.length > 0) {
      const template = userTemplates.find(t => t.id === editId);
      if (template) {
        setEditingTemplate(template);
        setShowEditor(true);
      }
    }
  }, [editId, userTemplates]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  // Fetch user's custom templates
  const fetchUserTemplates = async (userId) => {
    try {
      const templateDoc = await getDoc(doc(db, 'userTemplates', userId));
      if (templateDoc.exists()) {
        const templates = templateDoc.data().templates || [];
        setUserTemplates(templates);
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
  };4

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

      // Clean up undefined values
      const cleanedTemplates = updatedTemplates.map(template => {
        const cleaned = { ...template };
        Object.keys(cleaned).forEach(key => {
          if (cleaned[key] === undefined) {
            delete cleaned[key];
          }
        });
        if ('icon' in cleaned) {
          delete cleaned.icon;
        }
        return cleaned;
      });

      await setDoc(doc(db, 'userTemplates', user.uid), { templates: cleanedTemplates });
      await fetchUserTemplates(user.uid);

      setShowEditor(false);
      setEditingTemplate(null);
      navigate('/Templates');
    } catch (error) {
      console.error('Error saving template:', error);
      alert(`Failed to save template: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingTemplate(null);
    navigate('/Templates');
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!user) return;

    const template = userTemplates.find(t => t.id === templateId);
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${template?.name}"? This cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const templateDoc = await getDoc(doc(db, 'userTemplates', user.uid));
      if (templateDoc.exists()) {
        const updatedTemplates = templateDoc.data().templates.filter(t => t.id !== templateId);
        await setDoc(doc(db, 'userTemplates', user.uid), { templates: updatedTemplates });
        await fetchUserTemplates(user.uid);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const handleDuplicate = async (templateId) => {
    if (!user) return;

    const template = userTemplates.find(t => t.id === templateId);
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
      await fetchUserTemplates(user.uid);
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Failed to duplicate template. Please try again.');
    }
  };


  // Get all unique tags from user templates
  const allTags = [...new Set(userTemplates.flatMap(t => t.tags || []))];

  // Filter user templates based on search and tags
  const filteredTemplates = userTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = filterTag === 'all' || template.tags?.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  // Filter built-in templates based on search
  const filteredBuiltInTemplates = BUILTIN_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.muscleGroup?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get favorite templates
  const favoriteTemplates = filteredTemplates.filter(t => t.isFavorite);
  const regularTemplates = filteredTemplates.filter(t => !t.isFavorite);

  // Loading state
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

  // Editor view
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
        <div className="mb-10">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-extrabold mb-4 text-gray-800">Templates</h1>
            <p className="text-lg text-gray-700 italic">
              Start from a template or create your own custom workout plan
            </p>
          </div>
        </div>

        {/* Search Bar - Always visible when there are templates to search */}
        {(userTemplates.length > 0 || BUILTIN_TEMPLATES.length > 0) && (
          <div className="mb-6 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Create New Template Button */}
        {user && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              + Create New Template
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-5 py-2 rounded-full font-semibold transition-all text-sm ${
              activeTab === 'custom'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            My Templates
          </button>
          <button
            onClick={() => setActiveTab('builtin')}
            className={`px-5 py-2 rounded-full font-semibold transition-all text-sm ${
              activeTab === 'builtin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            Built-in Programs
          </button>
        </div>

        {/* Built-in Templates Tab */}
        {activeTab === 'builtin' && (
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-blue-600">📚</span> Built-in Programs
              </h2>
              {/* View Toggle Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                    viewMode === 'cards'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                  }`}
                  title="Card View"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <rect x="2" y="2" width="6" height="6" rx="1"/>
                    <rect x="12" y="2" width="6" height="6" rx="1"/>
                    <rect x="2" y="12" width="6" height="6" rx="1"/>
                    <rect x="12" y="12" width="6" height="6" rx="1"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                  }`}
                  title="List View"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <rect x="2" y="3" width="16" height="2" rx="1"/>
                    <rect x="2" y="9" width="16" height="2" rx="1"/>
                    <rect x="2" y="15" width="16" height="2" rx="1"/>
                  </svg>
                </button>
              </div>
            </div>
            {filteredBuiltInTemplates.length === 0 ? (
              <div className="bg-sky-50 rounded-3xl p-12 text-center shadow-lg">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">No templates found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms
                </p>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBuiltInTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => {}}
                    isBuiltIn={true}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBuiltInTemplates.map(template => (
                  <div
                    key={template.id}
                    className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-lg">{template.name}</h3>
                        <div className="flex gap-4 mt-1 text-sm text-gray-600">
                          <span>🎯 {template.muscleGroup}</span>
                          {template.exercises && <span>🏋️ {template.exercises.length} exercises</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/Create', { state: { template } })}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm whitespace-nowrap flex-shrink-0"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Custom Templates Tab */}
        {activeTab === 'custom' && (
          <>
            {/* Filter by Tags */}
            {user && userTemplates.length > 0 && allTags.length > 0 && (
              <div className="mb-8 max-w-md mx-auto">
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            )}

            {/* User Templates */}
            {user && !isLoading && (
              <>
                {/* No results from search */}
                {searchTerm && favoriteTemplates.length === 0 && regularTemplates.length === 0 && userTemplates.length > 0 && (
                  <div className="bg-sky-50 rounded-3xl p-12 text-center shadow-lg mb-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">No templates found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search terms
                    </p>
                  </div>
                )}

                {/* Favorites */}
                {favoriteTemplates.length > 0 && (
                  <div className="mb-16">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-yellow-500">⭐</span> Favorites
                      </h2>
                      {/* View Toggle Buttons - only show if this is the only section */}
                      {regularTemplates.length === 0 && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewMode('cards')}
                            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                              viewMode === 'cards'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                            }`}
                            title="Card View"
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                              <rect x="2" y="2" width="6" height="6" rx="1"/>
                              <rect x="12" y="2" width="6" height="6" rx="1"/>
                              <rect x="2" y="12" width="6" height="6" rx="1"/>
                              <rect x="12" y="12" width="6" height="6" rx="1"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                              viewMode === 'list'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                            }`}
                            title="List View"
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                              <rect x="2" y="3" width="16" height="2" rx="1"/>
                              <rect x="2" y="9" width="16" height="2" rx="1"/>
                              <rect x="2" y="15" width="16" height="2" rx="1"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    {viewMode === 'cards' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {favoriteTemplates.map(template => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onUpdate={() => fetchUserTemplates(user.uid)}
                            onEdit={() => {
                              setEditingTemplate(template);
                              setShowEditor(true);
                            }}
                            onDelete={() => handleDeleteTemplate(template.id)}
                            onDuplicate={() => handleDuplicate(template.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {favoriteTemplates.map(template => (
                          <div
                            key={template.id}
                            className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-start justify-between gap-6">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-bold text-gray-800 text-lg truncate">{template.name}</h3>
                                  <span className="text-yellow-500 flex-shrink-0">⭐</span>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                  <span className="whitespace-nowrap">🎯 {template.customMuscleGroupName || template.muscleGroup || 'Any'}</span>
                                  {template.exercises && <span className="whitespace-nowrap">🏋️ {template.exercises.length} exercises</span>}
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0 items-start pt-1">
                                <button
                                  onClick={() => navigate('/Create', { state: { templateId: template.id } })}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm whitespace-nowrap"
                                >
                                  Start
                                </button>
                                {/* Hamburger Menu */}
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(openMenuId === template.id ? null : template.id);
                                    }}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                  >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                      <circle cx="10" cy="5" r="1.5"/>
                                      <circle cx="10" cy="10" r="1.5"/>
                                      <circle cx="10" cy="15" r="1.5"/>
                                    </svg>
                                  </button>
                                  {openMenuId === template.id && (
                                    <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                                      <button
                                        onClick={() => {
                                          setEditingTemplate(template);
                                          setShowEditor(true);
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 rounded-t-lg"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleDuplicate(template.id);
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                                      >
                                        Copy
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleDeleteTemplate(template.id);
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600 rounded-b-lg"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* My Templates */}
                {regularTemplates.length > 0 && (
                  <div className="mb-16">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-green-600">📋</span> My Templates
                      </h2>
                      {/* View Toggle Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewMode('cards')}
                          className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                            viewMode === 'cards'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                          }`}
                          title="Card View"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <rect x="2" y="2" width="6" height="6" rx="1"/>
                            <rect x="12" y="2" width="6" height="6" rx="1"/>
                            <rect x="2" y="12" width="6" height="6" rx="1"/>
                            <rect x="12" y="12" width="6" height="6" rx="1"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                            viewMode === 'list'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                          }`}
                          title="List View"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <rect x="2" y="3" width="16" height="2" rx="1"/>
                            <rect x="2" y="9" width="16" height="2" rx="1"/>
                            <rect x="2" y="15" width="16" height="2" rx="1"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    {viewMode === 'cards' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {regularTemplates.map(template => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onUpdate={() => fetchUserTemplates(user.uid)}
                            onEdit={() => {
                              setEditingTemplate(template);
                              setShowEditor(true);
                            }}
                            onDelete={() => handleDeleteTemplate(template.id)}
                            onDuplicate={() => handleDuplicate(template.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {regularTemplates.map(template => (
                          <div
                            key={template.id}
                            className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-start justify-between gap-6">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-800 text-lg truncate mb-2">{template.name}</h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                  <span className="whitespace-nowrap">🎯 {template.customMuscleGroupName || template.muscleGroup || 'Any'}</span>
                                  {template.exercises && <span className="whitespace-nowrap">🏋️ {template.exercises.length} exercises</span>}
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0 items-start pt-1">
                                <button
                                  onClick={() => navigate('/Create', { state: { templateId: template.id } })}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm whitespace-nowrap"
                                >
                                  Start
                                </button>
                                {/* Hamburger Menu */}
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(openMenuId === template.id ? null : template.id);
                                    }}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                  >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                      <circle cx="10" cy="5" r="1.5"/>
                                      <circle cx="10" cy="10" r="1.5"/>
                                      <circle cx="10" cy="15" r="1.5"/>
                                    </svg>
                                  </button>
                                  {openMenuId === template.id && (
                                    <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                                      <button
                                        onClick={() => {
                                          setEditingTemplate(template);
                                          setShowEditor(true);
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 rounded-t-lg"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleDuplicate(template.id);
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                                      >
                                        Copy
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleDeleteTemplate(template.id);
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600 rounded-b-lg"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {userTemplates.length === 0 && (
                  <div className="bg-sky-50 rounded-3xl p-12 text-center shadow-lg mb-16">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">No Custom Templates Yet</h3>
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
              </>
            )}

            {/* Not Logged In State - show in custom tab only */}
            {!user && !isLoading && (
              <div className="bg-sky-50 rounded-3xl p-12 text-center shadow-lg mb-12">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Sign In to Access Custom Templates</h3>
                <p className="text-gray-600">
                  Create and save custom workout templates by signing in with Google
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TemplateSelectionPage;

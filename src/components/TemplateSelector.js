import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import db from '../firebase';

function TemplateSelector({ onSelectTemplate, selectedTemplateId }) {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      const user = auth.currentUser;
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const templateDoc = await getDoc(doc(db, 'userTemplates', user.uid));
        if (templateDoc.exists()) {
          const userTemplates = templateDoc.data().templates || [];
          // Sort by favorites first, then by last used
          const sorted = userTemplates.sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            if (a.lastUsed && b.lastUsed) {
              return new Date(b.lastUsed) - new Date(a.lastUsed);
            }
            return 0;
          });
          setTemplates(sorted);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchTemplates();
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-3 text-gray-500 text-sm">
        Loading templates...
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 mb-2">
          <strong>💡 No templates yet?</strong> Create your first template to save time on future workouts!
        </p>
        <a
          href="/MyTemplates"
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold underline"
        >
          Create a Template →
        </a>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Load from Template (optional)
      </label>

      <select
        value={selectedTemplateId || ''}
        onChange={(e) => onSelectTemplate(e.target.value || null)}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">-- Start from Scratch --</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.icon || '💪'} {template.name}
            {template.isFavorite ? ' ⭐' : ''}
            {template.lastUsed ? ` (Last used: ${new Date(template.lastUsed).toLocaleDateString()})` : ''}
          </option>
        ))}
      </select>

      {selectedTemplateId && (
        <div className="mt-3 bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
          <p className="text-blue-800 text-sm font-semibold">
            Template loaded! All fields have been pre-filled. You can modify them before starting your workout.
          </p>
        </div>
      )}

      {templates.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          {templates.length} template{templates.length !== 1 ? 's' : ''} available
        </div>
      )}
    </div>
  );
}

export default TemplateSelector;

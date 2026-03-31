import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import db from '../config/firebase';
import Navbar from '../components/Navbar';
import TemplateCard from '../components/TemplateCard';
import { FIREBASE_FIELDS } from '../config/constants';

// Built-in templates (expand this array for more training styles in the future)
const BUILTIN_TEMPLATES = [
  {
    id: 'builtin_hypertrophy',
    name: 'Pure Hypertrophy',
    description: 'My default muscle-building program with focus on controlled reps and progressive overload.',
    muscleGroup: null, // User selects on workout page
    isBuiltIn: true,
    category: 'Hypertrophy',
  },
  // Future templates can be added here:
  // {
  //   id: 'builtin_strength',
  //   name: 'Strength Training',
  //   description: 'Build maximum strength with lower reps and heavier weights.',
  //   muscleGroup: null,
  //   isBuiltIn: true,
  //   icon: '🏋️',
  //   category: 'Strength',
  // },
  // {
  //   id: 'builtin_power',
  //   name: 'Power Development',
  //   description: 'Explosive movements for athletic performance.',
  //   muscleGroup: null,
  //   isBuiltIn: true,
  //   icon: '⚡',
  //   category: 'Power',
  // },
];

function TemplateSelectionPage() {
  const [userTemplates, setUserTemplates] = useState([]);
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserTemplates(currentUser.uid);
        fetchRecentTemplates(currentUser.uid);
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

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

  // Fetch recently used templates from workout history
  const fetchRecentTemplates = async (userId) => {
    try {
      const q = query(
        collection(db, 'workoutLogs'),
        where(FIREBASE_FIELDS.USER_ID, '==', userId),
        // orderBy(FIREBASE_FIELDS.DATE, 'desc'),
        // limit(10)
      );

      const querySnapshot = await getDocs(q);
      const templateUsage = new Map();

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const templateId = data.templateId;

        if (templateId) {
          if (!templateUsage.has(templateId)) {
            templateUsage.set(templateId, {
              templateId,
              lastUsed: data.date,
              count: 0,
            });
          }
          const usage = templateUsage.get(templateId);
          usage.count++;
          if (data.date > usage.lastUsed) {
            usage.lastUsed = data.date;
          }
        }
      });

      // Sort by last used
      const recent = Array.from(templateUsage.values())
        .sort((a, b) => b.lastUsed - a.lastUsed)
        .slice(0, 3);

      setRecentTemplates(recent);
    } catch (error) {
      console.error('Error fetching recent templates:', error);
    }
  };

  // Get all unique tags from user templates
  const allTags = [...new Set(userTemplates.flatMap(t => t.tags || []))];

  // Filter templates based on search and tags
  const filteredTemplates = userTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = filterTag === 'all' || template.tags?.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  // Get favorite templates
  const favoriteTemplates = filteredTemplates.filter(t => t.isFavorite);
  const regularTemplates = filteredTemplates.filter(t => !t.isFavorite);

  return (
    <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen pb-32 font-serif">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-14">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold mb-4 text-gray-800">Choose Your Workout Template</h1>
          <p className="text-lg text-gray-700 italic">
            Start from a template or create your own custom workout plan
          </p>
        </div>

        {/* Search and Filter Bar */}
        {user && userTemplates.length > 0 && (
          <div className="mb-8 bg-sky-50 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:w-64">
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Built-in Templates */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span className="text-blue-600">📚</span> Built-in Programs
          </h2>
          <p className="text-gray-600 mb-6">
            My proven training programs designed for different goals
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BUILTIN_TEMPLATES.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => {}}
                isBuiltIn={true}
              />
            ))}
          </div>
        </div>

        {/* User Templates */}
        {user && !isLoading && (
          <>
            {/* Favorites */}
            {favoriteTemplates.length > 0 && (
              <div className="mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span> Favorites
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {favoriteTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onUpdate={() => fetchUserTemplates(user.uid)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* My Templates */}
            {regularTemplates.length > 0 && (
              <div className="mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <span className="text-green-600">📋</span> My Templates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onUpdate={() => fetchUserTemplates(user.uid)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Create New Template CTA */}
            <div className="mb-16 max-w-2xl mx-auto">
              <Link to="/MyTemplates">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-3">➕</div>
                    <h3 className="text-2xl font-bold mb-2">Create Custom Template</h3>
                    <p className="text-sm opacity-90">
                      Build your own workout plan with custom exercises
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Empty State */}
            {userTemplates.length === 0 && (
              <div className="bg-sky-50 rounded-3xl p-12 text-center shadow-lg mb-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">No Custom Templates Yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first custom template to save your favorite workout routines
                </p>
                <Link to="/MyTemplates">
                  <button className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg">
                    Create Your First Template
                  </button>
                </Link>
              </div>
            )}
          </>
        )}

        {/* Not Logged In State */}
        {!user && !isLoading && (
          <div className="bg-sky-50 rounded-3xl p-12 text-center shadow-lg mb-12">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Sign In to Access Custom Templates</h3>
            <p className="text-gray-600">
              Create and save custom workout templates by signing in with Google
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="max-w-5xl mx-auto bg-sky-50 rounded-3xl shadow-2xl p-10 text-gray-800 space-y-6 mt-16">
          <h3 className="text-2xl font-bold underline mb-4">📌 About Templates</h3>
          <ul className="space-y-3 text-lg leading-relaxed">
            <li>
              <strong>Built-in Programs:</strong> My tested workout plans for different goals - currently focused on Hypertrophy, with Strength and Power coming soon
            </li>
            <li>
              <strong>Custom Templates:</strong> Create your own templates for any training style (PPL, Upper/Lower, Full Body, etc.) with your preferred exercises
            </li>
            <li>
              <strong>Quick Start:</strong> Templates save time by pre-filling exercises - just add your weights and reps
            </li>
            <li>
              <strong>Always Flexible:</strong> Templates are starting points - you can modify exercises during any workout
            </li>
            <li>
              <strong>Track Progress:</strong> Use the same template consistently to see your strength gains over time
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TemplateSelectionPage;

import { Link } from 'react-router-dom';

/**
 * WorkflowChoiceCards - Initial choice screen for workout creation
 * Shows two options: Follow My Program or Use Custom Templates
 */
function WorkflowChoiceCards({ onSelectWorkflow }) {
  return (
    <div className="mb-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        How would you like to train today?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Follow My Program Option */}
        <button
          onClick={() => onSelectWorkflow('custom')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white group relative"
        >
          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
            RECOMMENDED
          </div>
          <div className="text-6xl mb-4">💪</div>
          <h3 className="text-2xl font-bold mb-3">Follow My Program</h3>
          <p className="text-blue-100 text-sm mb-4">
            Use my proven hypertrophy split. Just pick your muscle group and I'll give you the exercises.
          </p>
          <div className="bg-white/20 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <span>✓</span>
              <span>Quick & simple</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span>✓</span>
              <span>My tested exercises</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Perfect for beginners</span>
            </div>
          </div>
        </button>

        {/* Use Custom Templates Option */}
        <button
          onClick={() => onSelectWorkflow('template')}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white group"
        >
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-2xl font-bold mb-3">Use Custom Templates</h3>
          <p className="text-purple-100 text-sm mb-4">
            Load your saved templates or create new ones for custom splits (PPL, Upper/Lower, etc.)
          </p>
          <div className="bg-white/20 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <span>✓</span>
              <span>Your saved routines</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span>✓</span>
              <span>Full customization</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Advanced training</span>
            </div>
          </div>
        </button>
      </div>

      {/* Link to manage templates */}
      <div className="text-center mt-6">
        <Link
          to="/MyTemplates"
          className="text-purple-700 hover:text-purple-800 font-semibold text-sm underline"
        >
          Manage My Custom Templates →
        </Link>
      </div>
    </div>
  );
}

export default WorkflowChoiceCards;

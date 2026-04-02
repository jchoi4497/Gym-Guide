import { Link } from 'react-router-dom';
import TemplateSelector from './TemplateSelector';

/**
 * TemplateWorkflowSection - Template selection interface
 * Shows when user chooses "Use Custom Templates" workflow
 */
function TemplateWorkflowSection({
  selectedTemplateFromDropdown,
  loadedTemplate,
  actualMuscleGroup,
  setRangeLabel,
  exerciseData,
  onTemplateSelect,
  onBackToChoice,
  onClearTemplate,
}) {
  return (
    <div className="mb-8">
      <div className="bg-sky-50 rounded-3xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Choose Your Template</h2>
          <button
            onClick={onBackToChoice}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            ← Back to choices
          </button>
        </div>

        {/* Option 1: Use existing template */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Load an existing template
          </label>
          <TemplateSelector
            onSelectTemplate={onTemplateSelect}
            selectedTemplateId={selectedTemplateFromDropdown}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Option 2: Create new template */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            Don't have a template for this workout yet?
          </p>
          <Link to="/MyTemplates">
            <button className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2">
              <span>➕</span>
              <span>Create New Template</span>
            </button>
          </Link>
          <p className="text-xs text-gray-500 mt-2">
            Build a custom template with your own exercises and save it for future workouts
          </p>
        </div>
      </div>

      {/* Show template info when loaded */}
      {loadedTemplate && (
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-blue-900 mb-2">{loadedTemplate.name}</h3>
            {loadedTemplate.description && (
              <p className="text-blue-800 mb-3">{loadedTemplate.description}</p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white/50 rounded-lg p-2">
                <div className="text-blue-600 font-semibold">Muscle Group</div>
                <div className="text-gray-800">{actualMuscleGroup}</div>
              </div>
              <div className="bg-white/50 rounded-lg p-2">
                <div className="text-blue-600 font-semibold">Sets × Reps</div>
                <div className="text-gray-800">{setRangeLabel}</div>
              </div>
              <div className="bg-white/50 rounded-lg p-2">
                <div className="text-blue-600 font-semibold">Exercises</div>
                <div className="text-gray-800">{Object.keys(exerciseData).length} loaded</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplateWorkflowSection;

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { parseWeightReps } from './parsing';
import { format } from 'date-fns';
import exerciseNames from './exerciseNames';
import { getExerciseById } from './config/exerciseConfig';

function DataChart({ currentData, monthlyWorkoutData, graphView, exerciseKey }) {
  const [comparisonMode, setComparisonMode] = useState('exact'); // 'exact' or 'category'
  // Handle both old and new data formats
  const currentInput = currentData.sets || currentData.input || [];
  // Get the full exercise name (convert ID to name if needed)
  const currentSelectionId = currentData.selection || currentData.exerciseName;
  const currentSelectionName = exerciseNames[currentSelectionId] || currentData.exerciseName || currentSelectionId;

  // Get the current exercise's category for category-based matching
  // Try to get the exercise by ID first (stored in 'selection' for presets)
  // Fall back to exerciseName for custom exercises
  const currentExerciseId = currentData.selection || currentData.exerciseName;
  const currentExercise = getExerciseById(currentExerciseId);
  // Use detected category for custom exercises, or category from preset
  const currentCategory = currentData.detectedCategory || currentExercise?.category;

  // Only allow category comparison for strength exercises (not cardio or abs)
  const isStrengthExercise = currentCategory && !['cardio', 'abs'].includes(currentCategory);

  // Helper to find data in historical logs
  const getMatch = (workout) => {
    // Handle both old (inputs) and new (exerciseData) field names
    const workoutExercises = workout?.exerciseData || workout?.inputs;
    if (!workoutExercises) return [];

    // Try to find by exercise key first (exact match)
    if (workoutExercises[exerciseKey]) {
      return workoutExercises[exerciseKey].sets || workoutExercises[exerciseKey].input || [];
    }

    // Find matching exercise based on comparison mode
    const matchedExercise = Object.values(workoutExercises).find((e) => {
      const exerciseName = e.exerciseName || e.selection;
      const fullName = exerciseNames[exerciseName] || exerciseName;

      if (comparisonMode === 'exact' || !isStrengthExercise) {
        // Exact match: same exercise name (always use exact for cardio/abs)
        return fullName?.toLowerCase().trim() === currentSelectionName?.toLowerCase().trim();
      } else {
        // Category match: same category (e.g., all shoulder press variations)
        const histExercise = getExerciseById(exerciseName);
        // Check both preset category and detected category
        const histCategory = e.detectedCategory || histExercise?.category;
        return histCategory === currentCategory && currentCategory !== undefined;
      }
    });

    if (matchedExercise) {
      return matchedExercise.sets || matchedExercise.input || [];
    }

    return [];
  };

  if (!currentInput.length) return null;

  const historyOnly = (monthlyWorkoutData || []).filter((w) => w.id !== currentData.id);
  const maxSets = Math.max(currentInput.length, ...historyOnly.map((w) => getMatch(w).length));

  // 1. Build Data Points
  const chartData = Array.from({ length: maxSets }).map((_, index) => {
    const point = { set: `Set ${index + 1}` };

    // Today
    point.current = parseWeightReps(currentInput[index])?.volume || null;

    // History
    historyOnly.forEach((workout, i) => {
      const vol = parseWeightReps(getMatch(workout)[index])?.volume;
      point[`hist_${i}`] = vol || null; // Simplified stable key
    });

    return point;
  });

  // 3. Generate the lines
  // 2. Build Lines
  const lines = [
    <Line
      key="cur"
      type="linear"
      dataKey="current"
      stroke="#4F46E5"
      strokeWidth={3}
      name="Current"
      connectNulls
    />,
  ];

  if (graphView === 'previous' && historyOnly.length > 0) {
    // Find the first workout that actually has this exercise
    const matchIndex = historyOnly.findIndex((w) => getMatch(w).length > 0);

    if (matchIndex >= 0) {
      const date = format(new Date(historyOnly[matchIndex].date.seconds * 1000), 'M/d/yy');
      lines.push(
        <Line
          key="prev"
          type="linear"
          dataKey={`hist_${matchIndex}`}
          stroke="#F43F5E"
          strokeDasharray="5 5"
          name={`Previous: ${date}`}
          connectNulls
        />,
      );
    }
  } else if (graphView === 'monthly') {
    const colors = ['#F43F5E', '#F59E0B', '#10B981', '#3B82F6'];

    // Filter to only workouts that have this exercise, then take first 4
    const workoutsWithExercise = historyOnly
      .map((workout, originalIndex) => ({ workout, originalIndex }))
      .filter(({ workout }) => getMatch(workout).length > 0)
      .slice(0, 4);

    workoutsWithExercise.forEach(({ workout, originalIndex }, displayIndex) => {
      const date = format(new Date(workout.date.seconds * 1000), 'M/d/yy');
      lines.push(
        <Line
          key={workout.id}
          type="linear"
          dataKey={`hist_${originalIndex}`}
          stroke={colors[displayIndex % colors.length]}
          strokeDasharray="5 5"
          name={date}
          connectNulls
        />,
      );
    });
  }

  return (
    <div className="p-3 border border-gray-300 bg-sky-50 rounded-2xl shadow-lg w-full">
      {/* Toggle button for comparison mode - only for strength exercises */}
      {isStrengthExercise && (
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-gray-600">
            {comparisonMode === 'exact'
              ? `Showing: ${currentSelectionName}`
              : `Showing: All ${currentCategory} exercises`}
          </div>
          <button
            onClick={() => setComparisonMode(comparisonMode === 'exact' ? 'category' : 'exact')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
              comparisonMode === 'exact'
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            title={comparisonMode === 'exact' ? 'Switch to category comparison' : 'Switch to exact match'}
          >
            {comparisonMode === 'exact' ? '📊 Exact Match' : '📈 Similar Exercises'}
          </button>
        </div>
      )}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="set" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip itemSorter={() => -1} />
          <Legend />
          {lines}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DataChart;

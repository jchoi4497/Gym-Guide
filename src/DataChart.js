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

function DataChart({ currentData, monthlyWorkoutData, graphView, exerciseKey }) {
  const currentInput = currentData.input || [];
  const currentSelectionName = currentData.selection;

  // Helper to find data in historical logs
  const getMatch = (workout) => {
    if (!workout || !workout.inputs) return [];
    if (workout.inputs[exerciseKey]) return workout.inputs[exerciseKey].input || [];
    return (
      Object.values(workout.inputs).find(
        (e) => e.selection?.toLowerCase().trim() === currentSelectionName?.toLowerCase().trim(),
      )?.input || []
    );
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

  if (graphView === 'previous' && historyOnly[0]) {
    const date = format(new Date(historyOnly[0].date.seconds * 1000), 'M/d/yy');
    lines.push(
      <Line
        key="prev"
        type="linear"
        dataKey="hist_0"
        stroke="#F43F5E"
        strokeDasharray="5 5"
        name={`Previous: ${date}`}
        connectNulls
      />,
    );
  } else if (graphView === 'monthly') {
    const colors = ['#F43F5E', '#F59E0B', '#10B981', '#3B82F6'];
    historyOnly.slice(0, 4).forEach((workout, i) => {
      const date = format(new Date(workout.date.seconds * 1000), 'M/d/yy');
      lines.push(
        <Line
          key={workout.id}
          type="linear"
          dataKey={`hist_${i}`}
          stroke={colors[i % colors.length]}
          strokeDasharray="5 5"
          name={date}
          connectNulls
        />,
      );
    });
  }

  return (
    <div className="p-3 border border-gray-300 bg-sky-50 rounded-2xl shadow-lg w-full">
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

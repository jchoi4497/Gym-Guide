import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, graphView } from 'recharts';
import { parseWeightReps } from './parsing';

function DataChart({ currentData, previousData }) {
  if (!currentData || !currentData.input || currentData.input.length === 0) {
    return <div className="text-gray-600">No data to chart for this exercise.</div>;
  }

  let chartData = []

  if (graphView === 'previous'){
    // Build chart data based on set count (use the longer of the two if needed)
    const setCount = Math.max(
      currentData.input.length,
      previousData?.input?.length || 0
    );

    const chartData = Array.from({ length: setCount }).map((_, index) => {
      const currentParsed = parseWeightReps(currentData.input[index]);
      const previousParsed = parseWeightReps(previousData?.input?.[index]);

      return {
        set: `Set ${index + 1}`,
        current: currentParsed ? currentParsed.volume : 0,
        previous: previousParsed ? previousParsed.volume : 0,
      };
    });
  }
  
  return (
    <div className="p-3 border border-gray-300 bg-white rounded-2xl shadow-lg w-full max-w-xs sm:max-w-sm">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="set" />
          <YAxis
            label={{
              value: 'Volume',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#374151' } // optional styling
            }} />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="current"
            stroke="#4F46E5"
            strokeWidth={2}
            name="This Workout"
          />
          {previousData && (
            <Line
              type="monotone"
              dataKey="previous"
              stroke="#F43F5E"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Previous Workout"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataChart;
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

function DataChart({ exerciseKey, currentData, previousData }) {
  if (!currentData || !currentData.input || currentData.input.length === 0) {
    return <div className="text-gray-600">No data to chart for this exercise.</div>;
  }

  // Build chart data based on set count (use the longer of the two if needed)
  const setCount = Math.max(
    currentData.input.length,
    previousData?.input?.length || 0
  );

  const chartData = Array.from({ length: setCount }).map((_, index) => ({
    set: `Set ${index + 1}`,
    current: Number(currentData.input[index]) || 0,
    previous: Number(previousData?.input?.[index]) || null,
  }));

  return (
    <div className="p-3 bg-white rounded-2xl shadow-lg w-full max-w-xs sm:max-w-sm">
      <h3 className="text-lg font-semibold mb-2">{exerciseKey}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="set" />
          <YAxis />
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
}

export default DataChart;
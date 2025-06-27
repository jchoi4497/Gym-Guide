import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

function DataChart({ exerciseKey, data }) {
  if (!data || !data.input || data.input.length === 0) {
    return <div className="text-gray-600">No data to chart for this exercise.</div>;
  }

  // Prepare chart data
  const chartData = data.input.map((weight, index) => ({
    set: `Set ${index + 1}`,
    weight: Number(weight),
  }));

  return (
    <div className="mb-8 p-4 bg-white rounded-2xl shadow-lg">
      <h3 className="text-2xl font-bold mb-4">{exerciseKey}</h3>
      <LineChart
        width={350}
        height={250}
        data={chartData}
        margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="set" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="weight" stroke="#8884d8" strokeWidth={3} />
      </LineChart>
    </div>
  );
}

export default DataChart;
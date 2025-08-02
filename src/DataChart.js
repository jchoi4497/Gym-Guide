import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { parseWeightReps } from './parsing';

function DataChart({ currentData, previousData, monthlyWorkoutData, graphView }) {
  if (!currentData || !currentData.input || currentData.input.length === 0) {
    return <div className="text-gray-600">No data to chart for this exercise.</div>;
  }

  let chartData = [];

  if (graphView === 'previous') {
    // Build chart data based on set count (use the longer of the two if needed)
    const setCount = Math.max(
      currentData.input.length,
      previousData?.input?.length || 0
    );

    chartData = Array.from({ length: setCount }).map((_, index) => {
      const currentParsed = parseWeightReps(currentData.input[index]);
      const previousParsed = parseWeightReps(previousData?.input?.[index]);

      return {
        // returns set on graph
        set: `Set ${index + 1}`,
        // shows parsed value if successful or 0. volume = weight x reps
        current: currentParsed ? currentParsed.volume : 0,
        previous: previousParsed ? previousParsed.volume : 0,
      };
    });
  } else if (graphView === 'monthly') {
    // finds max count for data set
    const setCount = Math.max(
      currentData.input.length,
      ...monthlyWorkoutData.map(workout => (workout.input?.length || 0))
    );

    chartData = Array.from({ length: setCount }).map((_, index) => {
      // creating objects
      const point = { set: `Set ${index + 1}` };

      // for the current line on graph
      const currentParsed = parseWeightReps(currentData.input[index]);
      // makes current line named 'Current'
      point['Current'] = currentParsed ? currentParsed.volume : 0;
      // creating the rest of the lines by date, go through array of workouts and apply helper function
      monthlyWorkoutData.forEach((workout, i) => {
        const parsed = parseWeightReps(workout.input?.[index]);
        // the label of the line would be the date of workout or how many weeks ago if date not found
        const label = workout.date ? workoutdate : `Week ${i + 1}`;
        //naming the point object the label
        point[label] = parsed ? parsed.volume : 0;
      });

      return point;
    });
  }

  // lines built dynamically depending on which user chooses weekly/monthly, push the component based off conditional
  const lines = [];

  if (graphView === 'previous') {
    lines.push(
      <Line
        key="current"
        type="monotone"
        dataKey="current"
        stroke="#4F46E5"
        strokeWidth={2}
        name="This Workout"
      />
    );

    if (previousData) {
      lines.push(
        <Line
          key="previous"
          type="monotone"
          dataKey="previous"
          stroke="#F43F5E"
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Previous Workout"
        />
      );
    }
  } else if (graphView === 'monthly') {
    // Current workout line
    lines.push(
      <Line
        key="Current"
        type="monotone"
        dataKey="Current"
        stroke="#4F46E5"
        strokeWidth={2}
        name="Current Workout"
      />
    );

    // Monthly workouts lines
    monthlyWorkoutData.forEach((workout, i) => {
      const label = workout.date ? workout.date : `Week ${i + 1}`;
      const colors = ['#F43F5E', '#F59E0B', '#10B981', '#3B82F6']; // different stroke colors

      lines.push(
        <Line
          key={label}
          type="monotone"
          dataKey={label}
          stroke={colors[i % colors.length]}
          strokeWidth={2}
          strokeDasharray="5 5"
          name={label}
        />
      );
    });
  }

  return (
    <div className="p-3 border border-gray-300 bg-white rounded-2xl shadow-lg w-full max-w-xs sm:max-w-sm">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="set" />
          <YAxis
            label={{
              value: 'Volume',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#374151' }
            }}
          />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          {lines}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataChart;
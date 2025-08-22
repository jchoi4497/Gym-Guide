import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { parseWeightReps } from './parsing';
import { format } from 'date-fns';

function DataChart({ currentData, previousData, monthlyWorkoutData, graphView, exerciseKey }) {

  // workout inputs of current date --> eg. [160x12, 160x10, 160x11, 160x7] ... rest of workout
  const currentInput = currentData.input || [];
  console.log("01", currentData.input);
  const previousInput = previousData?.input || [];

  if (!currentInput.length) {
    return <div className="text-gray-600">No data to chart for this exercise.</div>;
  }

  let chartData = [];

  if (graphView === 'previous') {

    // setCount finds max point from dataset to set for X-Axis on graph.
    const setCount = Math.max(currentInput.length, previousInput.length,);

    // Creates array with length of setCount --> [undefined,undefined,undefined,undefined]
    chartData = Array.from({ length: setCount }).map((_, index) => {
      const currentParsed = parseWeightReps(currentInput[index]);
      const previousParsed = parseWeightReps(previousInput[index]);

      return {
        // returns set on graph
        set: `Set ${index + 1}`,
        // shows parsed value... eg. 160x10 --> {weight: 160, reps: 10, volume: 1600} if successful or 0. volume = weight x reps
        current: currentParsed ? currentParsed.volume : 0,
        previous: previousParsed ? previousParsed.volume : 0,
      };
    });
  } else if (graphView === 'monthly') {
    // finds max count for data set
    const setCount = Math.max(
      currentInput.length,
      ...monthlyWorkoutData.map(workout => (workout.inputs?.[exerciseKey]?.input?.length || 0))
    );


    chartData = Array.from({ length: setCount }).map((_, index) => {
      // creating objects
      const point = { set: `Set ${index + 1}` };

      // for the current line on graph
      const currentParsed = parseWeightReps(currentInput[index]);
      // makes current line named 'Current'
      point['Current'] = currentParsed?.volume || 0;
      // creating the rest of the lines by date, go through array of workouts and apply helper function
      monthlyWorkoutData.forEach((workout, i) => {
        const label = workout.date
          ? format(new Date(workout.date.seconds * 1000), 'yyyy-MM-dd')
          : `Week ${i + 1}`;
        //naming the point object the label

        const workoutInput = workout.inputs?.[exerciseKey]?.input || [];
        const parsed = parseWeightReps(workoutInput[index]);
        point[label] = parsed?.volume || 0;
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
      const label = workout.date
        ? format(new Date(workout.date.seconds * 1000), 'yyyy-MM-dd')
        : `Week ${i + 1}`;
      const colors = ['#F43F5E', '#F59E0B', '#10B981', '#3B82F6']; // different stroke colors

      lines.push(
        <Line
          key={workout.id}
          type="monotone"
          dataKey={label}
          stroke={colors[i % colors.length]}
          strokeWidth={2}
          strokeDasharray="5 5"
          name={label}
        />
      );
    });
    // console.log("chartData:", chartData);
  }

  return (
    <div className="p-3 border border-gray-300 bg-sky-50 rounded-2xl shadow-lg w-full max-w-xs sm:max-w-sm">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="set"
            interval={0}              // show all labels, no skipping
            tick={{ fontSize: 10 }}   // smaller font for ticks
            angle={-45}               // tilt labels to avoid overlap
            textAnchor="end"          // align tilted text properly
            height={60}               // add height so labels don't cut off
          />
          <YAxis
            label={{
              value: 'Volume',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#374151' }
            }}
          />
          <Tooltip />
          <Legend verticalAlign="bottom" height={40} />
          {lines}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataChart;
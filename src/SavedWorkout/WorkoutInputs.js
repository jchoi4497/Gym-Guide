import exerciseNames from '../exerciseNames';
import DataChart from '../DataChart';

function WorkoutInputs({ order, isEditing, editedInputs, workoutData, setEditedInputs, previousWorkoutData, graphView }) {
  return (
    <div className="mb-8">
      {order.map((key) => {
        const data = isEditing ? editedInputs[key] : workoutData.inputs[key];
        const prevData = previousWorkoutData?.inputs[key];
        if (!data) return null;

        if (graphView === 'previous') {
          // placeholder logic for now

        } else if (graphView === 'weekly') {
          //mweekly logic

        } else if(graphView === 'monthly'){
          //monthky logic
        }




        return (
          <div key={key} className="mb-8 p-4 bg-white rounded-2xl shadow-lg">
            <div className="text-2xl font-bold mb-2">
              {exerciseNames[data.selection] || data.selection}
            </div>

            <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 sm:space-y-0">

              <div className="flex-1 flex flex-wrap gap-3">
                {data.input.map((weight, idx) => (
                  <div key={idx}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedInputs[key]?.input[idx] || ''}
                        onChange={(e) => {
                          const newInputs = { ...editedInputs };
                          newInputs[key].input[idx] = e.target.value;
                          setEditedInputs(newInputs);
                        }}
                        className="p-4 rounded bg-gradient-to-r from-blue-50 to-blue-100 text-xl border min-w-[60px] text-center"
                      />
                    ) : (
                      <div className="p-4 rounded bg-gradient-to-r from-blue-50 to-blue-100 text-xl min-w-[60px] text-center">
                        {weight || '-'}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="flex-1">
                <DataChart
                  exerciseKey={exerciseNames[data.selection] || data.selection}
                  currentData={data}
                  previousData={prevData}
                  graphView={graphView}
                />
              </div>

            </div>
          </div>
        );
      })}
    </div >
  );
}

export default WorkoutInputs;

import exerciseNames from '../exerciseNames';
import DataChart from '../DataChart';

function WorkoutInputs({
  order,
  isEditing,
  editedInputs,
  workoutData,
  setEditedInputs,
  previousWorkoutData,
  monthlyWorkoutData,
  graphView,
  onRemove,
  onAdd,
}) {
  return (
    <div className="mb-8">
      {order.map((key) => {
        const data = isEditing ? editedInputs[key] : workoutData.inputs[key];
        const prevData = previousWorkoutData?.inputs[key];
        if (!data) return null;

        return (
          <div key={key} className="mb-8 p-4 bg-sky-50 rounded-2xl shadow-lg relative">
            {/* 1. DELETE BUTTON: Only shows when editing */}
            {isEditing && (
              <button
                onClick={() => onRemove(key)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 z-20 cursor-pointer"
              >
                ✕
              </button>
            )}

            <div className="text-2xl font-bold mb-2 flex items-center gap-4">
              {/* 2. EXERCISE NAME: If it's a new custom exercise or we are editing, allow name change */}
              {isEditing ? (
                <input
                  type="text"
                  placeholder="Exercise Name"
                  value={exerciseNames[data.selection] || data.selection}
                  onChange={(e) => {
                    const newInputs = { ...editedInputs };
                    newInputs[key].selection = e.target.value;
                    setEditedInputs(newInputs);
                  }}
                  className="bg-transparent border-b-2 border-sky-200 focus:border-sky-500 outline-none px-1"
                />
              ) : (
                exerciseNames[data.selection] || data.selection
              )}
            </div>

            <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 sm:space-y-0">
              <div className="flex-1 flex flex-wrap gap-3">
                {data.input?.map((weight, idx) => (
                  <div key={idx}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedInputs[key]?.input?.[idx] || ''}
                        onChange={(e) => {
                          const newInputs = { ...editedInputs };
                          if (!newInputs[key].input) newInputs[key].input = [];
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
                  exerciseKey={key}
                  currentData={data}
                  previousData={prevData}
                  monthlyWorkoutData={monthlyWorkoutData}
                  graphView={graphView}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default WorkoutInputs;

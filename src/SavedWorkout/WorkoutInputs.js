import exerciseNames from '../exerciseNames';

function WorkoutInputs({ order, isEditing, editedInputs, workoutData, setEditedInputs }) {
  return (
    <div className="mb-8">
      {order.map((key) => {
        const data = isEditing ? editedInputs[key] : workoutData.inputs[key];
        if (!data) return null;

        return (
          <div key={key} className="mb-8 p-4 bg-white rounded-2xl shadow-lg">
            <div className="text-2xl font-bold mb-2">
              {exerciseNames[data.selection] || data.selection}
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
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
          </div>
        );
      })}
    </div>
  );
}

export default WorkoutInputs;

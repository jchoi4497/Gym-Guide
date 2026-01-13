import DropDown from './DropDown';

function TableRow({
  reps,
  onChange,
  options,
  value,
  rowId,
  cellInput,
  inputs,
  isCustom,
  onRemove,
}) {
  const recordInputCells = () => {
    const cellElements = [];
    for (let i = 0; i < Number(reps); i++) {
      cellElements.push(
        <input
          key={i + rowId}
          id={`${rowId}-cell-${i}`}
          className="
                        px-3 py-2 w-full rounded-md
                        bg-gradient-to-r from-blue-50 to-blue-100
                        focus:outline-none focus:ring-2 focus:ring-blue-400
                        transition-colors duration-300
                        placeholder-gray-400 text-gray-900
                        mb-2 sm:mb-0
                    "
          type="text"
          placeholder="Weight x Reps"
          value={(inputs && inputs[i]) || ''}
          onChange={(e) => cellInput(i, e.target.value)}
        />,
      );
    }
    return cellElements;
  };

  return (
    <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 border border-gray-300 rounded-md p-4 bg-sky-50 shadow-sm mb-4">
      {/* REMOVE BUTTON: Positioned in top-right corner */}
      {isCustom && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 z-10"
          title="Remove Exercise"
        >
          <span className="text-xs font-bold">✕</span>
        </button>
      )}
      {/* Conditional Rendering: Dropdown vs Text Input */}
      <div className="w-full sm:w-1/3">
        {isCustom ? (
          <input
            type="text"
            placeholder="Enter exercise name..."
            className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 outline-none transition-all"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <DropDown options={options} onChange={onChange} value={value} />
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:gap-2 w-full">{recordInputCells()}</div>
    </div>
  );
}

export default TableRow;

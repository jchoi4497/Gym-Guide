function CalendarHeader({ currentDate, onPreviousMonth, onNextMonth, onToday }) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="flex items-center justify-between mb-6 gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPreviousMonth();
        }}
        className="px-2 py-1 sm:px-4 sm:py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm sm:text-base font-semibold transition-colors"
      >
        ←
      </button>

      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 text-center">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToday();
          }}
          className="px-2 py-1 sm:px-3 sm:py-1 bg-blue-100 hover:bg-blue-200 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
        >
          Today
        </button>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNextMonth();
        }}
        className="px-2 py-1 sm:px-4 sm:py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm sm:text-base font-semibold transition-colors"
      >
        →
      </button>
    </div>
  );
}

export default CalendarHeader;

import DayCell from './DayCell';

function CalendarGrid({ calendarDays, schedule, selectedDate, onDateClick, formatDateKey, templates, onAddWorkout }) {
  const getWorkoutsForDate = (date) => {
    if (!date) return [];
    const dateKey = formatDateKey(date);
    return schedule[dateKey] || [];
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date && formatDateKey(selectedDate) === formatDateKey(date);
  };

  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-center font-bold text-gray-600 py-2 text-xs sm:text-base">
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {calendarDays.map((date, index) => {
        const dayOfWeek = index % 7; // 0 = Sunday, 6 = Saturday
        const weekRow = Math.floor(index / 7); // Which row (0-5)
        return (
          <DayCell
            key={index}
            date={date}
            workouts={getWorkoutsForDate(date)}
            isToday={isToday(date)}
            isSelected={isSelected(date)}
            onClick={() => date && onDateClick(date)}
            dayOfWeek={dayOfWeek}
            weekRow={weekRow}
            templates={templates}
            onAddWorkout={onAddWorkout}
          />
        );
      })}
    </div>
  );
}

export default CalendarGrid;

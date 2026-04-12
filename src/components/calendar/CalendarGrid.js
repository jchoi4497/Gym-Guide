import DayCell from './DayCell';

function CalendarGrid({ calendarDays, schedule, selectedDate, onDateClick, formatDateKey, templates, onAddWorkout, onDeleteWorkout }) {
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
      {calendarDays.map((date, index) => (
        <DayCell
          key={index}
          date={date}
          workouts={getWorkoutsForDate(date)}
          isToday={isToday(date)}
          isSelected={isSelected(date)}
          onClick={() => date && onDateClick(date)}
          templates={templates}
          onAddWorkout={onAddWorkout}
          onDeleteWorkout={onDeleteWorkout}
        />
      ))}
    </div>
  );
}

export default CalendarGrid;

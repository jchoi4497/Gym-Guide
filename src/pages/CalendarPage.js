import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import db from '../config/firebase';
import Navbar from '../components/Navbar';

function CalendarPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user's schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user) return;

      try {
        const scheduleDoc = await getDoc(doc(db, 'workoutSchedule', user.uid));
        if (scheduleDoc.exists()) {
          setSchedule(scheduleDoc.data().schedule || {});
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      }
    };

    if (user) {
      fetchSchedule();
    }
  }, [user]);

  // Get calendar data for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDateKey = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  if (authLoading) {
    return (
      <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen pb-20 font-serif">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-20 text-center">
          <p className="text-xl text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen pb-20 font-serif">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 pt-14 pb-20">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h1 className="text-4xl font-extrabold mb-4 text-gray-800">Sign In Required</h1>
            <p className="text-xl text-gray-700 mb-8">
              Please sign in to view and manage your workout schedule.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const calendarDays = getCalendarDays();
  const todayWorkouts = getWorkoutsForDate(new Date());

  return (
    <div className="bg-gradient-to-br from-sky-300 to-stone-300 min-h-screen pb-20 font-serif">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-14 pb-16 sm:pb-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4 text-gray-800">
          Workout Calendar
        </h1>
        <p className="text-base sm:text-lg text-gray-700 italic mb-8 sm:mb-10">
          Plan and schedule your workouts
        </p>

        {/* Calendar Header */}
        <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-6 gap-2">
            <button
              onClick={handlePreviousMonth}
              className="px-2 py-1 sm:px-4 sm:py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm sm:text-base font-semibold transition-colors"
            >
              ←
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={handleToday}
                className="px-2 py-1 sm:px-3 sm:py-1 bg-green-100 hover:bg-green-200 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Today
              </button>
            </div>

            <button
              onClick={handleNextMonth}
              className="px-2 py-1 sm:px-4 sm:py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm sm:text-base font-semibold transition-colors"
            >
              →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-bold text-gray-600 py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              const workouts = getWorkoutsForDate(date);
              const isCurrentDay = isToday(date);
              const isSelected = selectedDate && date && formatDateKey(selectedDate) === formatDateKey(date);

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    min-h-20 p-2 rounded-lg cursor-pointer transition-all
                    ${!date ? 'bg-transparent cursor-default' : 'bg-gray-50 hover:bg-blue-50'}
                    ${isCurrentDay ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                    ${isSelected ? 'ring-2 ring-green-500 bg-green-50' : ''}
                  `}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-semibold mb-1 ${isCurrentDay ? 'text-blue-600' : 'text-gray-700'}`}>
                        {date.getDate()}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {workouts.map((workout, idx) => (
                          <div
                            key={idx}
                            className="w-2 h-2 rounded-full bg-blue-500"
                            title={workout.muscleGroup}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Workouts */}
        {todayWorkouts.length > 0 && (
          <div className="bg-sky-50 rounded-3xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Scheduled Workouts</h2>
            <div className="space-y-3">
              {todayWorkouts.map((workout, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {workout.muscleGroup || 'Workout'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {workout.customSetCount || workout.numberOfSets}x{workout.customRepCount || '8-12'}
                      </p>
                      {workout.label && (
                        <p className="text-sm text-gray-500 italic">{workout.label}</p>
                      )}
                    </div>
                    <button
                      onClick={() => navigate('/Create', { state: { scheduledWorkout: workout } })}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>

            {getWorkoutsForDate(selectedDate).length > 0 ? (
              <div className="space-y-3 mb-4">
                {getWorkoutsForDate(selectedDate).map((workout, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded-xl p-4"
                  >
                    <h3 className="font-bold text-lg text-gray-800">
                      {workout.muscleGroup || 'Workout'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {workout.customSetCount || workout.numberOfSets}x{workout.customRepCount || '8-12'}
                    </p>
                    {workout.label && (
                      <p className="text-sm text-gray-500 italic">{workout.label}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic mb-4">No workouts scheduled for this day</p>
            )}

            <button
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              + Add Workout to This Day
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarPage;

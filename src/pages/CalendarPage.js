import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import db from '../config/firebase';
import Navbar from '../components/Navbar';
import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarGrid from '../components/calendar/CalendarGrid';
import TodaysWorkouts from '../components/calendar/TodaysWorkouts';

function CalendarPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const calendarRef = useRef();

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

  // Fetch user's templates
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!user) return;

      try {
        const templateDoc = await getDoc(doc(db, 'userTemplates', user.uid));
        if (templateDoc.exists()) {
          const templatesArray = templateDoc.data().templates || [];
          setTemplates(templatesArray);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    if (user) {
      fetchTemplates();
    }
  }, [user]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setSelectedDate(null);
      }
    };

    if (selectedDate) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedDate]);

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
      // Toggle: if same date clicked, deselect
      if (selectedDate && formatDateKey(selectedDate) === formatDateKey(date)) {
        setSelectedDate(null);
      } else {
        setSelectedDate(date);
      }
    }
  };

  const handleAddWorkout = async (date, workoutData) => {
    if (!user) return;

    const dateKey = formatDateKey(date);
    const newSchedule = { ...schedule };

    if (!newSchedule[dateKey]) {
      newSchedule[dateKey] = [];
    }

    // Check if this is an update (has an ID) or a new workout
    if (workoutData.id) {
      // Update existing workout
      const index = newSchedule[dateKey].findIndex(w => w.id === workoutData.id);
      if (index !== -1) {
        newSchedule[dateKey][index] = workoutData;
      } else {
        // ID not found, treat as new
        newSchedule[dateKey].push(workoutData);
      }
    } else {
      // Add new workout with generated ID
      newSchedule[dateKey].push({
        id: `schedule-${Date.now()}`,
        ...workoutData
      });
    }

    try {
      await setDoc(doc(db, 'workoutSchedule', user.uid), {
        schedule: newSchedule
      });
      setSchedule(newSchedule);
      console.log(workoutData.id ? 'Workout updated in schedule' : 'Workout added to schedule');
    } catch (error) {
      console.error('Error saving workout to schedule:', error);
      alert('Failed to save workout. Please try again.');
    }
  };

  const handleDeleteWorkout = async (date, workoutId) => {
    if (!user) return;

    const dateKey = formatDateKey(date);
    const newSchedule = { ...schedule };

    if (!newSchedule[dateKey]) return;

    // Remove the workout with the matching id
    newSchedule[dateKey] = newSchedule[dateKey].filter(w => w.id !== workoutId);

    // If no workouts left for this date, remove the date key
    if (newSchedule[dateKey].length === 0) {
      delete newSchedule[dateKey];
    }

    try {
      await setDoc(doc(db, 'workoutSchedule', user.uid), {
        schedule: newSchedule
      });
      setSchedule(newSchedule);
      console.log('Workout deleted from schedule');
    } catch (error) {
      console.error('Error deleting workout from schedule:', error);
      alert('Failed to delete workout. Please try again.');
    }
  };

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

        {/* Calendar */}
        <div
          ref={calendarRef}
          className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 mb-6"
          onClick={() => setSelectedDate(null)}
        >
          <CalendarHeader
            currentDate={currentDate}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
          />
          <CalendarGrid
            calendarDays={calendarDays}
            schedule={schedule}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
            formatDateKey={formatDateKey}
            templates={templates}
            onAddWorkout={handleAddWorkout}
            onDeleteWorkout={handleDeleteWorkout}
          />
        </div>

        {/* Today's Workouts */}
        <TodaysWorkouts workouts={todayWorkouts} onDeleteWorkout={(workoutId) => handleDeleteWorkout(new Date(), workoutId)} />
      </div>
    </div>
  );
}

export default CalendarPage;

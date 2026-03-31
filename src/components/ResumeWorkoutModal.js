import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { workoutSession } from '../services/storageService';

function ResumeWorkoutModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [workoutSession, setWorkoutSession] = useState(null);

  useEffect(() => {
    // Don't show modal if already on StartWorkoutPage
    if (location.pathname === '/start-workout') {
      return;
    }

    // Check for active workout session (using storageService)
    const session = workoutSession.get();
    if (session) {
      setWorkoutSession(session);
      setShowModal(true);
    }
  }, [location.pathname]);

  const handleResume = () => {
    setShowModal(false);
    navigate('/start-workout');
  };

  const handleDiscard = () => {
    workoutSession.clear();
    setShowModal(false);
    setWorkoutSession(null);
  };

  if (!showModal || !workoutSession) {
    return null;
  }

  // Calculate workout progress
  const totalSets = workoutSession.exercises?.reduce((sum, ex) => sum + ex.totalSets, 0) || 0;
  const completedSets = workoutSession.exercises?.reduce((sum, ex) => sum + ex.completedSets.length, 0) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Resume Workout?
          </h2>
          <p className="text-gray-600">
            You have a workout in progress
          </p>
        </div>

        {/* Workout Info */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">
            {workoutSession.workoutName}
          </h3>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress:</span>
            <span className="font-semibold">
              {completedSets}/{totalSets} sets
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleResume}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold transition-colors shadow-lg"
          >
            ▶️ Resume Workout
          </button>
          <button
            onClick={handleDiscard}
            className="w-full py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumeWorkoutModal;

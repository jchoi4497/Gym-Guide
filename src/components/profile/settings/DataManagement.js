import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import db from '../../../config/firebase';
import { FIREBASE_FIELDS, MUSCLE_GROUP_OPTIONS } from '../../../config/constants';
import { getExerciseName } from '../../../config/exerciseConfig';
import ConfirmDeleteModal from './ConfirmDeleteModal';

function DataManagement({ user }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workoutCount, setWorkoutCount] = useState(0);

  // Fetch workout count
  useEffect(() => {
    const fetchWorkoutCount = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'workoutLogs'),
          where(FIREBASE_FIELDS.USER_ID, '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        setWorkoutCount(querySnapshot.docs.length);
      } catch (error) {
        console.error('Error fetching workout count:', error);
      }
    };

    fetchWorkoutCount();
  }, [user]);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);

      // Helper to get muscle group label
      const getMuscleGroupLabel = (value) =>
        MUSCLE_GROUP_OPTIONS.find((option) => option.value === value)?.label || value;

      // Fetch all user workouts
      const q = query(
        collection(db, 'workoutLogs'),
        where(FIREBASE_FIELDS.USER_ID, '==', user.uid)
      );

      const querySnapshot = await getDocs(q);

      // Flatten workouts into rows (one row per exercise)
      const rows = [];
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const date = data.date?.toDate ? data.date.toDate() : new Date(data.date?.seconds * 1000);
        const dateStr = date.toLocaleDateString('en-US');
        const muscleGroupRaw = data.muscleGroup || data.target || '';
        const muscleGroup = getMuscleGroupLabel(muscleGroupRaw);
        const exerciseData = data.exerciseData || data.inputs || {};

        // Create a row for each exercise in the workout
        Object.entries(exerciseData).forEach(([key, exercise]) => {
          const rawExerciseName = exercise.exerciseName || exercise.selection || key;
          // Convert exercise ID to full name
          const exerciseName = getExerciseName(rawExerciseName);
          const sets = exercise.sets || exercise.input || [];

          // Helper to extract weight and reps from a set
          const getSetData = (set) => {
            if (!set) return { weight: '', reps: '' };
            if (typeof set === 'object') {
              return {
                weight: set.weight || '',
                reps: set.reps || ''
              };
            }
            // If it's a string, try to parse it
            return { weight: '', reps: set };
          };

          const set1Data = getSetData(sets[0]);
          const set2Data = getSetData(sets[1]);
          const set3Data = getSetData(sets[2]);
          const set4Data = getSetData(sets[3]);
          const set5Data = getSetData(sets[4]);

          rows.push({
            date: dateStr,
            muscleGroup: muscleGroup,
            exercise: exerciseName,
            set1Weight: set1Data.weight,
            set1Reps: set1Data.reps,
            set2Weight: set2Data.weight,
            set2Reps: set2Data.reps,
            set3Weight: set3Data.weight,
            set3Reps: set3Data.reps,
            set4Weight: set4Data.weight,
            set4Reps: set4Data.reps,
            set5Weight: set5Data.weight,
            set5Reps: set5Data.reps,
            note: data.note || '',
          });
        });
      });

      // Sort by date
      rows.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Create CSV content with separate weight/reps columns for easier analysis
      const headers = [
        'Date',
        'Muscle Group',
        'Exercise',
        'Set 1 Weight',
        'Set 1 Reps',
        'Set 2 Weight',
        'Set 2 Reps',
        'Set 3 Weight',
        'Set 3 Reps',
        'Set 4 Weight',
        'Set 4 Reps',
        'Set 5 Weight',
        'Set 5 Reps',
        'Workout Notes'
      ];
      const csvRows = [
        headers.join(','),
        ...rows.map(r => [
          r.date,
          `"${r.muscleGroup}"`,
          `"${r.exercise}"`,
          r.set1Weight || '',
          r.set1Reps || '',
          r.set2Weight || '',
          r.set2Reps || '',
          r.set3Weight || '',
          r.set3Reps || '',
          r.set4Weight || '',
          r.set4Reps || '',
          r.set5Weight || '',
          r.set5Reps || '',
          `"${(r.note || '').replace(/"/g, '""')}"` // Escape quotes
        ].join(','))
      ];
      const csvContent = csvRows.join('\n');

      // Create and download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gym-guide-workouts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('CSV exported! Upload to Google Sheets: drive.google.com → New → File Upload');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);

      // Fetch all user workouts
      const q = query(
        collection(db, 'workoutLogs'),
        where(FIREBASE_FIELDS.USER_ID, '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const workouts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to readable dates
        date: doc.data().date?.toDate ? doc.data().date.toDate().toISOString() : doc.data().date,
      }));

      // Create JSON blob
      const dataStr = JSON.stringify(workouts, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      // Create download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gym-guide-workouts-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsClearing(true);
      setShowDeleteModal(false);

      // Fetch all user workouts
      const q = query(
        collection(db, 'workoutLogs'),
        where(FIREBASE_FIELDS.USER_ID, '==', user.uid)
      );

      const querySnapshot = await getDocs(q);

      // Delete all workouts
      const deletePromises = querySnapshot.docs.map((workoutDoc) =>
        deleteDoc(doc(db, 'workoutLogs', workoutDoc.id))
      );

      await Promise.all(deletePromises);

      alert(`Successfully deleted ${querySnapshot.docs.length} workout(s).`);
      window.location.reload(); // Refresh to update stats
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Failed to clear data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Management</h2>
      <p className="text-sm text-gray-600 mb-6">
        Export your workout data (CSV opens in Excel/Sheets, JSON for technical backup) or clear your workout history.
      </p>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isExporting ? (
              'Exporting...'
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export as CSV
              </>
            )}
          </button>

          <button
            onClick={handleExportJSON}
            disabled={isExporting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isExporting ? (
              'Exporting...'
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export as JSON
              </>
            )}
          </button>

          <button
            onClick={handleOpenDeleteModal}
            disabled={isClearing || workoutCount === 0}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isClearing ? (
              'Clearing...'
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear All Workout History
              </>
            )}
          </button>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Warning:</strong> Clearing your workout history is permanent and cannot be undone.
            Export your data as a backup first. Use CSV for viewing in Excel/Sheets, or JSON for a complete technical backup.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        workoutCount={workoutCount}
      />
    </div>
  );
}

export default DataManagement;

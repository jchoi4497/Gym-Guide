import { useTheme } from '../contexts/ThemeContext';
import { useWorkout } from '../contexts/WorkoutContext';

function AddExerciseButton({ onClick }) {
  const { theme } = useTheme();

  // Try to get addCustomExercise from context, fallback to onClick prop
  let handleClick = onClick;
  try {
    const { addCustomExercise } = useWorkout();
    handleClick = addCustomExercise || onClick;
  } catch (e) {
    // Context not available, use onClick prop
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full py-4 mt-6 border-2 border-dashed ${theme.inputBorder} rounded-2xl ${theme.cardText} font-bold ${theme.cardBgSecondary} cursor-pointer transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2`}
    >
      <span className="text-xl">+</span>
      <span>Add New Exercise</span>
    </button>
  );
}

export default AddExerciseButton;

import { useTheme } from '../contexts/ThemeContext';

function AddExerciseButton({ onClick }) {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`w-full py-4 mt-6 border-2 border-dashed ${theme.inputBorder} rounded-2xl ${theme.cardText} font-bold ${theme.cardBgSecondary} cursor-pointer transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2`}
    >
      <span className="text-xl">+</span>
      <span>Add New Exercise</span>
    </button>
  );
}

export default AddExerciseButton;

function AddExerciseButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3
                 bg-emerald-500 hover:bg-emerald-600 text-white font-bold
                 rounded-xl shadow-md transition-all duration-200
                 active:scale-95 mb-10"
    >
      <span className="text-xl">+</span>
      <span>Add Custom Exercise</span>
    </button>
  );
}

export default AddExerciseButton;

function AddExerciseButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-4 mt-6 border-2 border-dashed border-sky-400 rounded-2xl text-sky-600 font-bold hover:bg-sky-100 cursor-pointer transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
    >
      <span className="text-xl">+</span>
      <span>Add New Exercise</span>
    </button>
  );
}

export default AddExerciseButton;

export default function WorkoutNotes({ value, onChange, isEditing }) {
  return (
    <div className="p-6 mb-8 bg-sky-50 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-semibold mb-3">How did you feel today?</h2>
      {isEditing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write notes about how you felt before/after, sleep, what you ate, how did your body feel, how did you feel mentally?..."
          rows="4"
          className="w-full p-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        />
      ) : (
        <p className="italic text-lg whitespace-pre-wrap">{value || 'No notes added.'}</p>
      )}
    </div>
  );
}

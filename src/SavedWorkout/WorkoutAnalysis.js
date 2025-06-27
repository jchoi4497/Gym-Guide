export default function WorkoutAnalysis({ summary }) {
  return (
    <div className="mb-8 p-4 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold mb-4">Analysis</h2>
      <p className="italic text-lg">{summary}</p>
    </div>
  );
}

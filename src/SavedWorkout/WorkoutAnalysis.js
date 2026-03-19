export default function WorkoutAnalysis({ summary }) {
  if (!summary) {
    return (
      <div className="mb-8 p-4 bg-sky-50 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-4">Analysis</h2>
        <p className="italic text-lg">No AI summary generated for this workout yet.</p>
      </div>
    );
  }

  // Split by lines and detect ALL CAPS headers to underline them
  const lines = summary.split('\n').map((line, index) => {
    const trimmed = line.trim();
    const isHeader = trimmed === trimmed.toUpperCase() && trimmed.length > 0;

    if (isHeader) {
      return <div key={index} className="font-bold text-xl underline decoration-2 mt-4 mb-2">{line}</div>;
    } else if (trimmed === '') {
      return <br key={index} />;
    } else {
      return <div key={index} className="mb-2">{line}</div>;
    }
  });

  return (
    <div className="mb-8 p-4 bg-sky-50 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold mb-4">Analysis</h2>
      <div className="italic text-lg">
        {lines}
      </div>
    </div>
  );
}

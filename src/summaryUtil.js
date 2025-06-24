// src/utils/summaryUtils.js
import exerciseNames from './exerciseNames';

export async function generateSummary(inputs, note) {
  const buildExerciseSummaryText = (inputs) => {
    return Object.entries(inputs)
      .map(([key, data]) => {
        const exerciseName = exerciseNames[data.selection] || data.selection;
        const sets = data.input.filter(set => set.trim() !== "").join(", ");
        return `${exerciseName}: ${sets || "no data"}`;
      })
      .join("; ");
  };

  try {
    const summaryText = buildExerciseSummaryText(inputs);

    const notesText = note.trim() === ''
      ? 'No additional user notes provided.'
      : `"${note}"`;

    const promptText = `
      The following is a workout log entry.

      **User Notes:** "${note}"

      **Workout Data Summary:** ${summaryText}

      Based on the workout data and the user’s notes about how they were feeling that day, provide a brief analysis of the session.

      - Highlight what went well and what could be improved based on the exercise performance.
      - Reflect on how their reported mood or condition may have affected the workout.
      - Offer one or two actionable suggestions for their next session.
      - Conclude with a motivational sentence to keep them encouraged.

      Summarize everything in 2–3 varied, conversational sentences.
      For newer saved workouts, slightly change the phrasing style to keep things fresh,
      but for previously analyzed workouts, keep their original summary consistent.`;

    const response = await fetch("/.netlify/functions/createSummary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptText }),
    });

    const data = await response.json();
    return data.message || '';
  } catch (error) {
    console.error("OpenAI Error:", error);
    return '';
  }
}

// src/utils/summaryUtils.js
import exerciseNames from './exerciseNames';
import { parseWeightReps } from './parsing';

export async function generateSummary(inputs, note, previousInputs) {
  const buildExerciseSummaryText = (inputs) => {
    return Object.entries(inputs)
      .map(([key, data]) => {
        const exerciseName = exerciseNames[data.selection] || data.selection;
        const sets = data.input
          .filter(set => set.trim() !== "")
          .map(set => {
            const parsed = parseWeightReps(set);
            if (parsed) {
              return `${parsed.weight}x${parsed.reps} (${parsed.volume} vol)`;
            }
            return set; // fallback if parsing fails
          })
          .join(", ");
        return `${exerciseName}: ${sets || "no data"}`;
      })
      .join("; ");
  };

  try {
    const summaryText = buildExerciseSummaryText(inputs);

    const previousSummaryText = previousInputs
      ? buildExerciseSummaryText(previousInputs)
      : null;

    console.log("Previous Inputs:", previousInputs);
    console.log("Parsed Previous Summary:", previousSummaryText);

    const notesText = note.trim() === ''
      ? 'No additional user notes provided.'
      : `"${note}"`;


    const promptText = `

      You are a helpful fitness AI trainer.

      Given the following workout log and notes, provide a brief analysis of performance, possible improvement areas, and trends.

      The following is a workout log entry.

      User Notes: ${notesText}

      Previous Inputs/Notes: ${previousSummaryText}

      Workout Data Summary: ${summaryText}

      Based on the workout data and the user’s notes about how they were feeling that day, provide a brief analysis of the session.

      - Highlight what went well and what could be improved based on the exercise performance.
      - Compare the previous workout and current workout and analyze that based of the given data above.
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

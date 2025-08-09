// src/utils/summaryUtils.js
import exerciseNames from './exerciseNames';
import { parseWeightReps } from './parsing';

export async function generateSummary(inputs, note, previousInputs, monthlyWorkoutData = []) {
  console.log("generateSummary called");

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

  const monthlySummaryText = (workouts) => {
    return workouts.map((workout) => {
      const dateLabel = workout.date
        ? new Date(workout.date.seconds * 1000).toLocaleDateString()
        : "Unknown Date";
      return `${dateLabel} - ${buildExerciseSummaryText(workout.inputs || {})}`;
    })
      .join('/n');
  };

  try {
    const summaryText = buildExerciseSummaryText(inputs);

    const previousSummaryText = previousInputs && Object.keys(previousInputs).length > 0
      ? buildExerciseSummaryText(previousInputs)
      : null;

    console.log("Previous Inputs:", previousInputs);
    console.log("Parsed Previous Summary:", previousSummaryText);

    const notesText = note.trim() === ''
      ? 'No additional user notes provided.'
      : `"${note}"`;


    const promptText = `

      You are a helpful fitness AI trainer.

      Given the following workout log and notes, provide a brief analysis including:

      1. What went well in the current workout.
      2. Areas for improvement based on the exercise performance.
      3. A detailed comparison between the previous workout and the current workout, explaining the differences and trends clearly.
      4. How the user's reported mood or condition may have affected their performance.
      5. One or two actionable suggestions for their next session.
      6. A motivational sentence to encourage the user.

      The following data is provided:

      User Notes:
      ${notesText}

      Previous Workout Summary:
      ${previousSummaryText || "No previous workout data available."}

      Current Workout Summary:
      ${summaryText}

      Personal Notes:
        1. I believe that pushing your muscles to failure is good for muscle growth. So keep in mind seeing a decline in reps is not necessarily something or an area to improve on.
        2. Opposite of 1, keep in mind not seeing a decline on reps could mean the weight is too easy. But also, everything is situational per user. For example due to injury maybe the user does not want to push to failure for safety reasons.

      Please provide a concise, 2-3 sentence summary covering all points above. Use clear, conversational language, and explicitly describe the comparison between the current and previous workouts.

      Thank you.
      `;

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

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

  const buildMonthlySummaryText = (workouts) => {
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

    const monthlySummaryText = monthlyWorkoutData.length > 0
      ? buildMonthlySummaryText(monthlyWorkoutData)
      : null;

    console.log("Previous Inputs:", previousInputs);
    console.log("Parsed Previous Summary:", previousSummaryText);
    console.log("Monthly Summary:", monthlySummaryText);

    const notesText = note.trim() === ''
      ? 'No additional user notes provided.'
      : `"${note}"`;


    const promptText = `

      You are a helpful fitness AI trainer.

      The following data is provided:

      User Notes:
      ${notesText}

      Previous Workout Summary:
      ${previousSummaryText || "No previous workout data available."}

      Current Workout Summary:
      ${summaryText}

      Monthly Workout Summary (Most recent first):
      ${monthlySummaryText}

      Given the following workout log and notes, provide a brief analysis including:

      1. What went well in the current workout.
      2. How the user's reported mood or condition may have affected their performance.
      3. A detailed comparison between the previous workout and the current workout, explaining the differences and trends clearly.
      4. A summary of monthly trends, pointing out patterns such as progression, plateau, or regression in performance over time."
      5. Areas for improvement based on the exercise performance.
      6. One or two actionable suggestions for their next session.
      7. A motivational sentence to encourage the user.

      Please format the response with section titles
       1. Always insert **one line between sections. ** in the text when we begin a new section from above start a new line.
          Use double line breaks to separate each paragraph.

      For example:

      What Went Well
      [text here]
      -----------------------------------------------------------
      Mood/Condition
      [text here]
      -----------------------------------------------------------

      Comparison with Previous Workout
      [text here]
      -----------------------------------------------------------

      Monthly Trends
      [text here]
      -----------------------------------------------------------

      Areas for Improvement
      [text here]
      -----------------------------------------------------------

      Actionable Suggestion
      [text here]
      -----------------------------------------------------------

      Motivation
      [text here]

      Personal Notes:
        1. I believe that pushing your muscles to failure is good for muscle growth. So keep in mind seeing a decline in reps is not necessarily something bad or an area to improve on, just something to note.
        2. Opposite of 1, keep in mind not seeing a decline on reps could mean the weight is too easy. But also, everything is situational per user, just something to note. For example due to injury maybe the user does not want to push to failure for safety reasons.

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

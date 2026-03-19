// src/utils/summaryUtils.js
import exerciseNames from './exerciseNames';
import { parseWeightReps } from './parsing';

export async function generateSummary(inputs, note, previousInputs, monthlyWorkoutData = []) {
  console.log("generateSummary called");

  // Cardio exercises list (case-insensitive matching)
  const cardioExercises = ['treadmill', 'bike', 'stationary bike', 'elliptical', 'stairmaster'];

  const isCardioExercise = (exerciseName) => {
    const name = (exerciseName || '').toLowerCase();
    return cardioExercises.some(cardio => name.includes(cardio));
  };

  const buildExerciseSummaryText = (inputs) => {
    return Object.entries(inputs)
      .map(([key, data]) => {
        // Handle both old (selection) and new (exerciseName) field names
        const exerciseName = exerciseNames[data.exerciseName || data.selection] || data.exerciseName || data.selection;

        // Handle both old (input) and new (sets) field names
        const setsData = data.sets || data.input || [];

        // Check if this is a cardio exercise
        if (isCardioExercise(exerciseName)) {
          // For cardio, just show the raw values (time, distance, etc.)
          const cardioSets = setsData
            .filter(set => set.trim() !== "")
            .join(", ");
          return `${exerciseName}: ${cardioSets || "no data"}`;
        }

        // For strength training exercises, parse weight x reps
        const sets = setsData
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
      // Handle both old (inputs) and new (exerciseData) field names
      const workoutExercises = workout.exerciseData || workout.inputs || {};
      return `${dateLabel} - ${buildExerciseSummaryText(workoutExercises)}`;
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


    const promptText = `You are a fitness AI analyzing workout performance. Keep your response under 250 words.

USER NOTES: ${notesText}

PREVIOUS WORKOUT: ${previousSummaryText || "No previous data"}

CURRENT WORKOUT: ${summaryText}

MONTHLY TREND: ${monthlySummaryText || "Not enough history"}

Format your response with section headers in ALL CAPS on their own line, followed by clean paragraphs. No asterisks, bullets, or symbols. Use this exact structure:

HIGHLIGHTS & AREAS FOR IMPROVEMENT
[What went well and what needs work in 2-3 sentences]

MOOD & CONDITION
[How condition affected performance in 1-2 sentences]

PROGRESS ANALYSIS
[Compare to previous workout and note monthly trends in 2-3 sentences]

NEXT STEPS
[1-2 actionable tips and motivational close in 2-3 sentences]

IMPORTANT CONTEXT:
Rep decline = good (training to failure aids growth)
No rep decline = possibly too light
Cardio (Treadmill, Bike, Elliptical, StairMaster): Analyze time/distance/intensity, NOT weight/reps
Abs: Treat like strength exercises (weight x reps)`;

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

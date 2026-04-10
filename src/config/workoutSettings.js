// Workout settings and defaults

export const WORKOUT_SETTINGS = {
  // Default rest timer duration (in seconds)
  DEFAULT_REST_DURATION: 180, // 3 minutes

  // Sound settings
  SOUND_ENABLED: true,

  // Auto-advance to next set after rest timer ends
  AUTO_ADVANCE: false,

  // Template-specific rest durations (in seconds)
  TEMPLATE_REST_DURATIONS: {
    'Leg Day': 150, // 2 min 30 sec
    'Upper Body': 120, // 2 min
    'Full Body': 180, // 3 min
  },

  // Rest timer increment/decrement buttons (in seconds)
  REST_TIMER_ADJUSTMENTS: {
    QUICK: 30, // +30s button
    MEDIUM: 60, // +60s button
  },
};

// Get rest duration for a specific template
export const getRestDurationForTemplate = (templateName) => {
  return WORKOUT_SETTINGS.TEMPLATE_REST_DURATIONS[templateName] || WORKOUT_SETTINGS.DEFAULT_REST_DURATION;
};

// Format seconds to mm:ss
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format total workout duration to readable format
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`;
  } else if (mins > 0) {
    return `${mins}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

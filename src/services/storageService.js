/**
 * Centralized localStorage Service
 * All localStorage operations go through this service for:
 * - Consistent error handling
 * - Type safety
 * - Easy debugging
 * - Single source of truth
 */

// Storage keys
export const STORAGE_KEYS = {
  ACTIVE_WORKOUT_DRAFT: 'active_workout_draft',
  ACTIVE_WORKOUT_SESSION: 'activeWorkoutSession',
  WORKOUT_SETTINGS: 'workoutSettings',
  FAVORITE_EXERCISES: 'favoriteExercises',
};

/**
 * Base storage operations with error handling
 */
const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },
};

/**
 * Workout Draft Operations
 */
export const workoutDraft = {
  /**
   * Save workout draft
   */
  save(draft) {
    return storage.set(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT, draft);
  },

  /**
   * Get workout draft
   */
  get() {
    return storage.get(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);
  },

  /**
   * Check if draft has data
   */
  hasData() {
    const draft = this.get();
    if (!draft) return false;

    // Check for data in both old and new format
    const hasData = (draft.inputs && Object.keys(draft.inputs).length > 0) ||
                    (draft.exerciseData && Object.keys(draft.exerciseData).length > 0);
    return hasData;
  },

  /**
   * Clear workout draft
   */
  clear() {
    return storage.remove(STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT);
  },
};

/**
 * Active Workout Session Operations
 */
export const workoutSession = {
  /**
   * Save active workout session
   */
  save(session) {
    return storage.set(STORAGE_KEYS.ACTIVE_WORKOUT_SESSION, session);
  },

  /**
   * Get active workout session
   */
  get() {
    return storage.get(STORAGE_KEYS.ACTIVE_WORKOUT_SESSION);
  },

  /**
   * Check if session exists
   */
  exists() {
    return this.get() !== null;
  },

  /**
   * Clear active workout session
   */
  clear() {
    return storage.remove(STORAGE_KEYS.ACTIVE_WORKOUT_SESSION);
  },

  /**
   * Update specific session fields
   */
  update(updates) {
    const session = this.get();
    if (!session) return false;

    const updated = { ...session, ...updates };
    return this.save(updated);
  },
};

/**
 * Workout Settings Operations
 */
export const workoutSettings = {
  /**
   * Save workout settings
   */
  save(settings) {
    return storage.set(STORAGE_KEYS.WORKOUT_SETTINGS, settings);
  },

  /**
   * Get workout settings
   */
  get() {
    return storage.get(STORAGE_KEYS.WORKOUT_SETTINGS);
  },

  /**
   * Update specific settings
   */
  update(updates) {
    const settings = this.get() || {};
    const updated = { ...settings, ...updates };
    return this.save(updated);
  },

  /**
   * Clear workout settings
   */
  clear() {
    return storage.remove(STORAGE_KEYS.WORKOUT_SETTINGS);
  },
};

/**
 * Favorite Exercises Operations
 */
export const favoriteExercises = {
  /**
   * Save favorite exercises
   */
  save(favorites) {
    return storage.set(STORAGE_KEYS.FAVORITE_EXERCISES, favorites);
  },

  /**
   * Get favorite exercises
   */
  get() {
    return storage.get(STORAGE_KEYS.FAVORITE_EXERCISES) || [];
  },

  /**
   * Add exercise to favorites
   */
  add(exerciseName) {
    const favorites = this.get();
    if (!favorites.includes(exerciseName)) {
      favorites.push(exerciseName);
      return this.save(favorites);
    }
    return true;
  },

  /**
   * Remove exercise from favorites
   */
  remove(exerciseName) {
    const favorites = this.get();
    const filtered = favorites.filter(ex => ex !== exerciseName);
    return this.save(filtered);
  },

  /**
   * Toggle exercise favorite status
   */
  toggle(exerciseName) {
    const favorites = this.get();
    if (favorites.includes(exerciseName)) {
      return this.remove(exerciseName);
    } else {
      return this.add(exerciseName);
    }
  },

  /**
   * Check if exercise is favorited
   */
  isFavorite(exerciseName) {
    const favorites = this.get();
    return favorites.includes(exerciseName);
  },

  /**
   * Clear all favorites
   */
  clear() {
    return storage.remove(STORAGE_KEYS.FAVORITE_EXERCISES);
  },
};

/**
 * Clear all workout-related storage
 */
export const clearAllWorkoutData = () => {
  workoutDraft.clear();
  workoutSession.clear();
  // Don't clear settings and favorites - user preferences
  return true;
};

/**
 * Export for debugging
 */
export const debug = {
  /**
   * Log all storage contents
   */
  logAll() {
    console.group('localStorage Contents');
    console.log('Draft:', workoutDraft.get());
    console.log('Session:', workoutSession.get());
    console.log('Settings:', workoutSettings.get());
    console.log('Favorites:', favoriteExercises.get());
    console.groupEnd();
  },

  /**
   * Clear all storage (including user preferences)
   */
  clearAll() {
    return storage.clear();
  },
};

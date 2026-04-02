/**
 * Robust session persistence utility
 * Saves to BOTH localStorage and sessionStorage for redundancy
 * Helps prevent data loss on mobile browsers
 */

const SESSION_KEY = 'activeWorkoutSession';
const SESSION_BACKUP_KEY = 'activeWorkoutSession_backup';

export const saveWorkoutSession = (sessionData) => {
  const dataToSave = {
    ...sessionData,
    lastSaved: Date.now(), // Timestamp for debugging
  };

  const serialized = JSON.stringify(dataToSave);

  try {
    // Save to localStorage (persists across sessions)
    localStorage.setItem(SESSION_KEY, serialized);

    // ALSO save to sessionStorage (backup, survives tab refresh)
    sessionStorage.setItem(SESSION_BACKUP_KEY, serialized);

    console.log('[SessionPersistence] Session saved successfully', {
      workoutName: sessionData.workoutName,
      exerciseCount: sessionData.exercises?.length,
      timestamp: new Date(dataToSave.lastSaved).toLocaleTimeString(),
    });
  } catch (err) {
    console.error('[SessionPersistence] Failed to save session:', err);
    // Try to alert user if storage is full
    if (err.name === 'QuotaExceededError') {
      alert('Storage full! Your workout may not be saved. Please save immediately.');
    }
  }
};

export const loadWorkoutSession = () => {
  try {
    // Try localStorage first
    let session = localStorage.getItem(SESSION_KEY);
    let source = 'localStorage';

    // If localStorage is empty, try sessionStorage backup
    if (!session) {
      session = sessionStorage.getItem(SESSION_BACKUP_KEY);
      source = 'sessionStorage';
    }

    if (session) {
      const parsed = JSON.parse(session);
      const age = Date.now() - parsed.lastSaved;
      const ageMinutes = Math.floor(age / 60000);

      console.log('[SessionPersistence] Session loaded from', source, {
        workoutName: parsed.workoutName,
        ageMinutes: ageMinutes,
        lastSaved: new Date(parsed.lastSaved).toLocaleString(),
      });

      // Warn if session is very old (might be stale)
      if (ageMinutes > 180) { // 3 hours
        console.warn('[SessionPersistence] Session is', ageMinutes, 'minutes old - might be stale');
      }

      return parsed;
    }

    console.log('[SessionPersistence] No session found');
    return null;
  } catch (err) {
    console.error('[SessionPersistence] Failed to load session:', err);
    return null;
  }
};

export const clearWorkoutSession = () => {
  console.log('[SessionPersistence] Clearing workout session');
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_BACKUP_KEY);
};

export const debugSessionState = () => {
  const local = localStorage.getItem(SESSION_KEY);
  const session = sessionStorage.getItem(SESSION_BACKUP_KEY);

  console.log('[SessionPersistence] Debug State:', {
    hasLocalStorage: !!local,
    hasSessionStorage: !!session,
    localStorageSize: local?.length || 0,
    sessionStorageSize: session?.length || 0,
    localStorage: local ? JSON.parse(local) : null,
    sessionStorage: session ? JSON.parse(session) : null,
  });
};

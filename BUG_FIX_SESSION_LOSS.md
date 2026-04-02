# Bug Fix: Workout Session Loss During Long Workouts

**Date:** April 1, 2026
**Issue:** User reported losing workout progress "deep into workout" when switching apps or turning off phone screen, ending up back on HypertrophyPage template selection

## Root Cause Analysis

### Symptoms
- ✅ Early in workout: switching apps works fine
- ❌ Deep in workout (30+ minutes): browser refresh loses session data
- ❌ User ends up on HypertrophyPage asking to select template
- ❌ All workout progress lost

### Root Causes Identified

1. **Mobile Browser Memory Management**
   - Mobile browsers aggressively kill background tabs to save memory
   - After ~1 hour, browser may completely terminate the tab
   - localStorage can be cleared under extreme memory pressure

2. **Single Point of Failure**
   - Only saving to localStorage
   - No backup/redundancy
   - No session age tracking

3. **Debugging Difficulty**
   - No logging to understand what's happening
   - Can't tell if data was saved, cleared, or never loaded

## Solutions Implemented

### 1. Created Robust Session Persistence Utility

**File:** `/src/utils/sessionPersistence.js`

**Features:**
- ✅ **Dual Storage**: Saves to BOTH localStorage AND sessionStorage
- ✅ **Timestamp Tracking**: Records when session was last saved
- ✅ **Automatic Fallback**: If localStorage fails, loads from sessionStorage
- ✅ **Comprehensive Logging**: Tracks save/load operations for debugging
- ✅ **Age Detection**: Warns if session is very old (potentially stale)
- ✅ **Error Handling**: Catches QuotaExceededError and alerts user

### 2. Updated StartWorkoutPage

**Changes:**
- Uses new `saveWorkoutSession()` instead of raw localStorage
- Uses `loadWorkoutSession()` with automatic fallback
- Uses `clearWorkoutSession()` to clean both storage locations
- Added detailed console logging for debugging

### 3. Updated ResumeWorkoutModal

**Changes:**
- Uses new session persistence utility
- Logs session age when loading
- Logs when user discards session
- Better error handling

### 4. Added Debug Logging Throughout

**What Gets Logged:**
- When session is saved (with timestamp, exercise count, completed sets)
- When session is loaded (with age in minutes, source)
- When session is cleared (user action or error)
- Any errors parsing or loading session

## Testing Instructions

### How to Test the Fix

1. **Start a workout**
   - Open browser DevTools console (F12)
   - Start a workout on StartWorkoutPage
   - Complete a few sets

2. **Check logging**
   ```
   [StartWorkoutPage] Saving session to localStorage: {...}
   [SessionPersistence] Session saved successfully {...}
   ```

3. **Simulate browser tab kill**
   - Close the tab completely (not just refresh)
   - Reopen browser
   - Navigate to any page

4. **Expected behavior**
   - Should see: `[ResumeWorkoutModal] Saved session: FOUND`
   - Modal should appear asking to resume
   - Click "Resume" → returns to exact workout position

5. **Check session backup**
   - Open DevTools → Application → Storage
   - Check localStorage: `activeWorkoutSession`
   - Check sessionStorage: `activeWorkoutSession_backup`
   - Both should have identical data

### Debug Commands

If workout still gets lost, run in console:
```javascript
// Check what's in storage
localStorage.getItem('activeWorkoutSession')
sessionStorage.getItem('activeWorkoutSession_backup')

// Or use the debug utility
import { debugSessionState } from './utils/sessionPersistence'
debugSessionState()
```

## What to Watch For

### Good Signs (Fix Working)
- Console shows regular session saves
- Modal appears when reopening app
- Both localStorage and sessionStorage have data
- Can resume workout after tab kill

### Bad Signs (Still Broken)
- No "Session saved" logs
- "Session NOT FOUND" when reopening
- Storage is empty in DevTools
- No modal appears

### If Still Broken
Possible remaining issues:
1. **Browser in incognito mode** - storage may be disabled
2. **Browser storage quota exceeded** - need to clear old data
3. **iOS Safari Private Mode** - storage is limited
4. **Auth timeout** - Firebase token expired (separate issue)

## Auth Timeout Investigation

**Status:** Unlikely to be the cause

**Evidence:**
- StartWorkoutPage has NO auth-based redirects
- Firebase auth tokens auto-refresh in background
- `browserLocalPersistence` is set correctly
- No code redirects to HypertrophyPage on auth failure

**Recommendation:**
- Test the session persistence fix first
- If issue persists, THEN investigate auth timeout
- Can add auth state monitoring if needed

## Files Modified

### Created
- `/src/utils/sessionPersistence.js` - New utility (94 lines)

### Modified
- `/src/pages/StartWorkoutPage.js` - Use new persistence utility
- `/src/components/ResumeWorkoutModal.js` - Use new persistence utility

## Next Steps

1. **Deploy & Test**
   - Deploy to production
   - Test during actual workout
   - Monitor console logs

2. **If Issue Persists**
   - Share console logs showing the problem
   - Check browser DevTools → Application → Storage
   - Verify both localStorage and sessionStorage are populated

3. **Potential Future Enhancements**
   - Add visual indicator showing "Session saved" to user
   - Periodic backup to server (Firebase)
   - Show session age in Resume modal
   - Add "Auto-save" settings toggle

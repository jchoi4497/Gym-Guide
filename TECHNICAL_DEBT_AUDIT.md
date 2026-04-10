
# Technical Debt Audit - April 2026

## Dead Code (Unused Files)

### 1. ResumeWorkoutModal.js
- **Location:** `src/components/ResumeWorkoutModal.js`
- **Status:** UNUSED
- **Reason:** Uses `workoutSession.get()` from localStorage, but we removed localStorage session management in favor of Firebase
- **Action:** DELETE

### 2. Unused Custom Hooks (src/hooks/)
All of these hooks are NOT imported anywhere in the codebase:

- `useWorkoutDraft.js` - DELETE
- `useWorkoutSaver.js` - DELETE
- `useWorkoutHistory.js` - DELETE
- `useTemplateLoader.js` - DELETE
- `useExerciseData.js` - DELETE
- `useStickyButton.js` - DELETE

**Only used hook:** `useIsMobile.js` (actively used in 5 components)

### 3. WorkoutContext.js
- **Location:** `src/context/WorkoutContext.js`
- **Status:** PROBLEMATIC - references localStorage but is NOT USED anywhere
- **Issue:** Imported in Main.js and wraps entire app, but NO component uses `useWorkout()`
- **Action:** Either DELETE or UPDATE to remove localStorage references

## Technical Debt

### 1. localStorage Still Referenced
Files still using localStorage (should be Firebase-only):
- `src/context/WorkoutContext.js` - workoutDraft, workoutSession
- `src/services/storageService.js` - Still exports workoutSession, workoutDraft
- `src/components/ResumeWorkoutModal.js` - workoutSession.get()

**Decision needed:** Keep storageService.js for favorites/settings, or move everything to Firebase?

### 2. Hardcoded Weight Units
All weight labels hardcoded as "lbs" instead of using user preference:
- `src/SavedWorkout/WorkoutInputs.js` (2 locations)
- `src/pages/StartWorkoutPage.js` (2 locations)
- `src/components/WorkoutSummary.js`
- `src/components/WorkoutProgress.js`
- `src/components/TableRow.js` (2 locations)
- `src/components/WeightRepsPicker.js` (2 locations)
- `src/components/OptionalWorkoutSections.js` (2 locations)

**Action:** Implement SettingsContext (planned in this branch)

## Potentially Unused Files (Need Investigation)

These files exist but I haven't verified if they're imported:
- `src/utils/sessionPersistence.js`
- `src/config/workoutSettings.js`

## Recommendations

### High Priority (Do Now)
1. Delete unused hooks (6 files)
2. Delete ResumeWorkoutModal.js
3. Decide on WorkoutContext.js:
   - Option A: Delete it (not being used)
   - Option B: Keep but remove localStorage references

### Medium Priority (This Branch)
1. Implement SettingsContext for weight units
2. Clean up storageService.js - remove workoutSession/workoutDraft if fully on Firebase

### Low Priority (Future)
1. Audit sessionPersistence.js and workoutSettings.js usage
2. Consider if favorites should move to Firebase too

## Questions for User
1. Do you want to keep WorkoutContext.js or delete it? (It's not being used)
2. Should favorites stay in localStorage or move to Firebase?
3. Any reason to keep workoutDraft/workoutSession in storageService?

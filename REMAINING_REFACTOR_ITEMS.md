# Remaining Refactor Items

## 🎯 Files That Still Need Updates

### 1. **ResumeWorkoutModal.js** (102 lines) - PRIORITY: HIGH
**Issues:**
- ❌ Uses raw localStorage instead of storageService
- Lines 18, 26, 37: Direct localStorage calls

**Fix:**
```javascript
// Before
const savedSession = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT_SESSION);
if (savedSession) {
  const session = JSON.parse(savedSession);
}
localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_SESSION);

// After
import { workoutSession } from '../services/storageService';

const session = workoutSession.get();
if (session) {
  // Already parsed!
}
workoutSession.clear();
```

**Estimated time:** 5 minutes

---

### 2. **SavedWorkout/WorkoutInputs.js** (435 lines) - PRIORITY: MEDIUM
**Issues:**
- ❌ Duplicate mobile detection (lines ~15)
- ❌ Duplicate set parsing logic (split('x'))

**Fix:**
```javascript
// Add imports
import { useIsMobile } from '../hooks/useIsMobile';
import { parseSet, combineSet } from '../utils/setHelpers';

// Replace mobile detection
const isMobile = useIsMobile();

// Replace set parsing
const { weight, reps } = parseSet(setString);
```

**Estimated time:** 10 minutes

---

### 3. **SavedWorkout/SavedWorkout.js** (848 lines) - PRIORITY: MEDIUM
**Issues:**
- ❌ Duplicate mobile detection

**Fix:**
```javascript
import { useIsMobile } from '../hooks/useIsMobile';

const isMobile = useIsMobile();
```

**Estimated time:** 5 minutes

---

## 📊 Summary

| File | Size | Issues | Priority | Time |
|------|------|--------|----------|------|
| ResumeWorkoutModal.js | 102 | localStorage | HIGH | 5 min |
| WorkoutInputs.js | 435 | Mobile + Parsing | MEDIUM | 10 min |
| SavedWorkout.js | 848 | Mobile | MEDIUM | 5 min |

**Total time to fix all:** ~20 minutes

---

## ✅ What's Already Done

Files that DON'T need updates (already refactored):
- ✅ HypertrophyPage.js - Uses WorkoutContext + storageService
- ✅ StartWorkoutPage.js - Uses useIsMobile + storageService
- ✅ TableRow.js - Uses useIsMobile + setHelpers
- ✅ WorkoutProgress.js - Uses useIsMobile
- ✅ Main.js - Wrapped with WorkoutProvider

---

## 🚨 Critical vs Nice-to-Have

### Critical (Do Now)
1. **ResumeWorkoutModal.js** - Uses old localStorage, could break

### Nice-to-Have (Do Later)
2. **WorkoutInputs.js** - Works fine, just not DRY
3. **SavedWorkout.js** - Works fine, just not DRY

---

## 🎯 Recommendation

**Option A: Fix critical only (5 min)**
- Just fix ResumeWorkoutModal.js
- Test and merge

**Option B: Fix everything (20 min)**
- Fix all 3 files
- Complete consistency across codebase
- No duplicate code anywhere

I recommend **Option B** - Let's finish what we started and make the codebase truly clean.

---

## 📝 Notes

**Why these weren't caught earlier:**
- SavedWorkout folder wasn't in our initial analysis focus
- We focused on HypertrophyPage and StartWorkoutPage (workout creation)
- These are workout *viewing/editing* pages

**Good news:**
- No functional setState bugs in these files (they don't use WorkoutContext)
- No critical bugs, just duplicate code
- Easy to fix

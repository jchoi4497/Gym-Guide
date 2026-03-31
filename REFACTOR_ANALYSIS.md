# Code Refactoring Analysis

## Executive Summary
The Gym Guide codebase has grown significantly and is showing signs of technical debt. While functional, several architectural issues need addressing to prevent future bugs and maintain velocity.

---

## 🚨 Critical Issues

### 1. **HypertrophyPage.js - Monolithic Component (1,452 lines)**
**Severity: HIGH**

- **24 useState calls** - Massive code smell indicating poor state management
- **6 useEffect hooks** - Complex lifecycle management
- **10 localStorage operations** - Scattered data persistence logic
- **Mixed concerns**: UI rendering, business logic, Firebase operations, template management, localStorage handling

**Recommended Actions:**
- Extract custom hooks: `useWorkoutDraft`, `useWorkoutTemplate`, `useStickyButton`, `usePreviousWorkout`
- Create separate components: `WorkoutConfigPanel`, `WorkoutActions`
- Move business logic to services: `workoutService.js`, `templateService.js`

---

### 2. **Duplicate Code Patterns**

#### Mobile Detection (6 files)
Files affected:
- `HypertrophyPage.js`
- `StartWorkoutPage.js`
- `WorkoutProgress.js`
- `TableRow.js`
- `SavedWorkout.js`
- `WorkoutInputs.js`

All use identical pattern:
```javascript
const [isMobile, setIsMobile] = useState(false);
useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 640);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

**Solution:** Create `hooks/useIsMobile.js`

---

#### Set Parsing Logic (3 files)
- `TableRow.js` - has its own `parseSet()` function
- `WorkoutInputs.js` - duplicates parsing
- `parsing.js` - ALREADY EXISTS but not being used!

**Solution:** Use existing `parsing.js` utility everywhere

---

#### Copy Previous Set Logic (2 files)
- `TableRow.js`
- `WorkoutProgress.js`

Identical logic for copying previous set's weight/reps.

**Solution:** Extract to `utils/setHelpers.js`

---

### 3. **localStorage Management - Scattered**

**Files using localStorage:**
- `HypertrophyPage.js` - 10 occurrences
- `StartWorkoutPage.js` - 4 occurrences
- `ResumeWorkoutModal.js` - 2 occurrences

**Keys used:**
- `activeWorkoutSession`
- `ACTIVE_WORKOUT_DRAFT`
- Various direct string literals

**Issues:**
- No centralized management
- Inconsistent serialization/deserialization
- Error handling scattered
- No type safety

**Solution:** Create `services/storageService.js` with:
```javascript
export const workoutStorage = {
  saveActiveSession: (session) => {...},
  getActiveSession: () => {...},
  saveDraft: (draft) => {...},
  getDraft: () => {...},
  clear: () => {...}
}
```

---

### 4. **State Management in StartWorkoutPage**

**Current Issues:**
- 13 useState calls in one component
- Complex data flow between HypertrophyPage ↔ StartWorkoutPage
- Session restoration bug: "adding custom exercise causes original workouts to disappear"

**Root Cause:**
When navigating HypertrophyPage → StartWorkoutPage → back to HypertrophyPage:
1. StartWorkoutPage saves session to localStorage
2. HypertrophyPage tries to restore from session
3. Exercise data structure mismatch causes data loss

**Solution:**
- Create consistent data structure: `types/workout.js`
- Use reducer for complex state: `useWorkoutReducer`
- Validate data on restoration

---

## 📊 File Size Analysis

**Too Large (needs breaking down):**
- HypertrophyPage.js: 1,452 lines ⚠️
- SavedWorkout.js: 848 lines ⚠️
- StartWorkoutPage.js: 721 lines ⚠️

**Target:** Keep components under 300 lines

---

## 🎯 Recommended Refactoring Priority

### Phase 1: Quick Wins (Low Risk, High Impact)
1. ✅ Create `hooks/useIsMobile.js` - eliminate 6 duplications
2. ✅ Consolidate set parsing to use existing `parsing.js`
3. ✅ Create `utils/setHelpers.js` for copy previous set logic
4. ✅ Create `services/storageService.js` for localStorage

### Phase 2: State Management (Medium Risk, High Impact)
5. ✅ Extract custom hooks from HypertrophyPage:
   - `useWorkoutDraft.js`
   - `useWorkoutTemplate.js`
   - `useStickyButton.js`
6. ✅ Create workout data types/interfaces
7. ✅ Fix StartWorkoutPage session restoration bug

### Phase 3: Component Breakdown (Higher Risk, High Impact)
8. ✅ Break down HypertrophyPage into smaller components
9. ✅ Refactor StartWorkoutPage state management
10. ✅ Review SavedWorkout.js for similar patterns

### Phase 4: Performance Optimization
11. ✅ Add proper memoization where needed
12. ✅ Review and optimize re-renders
13. ✅ Check for memory leaks in timers/listeners

---

## 🔍 Code Smells Detected

1. **God Object Pattern** - HypertrophyPage doing too much
2. **Copy-Paste Programming** - Mobile detection, set parsing duplicated
3. **Scattered Concerns** - localStorage usage not centralized
4. **Magic Strings** - localStorage keys hardcoded in multiple places
5. **Deep Nesting** - Some components have 4-5 levels of conditional rendering
6. **Inconsistent Patterns** - Different components handle similar data differently

---

## ✅ What's Good (Keep This)

1. **Modular Components** - Good component structure overall
2. **Utility Functions** - `parsing.js`, `categoryDetection.js`, `exerciseConfig.js`
3. **Constants File** - `constants.js` with STORAGE_KEYS, FIREBASE_FIELDS
4. **Template System** - Clean separation in `utils/templateHelpers.js`
5. **Firebase Abstraction** - Good use of Firestore utilities

---

## 📝 Next Steps

Starting with Phase 1 (Quick Wins) to build confidence and momentum. Each change will be tested to ensure no functionality breaks.

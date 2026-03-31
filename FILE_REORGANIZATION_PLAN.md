# File Reorganization Plan

## Current Issue
Many files are scattered in `src/` root instead of proper folders.

---

## Files to Move

### 1. Components → `src/components/`
These are reusable UI components:
- ✅ AddExerciseButton.js
- ✅ DropDown.js
- ✅ Navbar.js
- ✅ Panel.js
- ✅ TableHead.js
- ✅ TableRow.js
- ✅ ThemeToggle.js
- ✅ WorkoutNotesInput.js
- ✅ WorkoutTable.js
- ✅ WorkoutType.js
- ✅ DataChart.js

### 2. Pages → `src/pages/`
These are page-level components:
- ✅ ListOfWorkouts.js

### 3. Utils → `src/utils/`
Utility functions:
- ✅ summaryUtil.js
- ⚠️ parsing.js (deprecated - already have setHelpers.js)

### 4. Config → `src/config/`
Configuration and data:
- ✅ Colors.js
- ✅ exerciseNames.js

### 5. Keep in Root
Core app files:
- ✅ App.js
- ✅ Main.js
- ✅ index.js
- ✅ firebase.js
- ✅ googleAuth.js
- ⚠️ constants.js (could move to config/ but widely imported)

---

## Affected Imports

After moving files, we need to update imports in:
- Main.js
- All pages
- All components
- SavedWorkout folder

---

## Move Commands

```bash
# Components
mv src/AddExerciseButton.js src/components/
mv src/DropDown.js src/components/
mv src/Navbar.js src/components/
mv src/Panel.js src/components/
mv src/TableHead.js src/components/
mv src/TableRow.js src/components/
mv src/ThemeToggle.js src/components/
mv src/WorkoutNotesInput.js src/components/
mv src/WorkoutTable.js src/components/
mv src/WorkoutType.js src/components/
mv src/DataChart.js src/components/

# Pages
mv src/ListOfWorkouts.js src/pages/

# Utils
mv src/summaryUtil.js src/utils/

# Config
mv src/Colors.js src/config/
mv src/exerciseNames.js src/config/
```

---

## Import Updates Needed

### Example: After moving DropDown.js
**Before:**
```javascript
import DropDown from './DropDown';
```

**After:**
```javascript
import DropDown from './components/DropDown';
```

---

## Estimated Time
- Moving files: 5 minutes
- Fixing imports: 15-20 minutes
- Testing: 10 minutes
- **Total: ~30 minutes**

---

## Benefits
- ✅ Clear folder structure
- ✅ Easy to find files
- ✅ Consistent organization
- ✅ Better developer experience

# Firebase Data Migration Guide

## Overview
This guide helps you safely migrate from the old data structure to the new recommended structure while preserving all user data.

---

## Migration Strategy: 3-Step Process

### Step 1: Export & Backup (NO RISK)
Export all existing data to JSON files as backup

### Step 2: Transform Data (LOCAL ONLY)
Convert old structure to new structure locally

### Step 3: Dual-Write Migration (SAFE)
- Keep old structure working
- Write to both old and new structures
- Gradually migrate users
- Remove old structure when complete

---

## Current Data Structure

```javascript
// OLD STRUCTURE (what you have now)
{
  "users": {
    "userId123": {
      "workouts": {
        "workoutId1": {
          "target": "chest",           // ❌ confusing name
          "reps": 4,                   // ❌ actually means "sets"
          "label": "4x12",
          "date": "2026-03-10",
          "inputs": {                  // ❌ generic name
            "incline": {
              "selection": "dip",      // ❌ exercise abbreviation
              "input": ["50x12", "55x10", "55x10", "60x8"]
            },
            "tri": {
              "selection": "sbcpd",
              "input": ["25x15", "30x12", "30x10"]
            }
          }
        }
      }
    }
  }
}
```

## New Data Structure

```javascript
// NEW STRUCTURE (recommended)
{
  "users": {
    "userId123": {
      "workouts": {
        "workoutId1": {
          "muscleGroup": "chest",      // ✅ clear name
          "numberOfSets": 4,           // ✅ clear name
          "setRangeLabel": "4x12",
          "date": "2026-03-10T18:30:00Z",
          "notes": "",
          "exercises": {
            "uuid-1": {
              "exerciseId": "dumbbell_incline_press",  // ✅ full ID
              "exerciseName": "Dumbbell Incline Press",
              "category": "incline_press",
              "order": 0,
              "sets": [
                { "weight": 50, "reps": 12, "volume": 600 },
                { "weight": 55, "reps": 10, "volume": 550 },
                { "weight": 55, "reps": 10, "volume": 550 },
                { "weight": 60, "reps": 8, "volume": 480 }
              ]
            },
            "uuid-2": {
              "exerciseId": "straight_bar_cable_pushdowns",
              "exerciseName": "Straight Bar Cable Push Downs",
              "category": "tricep_primary",
              "order": 1,
              "sets": [
                { "weight": 25, "reps": 15, "volume": 375 },
                { "weight": 30, "reps": 12, "volume": 360 },
                { "weight": 30, "reps": 10, "volume": 300 }
              ]
            }
          }
        }
      }
    }
  }
}
```

---

## Implementation Steps

### Step 1: Create Mapping Configuration

Create a file to map old exercise abbreviations to new IDs:

```javascript
// src/config/exerciseMigrationMap.js

export const EXERCISE_MIGRATION_MAP = {
  // Incline Press
  'dip': {
    id: 'dumbbell_incline_press',
    name: 'Dumbbell Incline Press',
    category: 'incline_press'
  },
  'mip': {
    id: 'machine_incline_press',
    name: 'Machine Incline Press',
    category: 'incline_press'
  },
  'bip': {
    id: 'barbell_incline_press',
    name: 'Barbell Incline Press',
    category: 'incline_press'
  },

  // Chest Press
  'dcp': {
    id: 'dumbbell_chest_press',
    name: 'Dumbbell Chest Press',
    category: 'chest_press'
  },
  'mcp': {
    id: 'machine_chest_press',
    name: 'Machine Chest Press',
    category: 'chest_press'
  },
  'bcp': {
    id: 'barbell_chest_press',
    name: 'Barbell Chest Press',
    category: 'chest_press'
  },

  // Triceps
  'sbcpd': {
    id: 'straight_bar_cable_pushdowns',
    name: 'Straight Bar Cable Push Downs',
    category: 'tricep_primary'
  },
  'rpd': {
    id: 'rope_pulldowns',
    name: 'Rope Pull Downs',
    category: 'tricep_primary'
  },
  'rpdt': {
    id: 'rope_pulldowns',  // Same exercise, just different position
    name: 'Rope Pull Downs',
    category: 'tricep_secondary'
  },

  // Add ALL your exercises here...
  // TODO: Complete this mapping for all exercises
};

export const CATEGORY_ORDER_MAP = {
  // Chest workout order
  'chest': [
    'incline_press',
    'chest_press',
    'chest_fly',
    'tricep_primary',
    'tricep_secondary'
  ],
  // Back workout order
  'back': [
    'pullup',
    'row',
    'lat_pulldown',
    'bicep_primary',
    'bicep_secondary'
  ],
  // Add other muscle groups...
};
```

---

### Step 2: Create Export Script

```javascript
// scripts/exportFirebaseData.js

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import fs from 'fs';

// Your Firebase config
const firebaseConfig = {
  // ... your config
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function exportAllData() {
  try {
    console.log('Exporting Firebase data...');

    // Export all users data
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);

    if (snapshot.exists()) {
      const data = snapshot.val();

      // Save to backup file with timestamp
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `firebase-backup-${timestamp}.json`;

      fs.writeFileSync(
        filename,
        JSON.stringify(data, null, 2)
      );

      console.log(`✅ Data exported to ${filename}`);
      console.log(`Total users: ${Object.keys(data).length}`);

      return data;
    } else {
      console.log('No data found');
      return null;
    }
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
}

// Run export
exportAllData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
```

---

### Step 3: Create Transformation Script

```javascript
// scripts/transformData.js

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { EXERCISE_MIGRATION_MAP, CATEGORY_ORDER_MAP } from '../src/config/exerciseMigrationMap.js';

function parseSetInput(input) {
  if (!input || typeof input !== 'string') return null;

  // Handle "weight x reps" format
  if (input.includes('x')) {
    const [weightStr, repsStr] = input.split('x').map(s => s.trim());
    const weight = parseFloat(weightStr);
    const reps = parseInt(repsStr);

    if (isNaN(weight) || isNaN(reps)) return null;

    return {
      weight,
      reps,
      volume: weight * reps,
      isBodyweight: false
    };
  }

  // Handle bodyweight (just reps)
  const reps = parseInt(input.trim());
  if (!isNaN(reps)) {
    return {
      weight: 0,
      reps,
      volume: reps,
      isBodyweight: true
    };
  }

  return null;
}

function transformWorkout(oldWorkout, userId) {
  const newWorkout = {
    // Rename confusing fields
    muscleGroup: oldWorkout.target,
    numberOfSets: oldWorkout.reps,  // "reps" actually meant "sets"
    setRangeLabel: oldWorkout.label,
    date: oldWorkout.date,
    notes: oldWorkout.notes || '',
    userId: userId,
    exercises: {}
  };

  // Transform exercises from old "inputs" structure
  if (oldWorkout.inputs) {
    const muscleGroup = oldWorkout.target;
    const categoryOrder = CATEGORY_ORDER_MAP[muscleGroup] || [];

    Object.entries(oldWorkout.inputs).forEach(([categoryKey, exerciseData], index) => {
      const exerciseAbbrev = exerciseData.selection;
      const oldSets = exerciseData.input || [];

      // Map old abbreviation to new structure
      let exerciseInfo = EXERCISE_MIGRATION_MAP[exerciseAbbrev];

      // Handle custom exercises
      if (!exerciseInfo) {
        if (exerciseAbbrev.startsWith('custom_')) {
          exerciseInfo = {
            id: exerciseAbbrev,
            name: exerciseData.customName || 'Custom Exercise',
            category: 'custom'
          };
        } else {
          console.warn(`⚠️  Unknown exercise: ${exerciseAbbrev} (will use as-is)`);
          exerciseInfo = {
            id: exerciseAbbrev,
            name: exerciseAbbrev,
            category: categoryKey
          };
        }
      }

      // Parse sets
      const parsedSets = oldSets
        .map(setInput => parseSetInput(setInput))
        .filter(set => set !== null);

      // Create new exercise entry
      const exerciseId = uuidv4();
      newWorkout.exercises[exerciseId] = {
        exerciseId: exerciseInfo.id,
        exerciseName: exerciseInfo.name,
        category: exerciseInfo.category,
        order: categoryOrder.indexOf(exerciseInfo.category) !== -1
          ? categoryOrder.indexOf(exerciseInfo.category)
          : index,
        sets: parsedSets
      };
    });
  }

  return newWorkout;
}

function transformAllData(oldData) {
  const newData = { users: {} };

  Object.entries(oldData).forEach(([userId, userData]) => {
    newData.users[userId] = {
      ...userData,
      workouts: {}
    };

    if (userData.workouts) {
      Object.entries(userData.workouts).forEach(([workoutId, workout]) => {
        try {
          newData.users[userId].workouts[workoutId] = transformWorkout(workout, userId);
        } catch (error) {
          console.error(`❌ Error transforming workout ${workoutId} for user ${userId}:`, error);
        }
      });
    }
  });

  return newData;
}

// Load backup file and transform
const backupFile = process.argv[2];
if (!backupFile) {
  console.error('❌ Please provide backup file: node transformData.js <backup-file.json>');
  process.exit(1);
}

const oldData = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
console.log('Transforming data...');

const newData = transformAllData(oldData);

// Save transformed data
const outputFile = backupFile.replace('.json', '-TRANSFORMED.json');
fs.writeFileSync(outputFile, JSON.stringify(newData, null, 2));

console.log(`✅ Transformed data saved to ${outputFile}`);
console.log('Please review the transformed data before importing!');
```

---

### Step 4: Dual-Write Migration (SAFEST APPROACH)

Instead of replacing everything at once, support BOTH structures temporarily:

```javascript
// src/utils/workoutDataAdapter.js

import { EXERCISE_MIGRATION_MAP } from '../config/exerciseMigrationMap';

export class WorkoutDataAdapter {
  // Write to BOTH old and new structure
  static async saveWorkout(userId, workoutData, database) {
    const workoutId = workoutData.id || Date.now().toString();

    // Save in NEW structure
    await set(ref(database, `users/${userId}/workouts_v2/${workoutId}`), {
      ...workoutData,
      version: 2,
      migratedAt: new Date().toISOString()
    });

    // ALSO save in OLD structure (for backwards compatibility)
    const oldFormat = this.convertNewToOld(workoutData);
    await set(ref(database, `users/${userId}/workouts/${workoutId}`), oldFormat);

    return workoutId;
  }

  // Read from new structure, fall back to old
  static async getWorkout(userId, workoutId, database) {
    // Try new structure first
    const newRef = ref(database, `users/${userId}/workouts_v2/${workoutId}`);
    const newSnapshot = await get(newRef);

    if (newSnapshot.exists()) {
      return newSnapshot.val();
    }

    // Fall back to old structure and migrate on read
    const oldRef = ref(database, `users/${userId}/workouts/${workoutId}`);
    const oldSnapshot = await get(oldRef);

    if (oldSnapshot.exists()) {
      const oldData = oldSnapshot.val();
      const newData = this.convertOldToNew(oldData);

      // Lazy migration: save to new structure
      await set(newRef, {
        ...newData,
        version: 2,
        migratedAt: new Date().toISOString()
      });

      return newData;
    }

    return null;
  }

  static convertOldToNew(oldWorkout) {
    // Same transformation logic as migration script
    // ... (copy from transformWorkout function)
  }

  static convertNewToOld(newWorkout) {
    // Convert back to old format for compatibility
    const oldInputs = {};

    Object.entries(newWorkout.exercises || {}).forEach(([uuid, exercise]) => {
      // Find old abbreviation
      const abbreviation = Object.keys(EXERCISE_MIGRATION_MAP).find(
        key => EXERCISE_MIGRATION_MAP[key].id === exercise.exerciseId
      ) || exercise.exerciseId;

      oldInputs[exercise.category] = {
        selection: abbreviation,
        input: exercise.sets.map(set =>
          set.isBodyweight ? `${set.reps}` : `${set.weight}x${set.reps}`
        )
      };
    });

    return {
      target: newWorkout.muscleGroup,
      reps: newWorkout.numberOfSets,
      label: newWorkout.setRangeLabel,
      date: newWorkout.date,
      notes: newWorkout.notes,
      inputs: oldInputs
    };
  }
}
```

---

## Recommended Migration Path

### Phase 1: Preparation (Day 1)
1. ✅ Complete the `EXERCISE_MIGRATION_MAP` with ALL exercises
2. ✅ Run export script to backup all data
3. ✅ Test transformation script on backup
4. ✅ Review transformed data manually

### Phase 2: Dual-Write (Week 1-2)
1. ✅ Deploy code with `WorkoutDataAdapter`
2. ✅ All new workouts write to both structures
3. ✅ All reads try new structure, fall back to old
4. ✅ Lazy migration: old data migrated on first read

### Phase 3: Background Migration (Week 2-3)
1. ✅ Create batch migration script to migrate remaining old workouts
2. ✅ Run in background, small batches (avoid rate limits)
3. ✅ Monitor for errors

### Phase 4: Switch Over (Week 4)
1. ✅ Verify 100% of data migrated
2. ✅ Remove old structure writes
3. ✅ Update all reads to only use new structure
4. ✅ Archive old data (don't delete yet!)

### Phase 5: Cleanup (Week 6)
1. ✅ After 2 weeks of stable operation
2. ✅ Delete old structure from Firebase
3. ✅ Remove compatibility code

---

## Safety Checklist

- [ ] ✅ Export and backup ALL data before starting
- [ ] ✅ Test transformation on copy of real data
- [ ] ✅ Verify exercise mapping is complete
- [ ] ✅ Implement dual-write before removing old structure
- [ ] ✅ Monitor error logs during migration
- [ ] ✅ Keep backup for at least 30 days
- [ ] ✅ Test with a single user first
- [ ] ✅ Have rollback plan ready

---

## Rollback Plan

If something goes wrong:

1. Stop deployment immediately
2. Revert to previous code version
3. Old structure still exists (dual-write preserved it)
4. Investigate issue with transformed data
5. Fix transformation script
6. Try again

---

## Testing Migration Locally

```javascript
// Test with Firebase Emulator
// firebase.json
{
  "database": {
    "rules": "database.rules.json"
  },
  "emulators": {
    "database": {
      "port": 9000
    }
  }
}
```

```bash
# Start emulator
firebase emulators:start

# Import backup data to emulator
firebase emulators:export ./emulator-data

# Test migration on emulator data
# ... run your migration scripts ...

# Verify results before touching production
```

---

## Questions?

Before you start, make sure you can answer:

1. ✅ Do I have a complete mapping of all exercise abbreviations?
2. ✅ Do I have a backup of all data?
3. ✅ Have I tested the transformation on a copy?
4. ✅ Do I understand the dual-write approach?
5. ✅ Do I have a rollback plan?

---

## Next Steps

Let me know when you're ready and I can:
1. Help you complete the exercise mapping
2. Create the actual migration scripts
3. Set up the dual-write adapter
4. Test the migration on your data

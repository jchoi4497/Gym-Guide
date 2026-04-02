# Gym Guide - Complete Code Walkthrough

## Table of Contents
1. [Application Architecture](#application-architecture)
2. [Entry Points](#entry-points)
3. [Pages](#pages)
4. [Components](#components)
5. [Configuration](#configuration)
6. [Utilities](#utilities)
7. [Data Flow](#data-flow)

---

## Application Architecture

### Tech Stack
- **Framework**: React 18.3.1
- **Routing**: React Router DOM 7.3.0
- **Styling**: Tailwind CSS 4.1.3
- **Database**: Firebase Firestore 11.6.0
- **Build Tool**: Vite 6.0.5
- **Charts**: Recharts 3.1.0
- **Drag & Drop**: @dnd-kit 6.3.1

### Application Flow
```
User lands on Landing Page
    ↓
Selects Template or Training Style
    ↓
Creates/Loads Workout (HypertrophyPage)
    ↓
Starts Workout (StartWorkoutPage)
    ↓
Completes Sets & Exercises
    ↓
Views Summary & Saves to Firebase
    ↓
Views Saved Workouts & Analytics
```

---

## Entry Points

### index.js (9 lines)
**Purpose**: Application entry point
**Key Functions**:
- Imports React and App component
- Creates React root
- Renders App to DOM

```javascript
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

### App.js (11 lines)
**Purpose**: Root component wrapper
**Key Functions**:
- Wraps Main component
- Applies global font class

**Flow**: App → Main → BrowserRouter → Routes

---

## Main.js (37 lines)
**Purpose**: Application router and navigation structure
**Key Components**:
- BrowserRouter: Handles client-side routing
- ResumeWorkoutModal: Global modal for paused workouts
- Routes: Defines all application routes

### Route Structure
| Path | Component | Purpose |
|------|-----------|---------|
| `/` | LandingPage | Home page with login |
| `/Templates` | TemplateSelectionPage | Browse workout templates |
| `/MyTemplates` | MyTemplatesPage | User's saved templates |
| `/TrainingStyle` | TrainingStylePage | Select training type |
| `/Strength` | StrengthPage | Strength training (legacy) |
| `/Hypertrophy` | HypertrophyPage | Main workout builder |
| `/start-workout` | StartWorkoutPage | Live workout tracking |
| `/ColorDesign` | ColorDesignPage | Theme/color tester |
| `/SavedWorkout/:workoutId` | SavedWorkout | View completed workout |
| `/SavedWorkouts` | ListOfWorkouts | History of workouts |
| `/MyExercises` | MyExercisesPage | Exercise library |

---

## Pages

### 1. LandingPage.js (48 lines)
**Purpose**: Application home page and authentication entry point

**State**: None (stateless presentation)

**Key Features**:
- Google OAuth login button
- "Get Started" navigation link
- Gradient background with centered card

**Functions**:
```javascript
handleLogin()
  ├─ Calls loginWithGoogle() from googleAuth.js
  ├─ Logs user info on success
  └─ Navigates to /Templates on successful auth
```

**UI Structure**:
```
Full-screen gradient background
  └─ Centered card
      ├─ Title: "Jonathan's Gym Guide"
      ├─ Subtitle/description
      └─ Action buttons (Get Started | Sign in with Google)
```

---

### 2. HypertrophyPage.js (1,452 lines) ⚠️ LARGEST FILE
**Purpose**: Main workout builder - create and configure workouts

**Responsibilities** (too many):
1. Muscle group selection
2. Set count configuration
3. Exercise selection and customization
4. Template loading from URL parameters
5. Previous workout data loading
6. Cardio/Abs section management
7. Workout notes
8. AI summary generation
9. Saving workouts to Firebase
10. Draft persistence to localStorage
11. Custom exercise tracking
12. Favorite exercise management

**State Management** (20+ state variables):
```javascript
[selectedMuscleGroup, setSelectedMuscleGroup] - Current muscle group
[numberOfSets, setNumberOfSets]               - Sets per exercise (3/4/5)
[exerciseData, setExerciseData]               - Main exercise data object
[note, setNote]                                - Workout notes
[isSaving, setIsSaving]                        - Save operation status
[isGeneratingSummary, setIsGeneratingSummary] - AI generation status
[previousWorkoutData, setPreviousWorkoutData] - Last workout for this muscle group
[previousCustomExercises, setPreviousCustomExercises] - Exercise history
[showCardio, setShowCardio]                    - Toggle cardio section
[showAbs, setShowAbs]                          - Toggle abs section
[cardioAtTop, setCardioAtTop]                  - Cardio position
[absAtTop, setAbsAtTop]                        - Abs position
[favoriteExercises, setFavoriteExercises]      - User's favorites
// ... and more
```

**Key Functions**:

```javascript
handleMuscleGroupSelect(option)
  ├─ Sets selected muscle group
  ├─ Resets exercise data
  ├─ Loads previous workout for this group
  └─ Initializes default exercises

handleSetCountSelect(option)
  ├─ Sets number of sets (3/4/5 or custom)
  └─ Re-initializes exercise data with new set count

handleExerciseDataChange(categoryKey, exerciseName, setIndex, setInput, detectedCategory)
  ├─ Updates exercise data object
  ├─ Handles exercise name changes (setIndex = -1)
  ├─ Handles set data input (setIndex >= 0)
  └─ Updates detected category for custom exercises

onBatchInitializeExercises(exercisesToInit)
  ├─ Batch initializes multiple exercises at once
  ├─ Creates empty sets array for each
  └─ Optimizes performance (single state update)

loadPreviousWorkout()
  ├─ Queries Firebase for last workout of this muscle group
  ├─ Loads exercise data from previous workout
  └─ Populates previousWorkoutData state

loadTemplate(templateId)
  ├─ Fetches template from Firebase
  ├─ Converts template format to exerciseData format
  ├─ Sets muscle group and configuration
  └─ Updates "last used" timestamp

handleSaveWorkout()
  ├─ Validates workout data
  ├─ Formats exercise data for Firebase
  ├─ Saves to "workouts" collection
  ├─ Clears localStorage draft
  └─ Shows success message

handleGenerateSummary()
  ├─ Calls OpenAI API via summaryUtil.js
  ├─ Generates workout analysis/summary
  ├─ Saves summary to Firebase
  └─ Displays in UI

handleStartWorkout()
  ├─ Validates workout configuration
  ├─ Packages workout data
  ├─ Navigates to /start-workout
  └─ Passes data via location.state

handleToggleFavorite(exerciseName)
  ├─ Adds/removes from favorites list
  └─ Saves to localStorage
```

**Data Structures**:

**exerciseData** object format:
```javascript
{
  "incline": {                    // category key
    exerciseName: "Dumbbell Incline Bench Press",
    sets: ["145x12", "145x10", "135x12", "135x10"],
    detectedCategory: "chest"     // for custom exercises
  },
  "cardio_section": {
    exerciseName: "Treadmill",
    sets: ["3.5mi 25min"]         // cardio format: distance + time
  }
}
```

**Effect Chain** (10+ useEffects):
1. Load template from URL parameter
2. Restore draft from localStorage on mount
3. Load previous workout when muscle group changes
4. Save draft to localStorage on any change
5. Load user's favorite exercises
6. Initialize default exercises
7. Sync cardio/abs data
8. Update custom exercise history

---

### 3. StartWorkoutPage.js (721 lines) ⚠️ LARGE FILE
**Purpose**: Live workout tracking with real-time timer and set completion

**Core Concept**: Flash card interface showing one set at a time, progressing through all exercises

**State Management**:
```javascript
[exercises, setExercises]           - Array of exercise objects with progress
[currentSetIndex, setCurrentSetIndex] - Global set counter (0 to totalSets-1)
[pickerOpen, setPickerOpen]         - Weight/reps picker modal state
[currentSetData, setCurrentSetData] - Temp data for current set {weight, reps}
[lastSetCompletedTime, setLastSetCompletedTime] - For rest timer
[restTimeElapsed, setRestTimeElapsed] - Current rest period
[showSummary, setShowSummary]       - Workout complete modal
[editingFromTable, setEditingFromTable] - Track edits from progress table
```

**Exercise Object Structure**:
```javascript
{
  key: "incline",                  // exercise ID
  exerciseName: "Dumbbell Incline Bench Press",
  totalSets: 4,                    // Total sets to complete
  completedSets: [                 // Array of completed sets
    {
      setNumber: 1,
      weight: "145",
      reps: "12",
      completedAt: 1234567890,     // timestamp
      restDuration: 0              // rest taken before this set
    }
  ]
}
```

**Key Functions**:

```javascript
// Initialization
useEffect() - Initialize exercises from workoutData
  ├─ Extracts exerciseData from location.state
  ├─ Separates cardio, abs, and main exercises
  ├─ Creates exercise array with totalSets and empty completedSets
  ├─ Reorders based on cardioAtTop/absAtTop preferences
  └─ Calls loadSessionFromStorage()

loadSessionFromStorage(exerciseArray)
  ├─ Checks localStorage for ACTIVE_WORKOUT_SESSION
  ├─ Restores progress if workout name matches
  └─ Resumes from last set

// Session Persistence
useEffect() - Save session on every change
  ├─ Packages current state (exercises, currentSetIndex, startTime)
  ├─ Includes original workoutData for restoration
  └─ Saves to localStorage

// Set Completion
handleCompleteSet()
  ├─ Validates currentSetData has weight or reps
  ├─ Creates completedSet object with timestamp
  ├─ Adds to exercise.completedSets array
  ├─ Starts rest timer
  ├─ Advances to next set (currentSetIndex++)
  └─ Shows summary if last set

// Navigation
loadSetData(setIdx)
  ├─ Calculates which exercise and set number
  ├─ Finds existing completedSet if any
  └─ Loads into currentSetData

handlePrevious/handleNext()
  ├─ Adjusts currentSetIndex
  └─ Calls loadSetData()

// Editing from Progress Table
handleUpdateSetFromTable(exerciseIndex, setNumber, field, value)
  ├─ Finds or creates set in completedSets
  ├─ Updates field (weight or reps)
  ├─ Removes set if both fields empty
  └─ Updates exercises state

// Workout Completion
handleSaveWorkout({ duration, averageRest })
  ├─ Formats exercises to exerciseData format
  ├─ Calculates stats (completedSets, totalSets)
  ├─ Saves to Firebase "workouts" collection
  ├─ Clears localStorage session
  └─ Navigates to /saved-workouts

handleDiscardWorkout()
  ├─ Clears localStorage session
  └─ Navigates home
```

**UI Components**:
```
Header (sticky)
  ├─ Workout name
  ├─ Total time elapsed
  └─ Buttons (Edit, Pause, End)

WorkoutProgress (collapsible)
  ├─ Overall progress bar
  ├─ Exercise list with completion status
  └─ Expandable table for editing sets

Flash Card (main UI)
  ├─ Rest timer indicator
  ├─ Exercise name
  ├─ Set X of Y
  ├─ Input fields (weight × reps)
  │   ├─ Mobile: Buttons → open WeightRepsPicker
  │   └─ Desktop: Text inputs
  ├─ Complete Set button
  └─ Previous Set button

WeightRepsPicker Modal (mobile)
  ├─ Scroll mode: DrumPicker wheels
  └─ Keypad mode: NumPad input

WorkoutSummary Modal (on completion)
  ├─ Stats (duration, sets, avg rest)
  ├─ Exercise breakdown
  └─ Actions (Save | Discard)
```

**Rest Timer Logic**:
```javascript
useEffect() - Update rest timer every 100ms
  ├─ Calculates elapsed time since lastSetCompletedTime
  ├─ Updates restTimeElapsed state
  └─ Shows green indicator when > DEFAULT_REST_DURATION (180s)
```

---

### 4. SavedWorkout.js (848 lines) ⚠️ LARGE FILE
**Purpose**: View and analyze a completed workout

**Key Features**:
1. Display workout details
2. Edit workout data (inline editing)
3. Generate AI analysis
4. Calculate exercise stats
5. Delete workout
6. Compare to previous workouts

**State Management**:
```javascript
[workout, setWorkout]           - Workout data from Firebase
[isEditing, setIsEditing]       - Edit mode toggle
[editedData, setEditedData]     - Modified exercise data
[isSaving, setIsSaving]         - Save status
[analysis, setAnalysis]         - AI-generated analysis
[isGenerating, setIsGenerating] - AI generation status
```

**Key Functions**:

```javascript
loadWorkout(workoutId)
  ├─ Fetches workout from Firebase by ID
  ├─ Parses exercise data
  └─ Sets workout state

handleEdit()
  ├─ Enables edit mode
  └─ Creates copy of data in editedData

handleSave()
  ├─ Validates edited data
  ├─ Updates Firebase document
  ├─ Exits edit mode
  └─ Refreshes workout data

handleDelete()
  ├─ Confirms with user
  ├─ Deletes Firebase document
  └─ Navigates to /SavedWorkouts

generateAnalysis()
  ├─ Calls OpenAI API with workout data
  ├─ Generates insights and recommendations
  ├─ Saves analysis to Firebase
  └─ Displays in UI
```

---

### 5. TemplateSelectionPage.js (307 lines)
**Purpose**: Browse and select pre-made workout templates

**Features**:
- Grid of template cards
- Filter by muscle group
- Quick start from template
- Navigate to MyTemplates

**Key Functions**:
```javascript
loadTemplates()
  ├─ Fetches all templates
  ├─ Filters by category
  └─ Sorts by popularity/rating

handleSelectTemplate(templateId)
  ├─ Navigates to /Hypertrophy?template={id}
  └─ Template loaded in HypertrophyPage
```

---

### 6. MyTemplatesPage.js (342 lines)
**Purpose**: Manage user's custom workout templates

**Features**:
- Create new templates
- Edit existing templates
- Delete templates
- Reorder exercises
- Set as default

**Key Functions**:
```javascript
loadUserTemplates()
  ├─ Queries Firebase for user's templates
  └─ Sorts by lastUsed or createdAt

handleCreateTemplate()
  ├─ Opens TemplateEditor modal
  └─ Saves to Firebase on confirm

handleEditTemplate(templateId)
  ├─ Loads template data
  ├─ Opens TemplateEditor
  └─ Updates Firebase on save

handleDeleteTemplate(templateId)
  ├─ Confirms deletion
  ├─ Removes from Firebase
  └─ Refreshes template list
```

---

### 7. ListOfWorkouts.js
**Purpose**: History view of all saved workouts

**Features**:
- Chronological list
- Filter by muscle group/date
- Quick stats (sets, duration)
- Navigate to detailed view

---

### 8. MyExercisesPage.js (523 lines)
**Purpose**: Exercise library and progress tracking

**Features**:
- Browse all exercises
- View exercise history
- Progress charts (weight over time)
- Personal records (PRs)
- Exercise notes

---

## Components

### Workout Components

#### WorkoutProgress.js (220 lines)
**Purpose**: Collapsible progress tracker during live workout

**Props**:
```javascript
{
  exercises: Array,          // Exercise objects with progress
  currentSetIndex: Number,   // Current global set
  onUpdateSet: Function,     // Update set from table
  onOpenPicker: Function,    // Open picker modal
  onReorderExercise: Function // Reorder exercises
}
```

**Features**:
- Overall progress bar
- Exercise-by-exercise breakdown
- Inline editing of completed sets
- Expand/collapse individual exercises
- "Copy previous set" button

**Key Functions**:
```javascript
stats = useMemo() - Calculate overall stats
  ├─ totalSets
  ├─ completedSets
  └─ percentComplete

exerciseBreakdown = useMemo() - Build exercise list
  ├─ Maps exercises to summary objects
  └─ Marks complete exercises
```

**UI Structure**:
```
Progress card
├─ Header (Progress: X/Y sets, %Complete)
├─ Progress bar
└─ Exercise list
    └─ For each exercise:
        ├─ Header (clickable to expand)
        │   ├─ Completion icon (✓ or ○)
        │   ├─ Exercise name
        │   └─ Set count (X/Y)
        └─ Expandable table (when clicked)
            └─ Input rows for each set
                ├─ Weight input
                ├─ Reps input
                └─ Copy previous button
```

---

#### WorkoutSummary.js (176 lines)
**Purpose**: End-of-workout summary modal

**Props**:
```javascript
{
  workoutName: String,
  startTime: Number,        // timestamp
  endTime: Number,          // timestamp
  exercises: Array,         // With completedSets
  onSave: Function,         // Save handler
  onDiscard: Function       // Discard handler
}
```

**Features**:
- Editable duration
- Calculated stats (avg rest)
- Exercise-by-exercise breakdown
- Save to Firebase or discard

**Key Calculations**:
```javascript
stats = useMemo() - Calculate workout stats
  ├─ totalSets
  ├─ completedSets
  └─ averageRest (from set timestamps)
      ├─ Filters outliers (10s - 10min)
      ├─ Calculates mean rest time
      └─ Returns in seconds
```

---

#### MuscleGroupWorkout.js (198 lines)
**Purpose**: Container for exercise table in HypertrophyPage

**Features**:
- Manages exercise list
- Add/remove custom exercises
- Initialize default exercises
- Edit sets toggle mode

**Key Functions**:
```javascript
useEffect() - Initialize default exercises
  ├─ Loads exercises for muscle group
  ├─ Only runs once (hasInitialized ref)
  └─ Calls onBatchInitializeExercises

addCustomExercise()
  ├─ Creates unique ID (custom_${timestamp})
  ├─ Adds to exercises array
  └─ Initializes in exerciseData

removeExercise(rowId)
  ├─ Filters exercise from array
  └─ Triggers re-render of table
```

---

#### WorkoutTable.js (203 lines)
**Purpose**: Drag-and-drop sortable table of exercises

**Features**:
- Drag to reorder (desktop)
- Arrow buttons to reorder (mobile)
- Expand all / Collapse all
- Edit sets mode

**Key Libraries**:
- @dnd-kit/core - Drag and drop functionality
- @dnd-kit/sortable - Sortable list behavior

**Key Functions**:
```javascript
handleDragEnd(event)
  ├─ Gets active and over items
  ├─ Calculates new index
  ├─ Uses arrayMove utility
  └─ Calls onReorder with new array

moveUp/moveDown(id)
  ├─ Finds current index
  ├─ Uses arrayMove for swap
  └─ Calls onReorder
```

---

#### TableRow.js (329 lines)
**Purpose**: Single exercise row with set inputs

**Props**:
```javascript
{
  numberOfSets: Number,       // Base set count
  value: String,              // Selected exercise
  options: Array,             // Exercise options for dropdown
  isCustom: Boolean,          // Custom vs preset
  setInputs: Array,           // ["145x12", "145x10", ...]
  onChange: Function,         // Exercise change handler
  cellInput: Function,        // Set input handler
  onRemove: Function,         // Remove exercise
  isEditingSets: Boolean,     // Edit mode
  expandAll: Boolean          // Expand/collapse control
}
```

**Key Features**:
- Collapsible header
- Exercise selection (dropdown or autocomplete)
- Set input cells
  - Desktop: Number inputs
  - Mobile: Buttons → open WeightRepsPicker
- Copy previous set button
- Add/Remove set buttons (edit mode only)

**Set Format Utilities**:
```javascript
parseSet(setString) - "145x12" → {weight: "145", reps: "12"}
combineSet(weight, reps) - {weight: "145", reps: "12"} → "145x12"

// Special cases:
// Bodyweight: "12" → {weight: "", reps: "12"}
// Cardio: "3.5mi 25min" → stored as single string
```

**Functions**:
```javascript
handleWeightChange(setIndex, newWeight)
  ├─ Parses current set
  ├─ Combines new weight with existing reps
  └─ Calls cellInput(setIndex, combined)

handleRepsChange(setIndex, newReps)
  ├─ Parses current set
  ├─ Combines existing weight with new reps
  └─ Calls cellInput(setIndex, combined)

handleCopyPreviousSet(setIndex)
  ├─ Gets previous set data
  ├─ Copies exact values
  └─ Calls cellInput

handleOpenPicker(setIndex, field)
  ├─ Sets editingSetIndex
  ├─ Sets initialField (weight or reps)
  └─ Opens WeightRepsPicker modal

handlePickerSave(weight, reps)
  ├─ Combines values
  └─ Updates set at editingSetIndex
```

---

### Input Components

#### WeightRepsPicker.js (223 lines)
**Purpose**: Mobile-optimized input modal for weight and reps

**Props**:
```javascript
{
  isOpen: Boolean,
  onClose: Function,
  weight: String,
  reps: String,
  onSave: Function,
  exerciseType: String,      // 'weight', 'bodyweight', 'timed', 'cardio'
  initialField: String       // 'weight' or 'reps' - which to focus
}
```

**Features**:
- Two input modes: Scroll (DrumPicker) or Keypad (NumPad)
- Tab switcher
- Exercise type detection (changes labels)
- Slides up from bottom (mobile-first)

**Input Modes**:

**Scroll Mode**:
```
[Weight Drum]  [Reps Drum]
   0-500lbs      0-100reps
   (0.5 step)    (1 step)

Selection highlight box spans both drums
```

**Keypad Mode**:
```
[Weight Button]  [Reps Button]
  (shows value)    (shows value)

    [NumPad]
  (shared, active field changes)
```

**Exercise Type Adaptations**:
```javascript
exerciseType: 'weight'
  ├─ Shows: Weight (lbs) × Reps
  └─ Range: 0-500 lbs, 0-100 reps

exerciseType: 'bodyweight'
  ├─ Shows: Reps only
  └─ Range: 0-100 reps

exerciseType: 'timed'
  ├─ Shows: Seconds
  └─ Range: 0-300 seconds

exerciseType: 'cardio'
  ├─ Shows: Distance (mi) × Time (min)
  └─ Range: 0-20 mi, 0-180 min
```

---

#### DrumPicker.js (244 lines)
**Purpose**: iOS-style scrollable value picker

**Props**:
```javascript
{
  value: Number,         // Current value
  onChange: Function,    // Value change handler
  min: Number,           // Min value (default: 0)
  max: Number,           // Max value (default: 500)
  step: Number,          // Increment (default: 0.5)
  label: String,         // Display label
  unit: String           // Unit suffix
}
```

**Key Features**:
- Infinite scroll illusion (3 copies of value array)
- Momentum scrolling
- Haptic feedback (vibration)
- Auto-snap to nearest value
- Gradient mask (fade at edges)

**Technical Implementation**:
```javascript
// Value array generation
coreValues = [0, 0.5, 1, 1.5, ..., 500] // min to max by step
values = [...coreValues, ...coreValues, ...coreValues] // 3x for wrap

// Scrolling
ITEM_HEIGHT = 44px
scrollTop = index * ITEM_HEIGHT

// Momentum
velocity = (yDelta / timeDelta) * 16  // Convert to ~60fps
applyMomentum() - Decreases velocity by 0.92 each frame

// Snapping
onScrollStop:
  index = Math.round(scrollTop / ITEM_HEIGHT)
  scrollToIndex(index, smooth: true)
```

**Haptic Feedback**:
```javascript
triggerHaptic()
  ├─ navigator.vibrate(10) // 10ms vibration
  └─ Triggers on value change
```

---

#### NumPad.js (84 lines)
**Purpose**: Numeric keypad for mobile input

**Props**:
```javascript
{
  value: String,
  onChange: Function,
  label: String,
  allowDecimals: Boolean   // Enable decimal point
}
```

**Layout**:
```
┌─────┬─────┬─────┐
│  1  │  2  │  3  │
├─────┼─────┼─────┤
│  4  │  5  │  6  │
├─────┼─────┼─────┤
│  7  │  8  │  9  │
├─────┼─────┼─────┤
│ . │ 0  │  0  │ ⌫ │
└─────┴─────┴─────┘

If !allowDecimals:
│  0  │  0  │  ⌫ │
```

**Functions**:
```javascript
handleNumberClick(num)
  ├─ Prevents leading zeros
  ├─ Appends digit
  └─ Calls onChange

handleDecimal()
  ├─ Adds '.' if not present
  └─ Prepends '0' if empty

handleBackspace()
  ├─ Removes last character
  └─ Returns '' if empty
```

---

#### ExerciseAutocomplete.js (269 lines)
**Purpose**: Searchable exercise picker with autocomplete

**Features**:
- Full exercise database search
- Custom exercise input
- Previous exercises suggestions
- Muscle group categorization
- Favorite exercises at top

**Key Functions**:
```javascript
filterExercises(searchTerm)
  ├─ Searches exercise database by name
  ├─ Filters by muscle group if specified
  ├─ Prioritizes favorites
  ├─ Includes previous custom exercises
  └─ Returns sorted results (favorites first)

handleSelect(exercise)
  ├─ Calls onSelect with exercise object
  ├─ Detects muscle group category
  └─ Closes dropdown

handleCustomInput(value)
  ├─ Creates custom exercise object
  └─ Calls onSelect
```

**Dropdown Structure**:
```
Input field (with search)
  ↓
Dropdown (if focused)
├─ Favorites section
│   └─ Exercise 1, 2, 3...
├─ Matching exercises
│   └─ Grouped by muscle group
│       ├─ Chest
│       ├─ Back
│       └─ Legs
└─ Previous custom exercises
    └─ Recently used
```

---

### Template Components

#### TemplateSelector.js
**Purpose**: Pick from saved templates

#### TemplateEditor.js (458 lines)
**Purpose**: Create/edit workout templates

**Features**:
- Template name input
- Muscle group selection
- Exercise picker with drag-and-drop
- Set count configuration
- Save template to Firebase

#### TemplateCard.js (209 lines)
**Purpose**: Display template in grid/list

**Shows**:
- Template name
- Exercise count
- Muscle group
- Last used date
- Quick action buttons

---

### UI Components

#### ResumeWorkoutModal.js (102 lines)
**Purpose**: Global modal to resume paused workout

**Trigger**: Shown on app load if ACTIVE_WORKOUT_SESSION in localStorage

**Features**:
- Workout name display
- Progress indicator (X/Y sets)
- Resume button (navigates to /start-workout)
- Discard button (clears localStorage)

**Logic**:
```javascript
useEffect() - On mount and route change
  ├─ Skip if on /start-workout
  ├─ Check localStorage for session
  ├─ Parse and validate session data
  └─ Show modal if valid session

handleResume()
  ├─ Closes modal
  └─ Navigates to /start-workout (session auto-loaded there)

handleDiscard()
  ├─ Removes ACTIVE_WORKOUT_SESSION from localStorage
  └─ Closes modal
```

---

#### RestTimer.js
**Purpose**: Countdown timer between sets

**Props**:
```javascript
{
  duration: Number,       // Total rest time
  elapsed: Number,        // Time elapsed
  onComplete: Function    // Callback when done
}
```

**Display**:
- Circular progress indicator
- Time remaining
- Color changes (red → yellow → green)

---

#### OptionalWorkoutSections.js (489 lines)
**Purpose**: Cardio and abs section management in HypertrophyPage

**Features**:
- Toggle cardio section on/off
- Toggle abs section on/off
- Position controls (top/bottom)
- Exercise selection for each section
- Set input for abs exercises

**Props**:
```javascript
{
  showCardio: Boolean,
  showAbs: Boolean,
  cardioAtTop: Boolean,
  absAtTop: Boolean,
  exerciseData: Object,
  onToggleCardio: Function,
  onToggleAbs: Function,
  onToggleCardioPosition: Function,
  onToggleAbsPosition: Function,
  onExerciseDataChange: Function,
  numberOfSets: Number
}
```

---

## Configuration

### constants.js (108 lines)
**Purpose**: Application-wide constants

**Exports**:
```javascript
// Muscle group values
MUSCLE_GROUPS = {
  CHEST: 'chest',
  BACK: 'back',
  LEGS: 'legs',
  SHOULDERS: 'shoulders',
  CUSTOM: 'custom'
}

// UI dropdown options
MUSCLE_GROUP_OPTIONS = [
  { label: "Chest/Triceps", value: "chest" },
  { label: "Back/Biceps", value: "back" },
  { label: "Legs", value: "legs" },
  { label: "Shoulders/Forearms", value: "shoulders" },
  { label: "Custom", value: "custom" }
]

SET_RANGE_OPTIONS = [
  { label: '3x15', value: 3, reps: 15 },
  { label: '4x12', value: 4, reps: 12 },
  { label: '5x8', value: 5, reps: 8 },
  { label: 'Custom', value: 'custom', reps: null }
]

// Firebase field names (for backward compatibility)
FIREBASE_FIELDS = {
  MUSCLE_GROUP: 'muscleGroup',
  NUMBER_OF_SETS: 'numberOfSets',
  EXERCISE_DATA: 'exerciseData',
  LEGACY_TARGET: 'target',      // old field name
  LEGACY_REPS: 'reps',          // old field name
  LEGACY_INPUTS: 'inputs'       // old field name
}
```

---

### exerciseConfig.js (865 lines)
**Purpose**: Complete exercise database

**Structure**:
```javascript
MUSCLE_GROUPS = { ... }

EXERCISE_CATEGORIES = {
  // Chest
  INCLINE_PRESS: 'incline',
  CHEST_PRESS: 'chestpress',
  CHEST_FLY: 'fly',
  TRICEP_PRIMARY: 'tri',
  // Back
  PULLUP: 'pullup',
  ROW: 'row',
  // ... 20+ categories
}

EXERCISES = {
  // Each exercise definition
  DUMBBELL_INCLINE_PRESS: {
    id: 'dip',
    name: 'Dumbbell Incline Bench Press',
    category: EXERCISE_CATEGORIES.INCLINE_PRESS,
    muscleGroup: MUSCLE_GROUPS.CHEST,
    metricType: 'weighted'  // or 'bodyweight', 'timed'
  },
  // ... 100+ exercise definitions
}
```

**Exercise Metric Types**:
- **weighted**: Standard weight × reps (e.g., "145x12")
- **bodyweight**: Just reps (e.g., "12")
- **timed**: Duration in seconds (e.g., "60 sec")
- **cardio**: Distance + time (e.g., "3.5mi 25min")

**Default Exercise Configurations**:
```javascript
DEFAULT_EXERCISES = {
  [MUSCLE_GROUPS.CHEST]: [
    { id: 'incline', selected: 'dip', options: [...] },
    { id: 'chestpress', selected: 'mp', options: [...] },
    { id: 'fly', selected: 'cfm', options: [...] },
    { id: 'tri', selected: 'sbcpd', options: [...] },
    { id: 'tri2', selected: 'oacpd', options: [...] }
  ],
  // ... for each muscle group
}
```

**Helper Functions**:
```javascript
getExercisesByCategory(category)
  └─ Returns array of exercises for dropdown

getExercisesByMuscleGroup(muscleGroup)
  └─ Returns all exercises for a muscle group

getExerciseName(exerciseId)
  └─ Converts ID to full name

getPlaceholderForExercise(exerciseId)
  └─ Returns placeholder based on metric type
      ├─ 'bodyweight' → "Reps"
      ├─ 'timed' → "Duration (sec)"
      └─ default → "Weight x Reps"

getDefaultExercises(muscleGroup)
  └─ Returns preset exercise list for muscle group
```

---

### workoutSettings.js (59 lines)
**Purpose**: Workout-specific configuration

**Exports**:
```javascript
WORKOUT_SETTINGS = {
  DEFAULT_REST_DURATION: 180,     // 3 minutes in seconds
  SOUND_ENABLED: true,
  AUTO_ADVANCE: false,
  TEMPLATE_REST_DURATIONS: {      // Custom rest by template
    'Leg Day': 150,
    'Upper Body': 120,
    'Full Body': 180
  }
}

STORAGE_KEYS = {
  ACTIVE_WORKOUT_SESSION: 'activeWorkoutSession',
  WORKOUT_SETTINGS: 'workoutSettings'
}

// Utility functions
formatTime(seconds)
  └─ "180" → "3:00" (mm:ss format)

formatDuration(seconds)
  └─ "4567" → "1h 16m 7s" (human readable)

getRestDurationForTemplate(templateName)
  └─ Returns custom rest or default
```

---

## Utilities

### templateHelpers.js (87 lines)
**Purpose**: Template loading and conversion utilities

**Functions**:
```javascript
async loadTemplate(userId, templateId)
  ├─ Queries Firebase for user's templates
  ├─ Finds template by ID
  └─ Returns template object or null

templateToExerciseData(template, numberOfSets)
  ├─ Converts template format to HypertrophyPage format
  ├─ Template: { category, exerciseId, exerciseName }
  ├─ Output: { [category]: { exerciseName, sets: [] } }
  └─ Initializes empty sets array

async updateTemplateLastUsed(userId, templateId)
  ├─ Updates template's lastUsed timestamp
  └─ Used for "recently used" sorting
```

**Template Format**:
```javascript
{
  id: "template_123",
  name: "Chest Day Advanced",
  muscleGroup: "chest",
  exercises: [
    {
      category: "incline",
      exerciseId: "dip",
      exerciseName: "Dumbbell Incline Bench Press"
    },
    // ... more exercises
  ],
  createdAt: "2024-01-01T00:00:00Z",
  lastUsed: "2024-01-15T10:30:00Z"
}
```

---

### categoryDetection.js
**Purpose**: Detect muscle group from custom exercise names

**Function**:
```javascript
getMuscleGroupFromCategory(exerciseName)
  ├─ Analyzes exercise name keywords
  ├─ Returns detected muscle group
  └─ Used for custom exercises

// Examples:
"Dumbbell Curls" → "back" (bicep)
"Leg Press" → "legs"
"Overhead Press" → "shoulders"
```

---

### summaryUtil.js
**Purpose**: OpenAI integration for workout summaries

**Function**:
```javascript
async generateSummary(workoutData)
  ├─ Formats workout data for prompt
  ├─ Calls OpenAI API
  ├─ Returns AI-generated summary
  └─ Includes: analysis, strengths, recommendations
```

---

## Firebase Integration

### firebase.js (29 lines)
**Purpose**: Firebase initialization and exports

**Configuration**:
```javascript
firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: 'jcsgymguide',
  // ... other config
}
```

**Exports**:
```javascript
export const db = getFirestore(app)          // Firestore database
export const auth = getAuth(app)              // Authentication
export const googleProvider = new GoogleAuthProvider()
export default db
```

---

### googleAuth.js
**Purpose**: Google OAuth authentication

**Function**:
```javascript
async loginWithGoogle()
  ├─ Opens Google sign-in popup
  ├─ Returns user object on success
  └─ Throws error on failure
```

---

## Data Flow

### Creating a Workout

```
1. User navigates to HypertrophyPage
   └─ Can arrive from:
       ├─ Template selection (?template=id)
       ├─ Training style selection
       └─ Direct navigation

2. HypertrophyPage initializes
   ├─ Checks URL for template parameter
   ├─ Loads template if present
   ├─ Restores localStorage draft if exists
   └─ Loads previous workout for reference

3. User configures workout
   ├─ Selects muscle group
   ├─ Selects set count (3/4/5)
   ├─ Exercises auto-initialize
   ├─ User customizes exercises
   ├─ Adds cardio/abs if desired
   └─ Enters workout notes

4. Draft auto-saved to localStorage
   └─ On every change (debounced)

5. User clicks "Start Workout"
   ├─ Validates configuration
   ├─ Packages workoutData object
   └─ Navigates to /start-workout with state
```

### During Workout

```
1. StartWorkoutPage receives workoutData
   └─ Via location.state from navigation

2. Initialize exercises array
   ├─ Convert exerciseData to exercise objects
   ├─ Set totalSets for each exercise
   ├─ Initialize empty completedSets arrays
   └─ Reorder based on cardio/abs preferences

3. Check for existing session
   ├─ Look in localStorage for ACTIVE_WORKOUT_SESSION
   ├─ If found and workout matches
   └─ Restore progress (exercises, currentSetIndex)

4. Display current set (flash card)
   ├─ Calculate which exercise based on currentSetIndex
   ├─ Calculate which set number
   └─ Show exercise name, set X of Y

5. User inputs weight and reps
   ├─ Mobile: Opens WeightRepsPicker modal
   └─ Desktop: Types into inputs

6. User completes set
   ├─ Creates completedSet object
   ├─ Adds to exercise.completedSets array
   ├─ Saves session to localStorage
   ├─ Starts rest timer
   └─ Advances to next set (currentSetIndex++)

7. Session persistence (on every change)
   ├─ Packages current state
   ├─ Includes exercises with progress
   └─ Saves to localStorage

8. User can:
   ├─ Navigate sets (Previous/Next)
   ├─ Edit from progress table
   ├─ Pause (saves session, goes home)
   └─ End workout early

9. All sets completed
   └─ Shows WorkoutSummary modal
```

### Saving Workout

```
1. WorkoutSummary displayed
   ├─ Shows stats (duration, sets, avg rest)
   ├─ Exercise breakdown
   └─ User can edit duration

2. User clicks "Save Workout"
   └─ Calls handleSaveWorkout({ duration, averageRest })

3. Format workout for Firebase
   ├─ Convert exercises to exerciseData format
   ├─ completedSets → sets: ["145x12", "145x10", ...]
   └─ Package metadata (timestamp, duration, stats)

4. Save to Firebase
   ├─ Add document to "workouts" collection
   └─ Document structure:
       {
         workoutName: String,
         muscleGroup: String,
         numberOfSets: Number,
         exerciseData: Object,
         note: String,
         timestamp: Number,
         duration: Number,
         averageRest: Number,
         completedSets: Number,
         totalSets: Number
       }

5. Cleanup
   ├─ Clear ACTIVE_WORKOUT_SESSION from localStorage
   └─ Navigate to /saved-workouts

6. User can view saved workout
   ├─ Navigate to /SavedWorkout/:id
   ├─ View details and stats
   ├─ Generate AI analysis
   └─ Edit if needed
```

### Template System

```
1. Create Template (from HypertrophyPage)
   ├─ User configures workout
   ├─ Clicks "Save as Template"
   └─ Opens template name dialog

2. Save to Firebase
   ├─ Convert exerciseData to template format
   ├─ Save to user's "templates" array
   └─ Structure:
       {
         id: String,
         name: String,
         muscleGroup: String,
         exercises: [
           { category: String, exerciseId: String, exerciseName: String }
         ],
         createdAt: ISO String,
         lastUsed: ISO String
       }

3. Load Template
   ├─ User selects from MyTemplatesPage or TemplateSelectionPage
   ├─ Navigate to /Hypertrophy?template={id}
   ├─ HypertrophyPage detects template parameter
   ├─ Calls loadTemplate(userId, templateId)
   ├─ Converts to exerciseData format
   └─ Populates UI

4. Template last used tracking
   └─ Updated when workout started from template
```

---

## State Management Patterns

### localStorage Usage

**Active Workout Draft** (HypertrophyPage):
```javascript
STORAGE_KEYS.ACTIVE_WORKOUT_DRAFT
{
  selectedMuscleGroup: String,
  numberOfSets: Number,
  exerciseData: Object,
  note: String,
  showCardio: Boolean,
  showAbs: Boolean,
  cardioAtTop: Boolean,
  absAtTop: Boolean,
  timestamp: Number
}
```

**Active Workout Session** (StartWorkoutPage):
```javascript
STORAGE_KEYS.ACTIVE_WORKOUT_SESSION
{
  workoutName: String,
  startTime: Number,
  currentSetIndex: Number,
  exercises: Array,           // With completedSets progress
  workoutData: Object         // Original config for restoration
}
```

**Favorite Exercises**:
```javascript
'favoriteExercises'
["Dumbbell Bench Press", "Pull Ups", "Barbell Squats", ...]
```

**Previous Custom Exercises**:
```javascript
'previousCustomExercises'
[
  { name: "Cable Crossovers", category: "chest", timestamp: Number },
  { name: "Hammer Curls", category: "back", timestamp: Number },
  ...
]
```

---

## Performance Considerations

### Current Optimizations
✅ useMemo for expensive calculations (WorkoutProgress, WorkoutSummary)
✅ useRef to prevent unnecessary re-initializations
✅ Conditional rendering (expandable sections)
✅ localStorage for offline capability

### Areas for Improvement
⚠️ Large component re-renders (HypertrophyPage)
⚠️ Excessive useEffect chains
⚠️ localStorage writes on every keystroke
⚠️ No code splitting for exercise database

---

## Security

### Authentication
- Google OAuth via Firebase Auth
- User-specific data queries (where userId == currentUser)

### Data Validation
- Input sanitization needed for custom exercise names
- Firebase security rules should restrict:
  - Users can only read/write their own data
  - Templates and workouts belong to authenticated users

### API Keys
- Firebase config uses environment variables (GOOD)
- OpenAI API key should be server-side (REVIEW NEEDED)

---

## Summary

The Gym Guide application is a comprehensive workout tracking system with:
- **7 major pages** for different user flows
- **20+ reusable components** for UI elements
- **Complete exercise database** (100+ exercises)
- **Template system** for workout customization
- **Real-time tracking** with session persistence
- **Firebase integration** for data storage
- **AI-powered** workout analysis

The codebase is functional but would benefit from:
1. Refactoring large components (HypertrophyPage, StartWorkoutPage)
2. Extracting custom hooks for shared logic
3. Creating utility modules for duplicated code
4. Adding performance optimizations (memoization, debouncing)
5. Implementing tests for critical paths

Total estimated codebase: **~11,500 lines** of React/JavaScript

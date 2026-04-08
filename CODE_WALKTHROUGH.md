# Gym Guide - Complete Code Walkthrough
**Last Updated:** April 7, 2026

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Architecture](#project-architecture)
4. [Application Flow](#application-flow)
5. [Entry Points & Routing](#entry-points--routing)
6. [State Management](#state-management)
7. [Core Pages (Detailed)](#core-pages-detailed)
8. [Key Components (Detailed)](#key-components-detailed)
9. [Services & Utilities](#services--utilities)
10. [Data Structures](#data-structures)
11. [Complete Data Flow](#complete-data-flow)
12. [Key Features Explained](#key-features-explained)
13. [Firebase Integration](#firebase-integration)
14. [Tips for Explaining](#tips-for-explaining)

---

## Project Overview

### What is Gym Guide?
A **mobile-first workout tracking application** that helps users plan, execute, and track their gym workouts with intelligent features like:
- Template-based workout creation
- Real-time workout tracking with rest timers
- Session recovery (continue where you left off)
- Progress tracking and history
- AI-powered workout analysis
- Previous workout comparison for progressive overload

### Key Design Principles
1. **Mobile-First:** Designed for use at the gym on a phone
2. **Minimal Friction:** Large buttons, drum pickers, no typing during workouts
3. **Never Lose Data:** Auto-saves everything to localStorage
4. **Smart Defaults:** Pre-filled exercises based on muscle group
5. **Flexible:** Support custom exercises, templates, and workout styles

---

## Tech Stack

### Core Framework
- **React 18.3.1** - Component-based UI
- **React Router 7.3.0** - Client-side routing
- **Vite 6.0.5** - Build tool (fast HMR, optimized builds)

### Styling
- **Tailwind CSS 4.1.3** - Utility-first CSS
- **@tailwindcss/vite** - Vite plugin for Tailwind

### Backend & Database
- **Firebase 11.6.0**
  - Firestore - NoSQL database
  - Authentication - Google OAuth
  - Hosting - Static site hosting

### Additional Libraries
- **@dnd-kit** (6.3.1) - Drag-and-drop for exercise reordering
- **date-fns** (4.1.0) - Date formatting utilities
- **recharts** (3.1.0) - Charts for progress visualization
- **openai** (5.5.1) - AI workout summaries
- **classnames** (2.5.1) - Conditional CSS classes

### Development Tools
- **ESLint** - Code linting
- **Autoprefixer** - CSS vendor prefixes

---

## Project Architecture

### Folder Structure
```
src/
├── index.js                    # React entry point
├── App.js                      # Root component
├── Main.js                     # Router configuration
├── index.css                   # Global Tailwind styles
│
├── pages/                      # Full page components
│   ├── LandingPage.js          # Home/login
│   ├── TemplateSelectionPage.js # Browse templates
│   ├── HypertrophyPage.js      # Main workout builder (1400+ lines!)
│   ├── StartWorkoutPage.js     # Live workout tracker (700+ lines!)
│   ├── SavedWorkout.js         # View completed workout
│   ├── ListOfWorkouts.js       # Workout history
│   ├── MyTemplatesPage.js      # Manage templates
│   ├── MyExercisesPage.js      # Exercise library
│   └── TrainingStyle.js        # Training type selection
│
├── components/                 # Reusable UI components
│   ├── WeightRepsPicker.js     # Main input modal (drum or keypad)
│   ├── DrumPicker.js           # iOS-style scroll picker
│   ├── NumPad.js               # On-screen number pad
│   ├── WorkoutProgress.js      # Progress tracker during workout
│   ├── WorkoutSummary.js       # Post-workout summary
│   ├── WorkoutHeader.js        # Workout title and reset button (NEW!)
│   ├── WorkoutActionButtons.js # Start/Save buttons with sticky behavior (NEW!)
│   ├── WorkflowChoiceCards.js  # Initial workflow selection cards (NEW!)
│   ├── CustomWorkflowSection.js # Custom workout configuration form (NEW!)
│   ├── TemplateWorkflowSection.js # Template-based workflow form (NEW!)
│   ├── MuscleGroupWorkout.js   # Exercise table container
│   ├── WorkoutTable.js         # Drag-and-drop exercise table
│   ├── TableRow.js             # Individual exercise row
│   ├── ExerciseAutocomplete.js # Exercise search/select
│   ├── OptionalWorkoutSections.js # Cardio/Abs sections
│   ├── TemplateSelector.js     # Template dropdown
│   ├── TemplateCard.js         # Template display card
│   ├── ResumeWorkoutModal.js   # Global resume modal
│   ├── Navbar.js               # Navigation bar
│   └── ...
│
├── context/                    # Global state management
│   └── WorkoutContext.js       # Centralized workout state (NEW!)
│
├── config/                     # Configuration files
│   ├── firebase.js             # Firebase init
│   ├── constants.js            # App constants
│   ├── exerciseConfig.js       # Exercise database (860+ lines!)
│   ├── exerciseNames.js        # Exercise name mappings
│   ├── workoutSettings.js      # Workout settings (rest times, etc.)
│   ├── googleAuth.js           # Google OAuth
│   └── Colors.js               # Theme colors
│
├── services/                   # Service layer
│   └── storageService.js       # localStorage wrapper
│
├── hooks/                      # Custom React hooks
│   ├── useIsMobile.js          # Mobile detection
│   ├── useWorkoutHistory.js    # Fetch workout history
│   ├── useTemplateLoader.js    # Load templates
│   ├── useWorkoutDraft.js      # Draft persistence
│   ├── useWorkoutSaver.js      # Save workouts
│   ├── useExerciseData.js      # Exercise data state management (NEW!)
│   └── useStickyButton.js      # Sticky button scroll behavior (NEW!)
│
├── utils/                      # Utility functions
│   ├── categoryDetection.js    # Auto-detect exercise categories
│   ├── templateHelpers.js      # Template operations
│   ├── summaryUtil.js          # AI summary generation
│   ├── setHelpers.js           # Set data parsing
│   ├── parsing.js              # Data parsing
│   └── sessionPersistence.js   # Robust session save/load (NEW!)
│
└── types/                      # Type definitions
    └── workout.js              # Workout data structures & validators
```

---

## Application Flow

### High-Level User Journey
```
┌─────────────────┐
│  Landing Page   │ User arrives, can login with Google
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Template Select  │ Choose pre-made template or create custom
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ HypertrophyPage │ Configure workout:
│   (Builder)     │ - Select muscle group
│                 │ - Choose set count
│                 │ - Select/customize exercises
│                 │ - Add notes
└────────┬────────┘
         │
         │ Click "Start Workout"
         ▼
┌─────────────────┐
│StartWorkoutPage │ Track sets in real-time:
│  (Live Tracker) │ - Flash card interface
│                 │ - Input weight/reps
│                 │ - Rest timer
│                 │ - Progress tracking
└────────┬────────┘
         │
         │ Complete all sets
         ▼
┌─────────────────┐
│ Workout Summary │ Review and save:
│     (Modal)     │ - Duration
│                 │ - Sets completed
│                 │ - Average rest
└────────┬────────┘
         │
         │ Save to Firebase
         ▼
┌─────────────────┐
│  Saved Workout  │ View details, analytics, AI summary
└─────────────────┘
```

---

## Entry Points & Routing

### 1. index.js (9 lines)
**Purpose:** Application entry point
```javascript
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const el = document.getElementById('root');
const root = ReactDOM.createRoot(el);
root.render(<App />);
```

### 2. App.js (11 lines)
**Purpose:** Root component wrapper
```javascript
import Main from "./Main";

function App() {
  return (
    <div>
      <Main className="font-sans" />
    </div>
  );
}
```

### 3. Main.js (40 lines)
**Purpose:** Router setup and global providers

**Key Responsibilities:**
- Wraps entire app in `WorkoutProvider` (global state)
- Sets up `BrowserRouter` for client-side routing
- Displays `ResumeWorkoutModal` globally
- Defines all application routes

**Route Table:**
| Path | Component | Purpose |
|------|-----------|---------|
| `/` | LandingPage | Home page with login |
| `/Templates` | TemplateSelectionPage | Browse workout templates |
| `/MyTemplates` | MyTemplatesPage | Manage user's templates |
| `/TrainingStyle` | TrainingStylePage | Select training type |
| `/Hypertrophy` | HypertrophyPage | **Main workout builder** |
| `/start-workout` | StartWorkoutPage | **Live workout tracking** |
| `/SavedWorkout/:workoutId` | SavedWorkout | View completed workout |
| `/SavedWorkouts` | ListOfWorkouts | Workout history |
| `/MyExercises` | MyExercisesPage | Exercise library |
| `/ColorDesign` | ColorDesignPage | Theme/color tester |

**Code:**
```javascript
function Main() {
  return (
    <WorkoutProvider>  {/* Global state wrapper */}
      <BrowserRouter>
        <ResumeWorkoutModal />  {/* Global modal */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/Hypertrophy" element={<HypertrophyPage />} />
          <Route path="/start-workout" element={<StartWorkoutPage />} />
          {/* ... other routes */}
        </Routes>
      </BrowserRouter>
    </WorkoutProvider>
  );
}
```

---

## State Management

### WorkoutContext.js - Centralized State
**Location:** `src/context/WorkoutContext.js`

**Why It Exists:**
Previously, HypertrophyPage had **24+ useState calls** scattered everywhere. This caused:
- Props drilling through 5+ component levels
- Duplicate state management
- Hard to debug
- Difficult to add features

**Solution:** Context API for centralized state management.

### State Categories

#### 1. Core Workout State
```javascript
const [workout, setWorkout] = useState(() => createWorkout());

// workout object structure:
{
  workoutName: 'Workout',          // Display name
  selectedMuscleGroup: 'chest',    // chest | back | legs | shoulders | custom
  numberOfSets: 4,                 // 3 | 4 | 5 | 'custom'
  exerciseData: {                  // Key-value pairs of exercises
    'exercise_1': {
      exerciseName: 'Bench Press',
      sets: ['135x12', '185x10', '225x8', '225x8']
    },
    'exercise_2': {
      exerciseName: 'Incline Press',
      sets: ['100x12', '120x10', '140x8', '140x8']
    }
  },
  note: '',                        // Workout notes
  showCardio: false,               // Include cardio section
  showAbs: false,                  // Include abs section
  cardioAtTop: false,              // Position cardio at top
  absAtTop: false,                 // Position abs at top
  templateId: null,                // Reference to template
  templateName: null,
  workoutDate: '2026-04-02'       // YYYY-MM-DD
}
```

#### 2. Workflow State
```javascript
const [workflowMode, setWorkflowMode] = useState('choose');
// 'choose' - Initial selection screen
// 'template' - Using a template
// 'custom' - Custom workout

const [customMuscleGroupName, setCustomMuscleGroupName] = useState('');
const [customSetCount, setCustomSetCount] = useState('');
const [customRepCount, setCustomRepCount] = useState('');
```

#### 3. Template State
```javascript
const [loadedTemplate, setLoadedTemplate] = useState(null);
const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
const [selectedTemplateFromDropdown, setSelectedTemplateFromDropdown] = useState(null);
```

#### 4. UI State
```javascript
const [isSaving, setIsSaving] = useState(false);
const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
```

#### 5. History & Favorites
```javascript
const [previousWorkoutData, setPreviousWorkoutData] = useState(null);
const [previousCustomExercises, setPreviousCustomExercises] = useState([]);
const [favoriteExercises, setFavoriteExercises] = useState([]);
```

### Computed Values (useMemo)
```javascript
// Resolve custom muscle group name
const actualMuscleGroup = useMemo(() => {
  if (workout.selectedMuscleGroup === 'custom' && customMuscleGroupName) {
    return customMuscleGroupName;
  }
  return workout.selectedMuscleGroup;
}, [workout.selectedMuscleGroup, customMuscleGroupName]);

// Resolve custom set count
const actualNumberOfSets = useMemo(() => {
  if (workout.numberOfSets === 'custom' && customSetCount) {
    return parseInt(customSetCount);
  }
  return workout.numberOfSets;
}, [workout.numberOfSets, customSetCount]);

// Check if workout is ready to start
const isWorkoutConfigured = useMemo(() => {
  const hasMuscleGroup = workout.selectedMuscleGroup &&
    (workout.selectedMuscleGroup !== 'custom' || customMuscleGroupName.trim());
  const hasSets = workout.numberOfSets &&
    (workout.numberOfSets !== 'custom' || (customSetCount && parseInt(customSetCount) > 0));
  return hasMuscleGroup && hasSets;
}, [workout.selectedMuscleGroup, customMuscleGroupName, workout.numberOfSets, customSetCount]);
```

### Actions (Exported Functions)
```javascript
// Update entire workout
const updateWorkout = useCallback((updates) => {
  setWorkout(prev => ({ ...prev, ...updates }));
}, []);

// Update single exercise
const updateExercise = useCallback((exerciseKey, exerciseData) => {
  setWorkout(prev => ({
    ...prev,
    exerciseData: {
      ...prev.exerciseData,
      [exerciseKey]: exerciseData,
    },
  }));
}, []);

// Remove exercise
const removeExercise = useCallback((exerciseKey) => {
  setWorkout(prev => {
    const { [exerciseKey]: removed, ...remaining } = prev.exerciseData;
    return { ...prev, exerciseData: remaining };
  });
}, []);

// Reset everything
const resetWorkout = useCallback(() => {
  setWorkout(createWorkout());
  setWorkflowMode('choose');
  // ... clear all state
  clearAllWorkoutData();
}, []);

// Load from template or history
const loadWorkout = useCallback((workoutData) => {
  if (isValidWorkout(workoutData)) {
    setWorkout(workoutData);
  }
}, []);
```

### Auto-Persistence
```javascript
useEffect(() => {
  // Don't save empty workouts
  if (!workout.selectedMuscleGroup && !workout.numberOfSets) return;

  // Don't save while actively loading template
  if (isLoadingTemplate) return;

  // Save draft to localStorage
  const draft = {
    ...workout,
    customMuscleGroupName,
    customSetCount,
    workflowMode,
  };

  workoutDraft.save(draft);
}, [workout, customMuscleGroupName, customSetCount, workflowMode, isLoadingTemplate]);
```

**Bug Fix (April 7, 2026):** Previously had `if (isLoadingTemplate || loadedTemplate)` which prevented saving after a template was loaded. This caused data loss when the page refreshed. Now correctly only blocks during active loading.

### Using the Context
```javascript
// In any component:
import { useWorkout } from '../context/WorkoutContext';

function MyComponent() {
  const {
    workout,
    updateWorkout,
    updateExercise,
    actualMuscleGroup,
    isWorkoutConfigured
  } = useWorkout();

  // Use state and actions...
}
```

---

## Core Pages (Detailed)

### 1. LandingPage.js
**Purpose:** Entry point with authentication

**Features:**
- Google OAuth login button
- "Get Started" navigation
- Gradient background
- Responsive design

**Key Function:**
```javascript
const handleLogin = async () => {
  try {
    const user = await loginWithGoogle();
    if (user) {
      console.log('Logged in as:', user.displayName);
      navigate('/Templates');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

**UI:**
```
Full-screen gradient (sky-300 to stone-300)
  └─ Centered card
      ├─ Title: "Jonathan's Gym Guide"
      ├─ Subtitle: "An in-depth fitness guide..."
      └─ Buttons: [Get Started] [Sign in with Google]
```

---

### 2. HypertrophyPage.js (1,890 lines - recently refactored!)
**Purpose:** Main workout builder - configure exercises before starting

**State Management:** Uses `useWorkout()` hook for global state

**Recent Refactoring (April 2026):**
This page was heavily refactored to extract reusable components and hooks:
- **WorkoutHeader** - Title, loading state, reset button
- **WorkflowChoiceCards** - Initial workflow selection UI
- **CustomWorkflowSection** - Custom workout configuration form  
- **TemplateWorkflowSection** - Template-based workflow form
- **WorkoutActionButtons** - Start/Save buttons with sticky scroll behavior
- **useExerciseData** - Exercise state management hook
- **useStickyButton** - Sticky button scroll detection hook

A 688-line backup (`HypertrophyPage.backup.js`) was created during refactoring.

**Key Sections:**

#### A. Muscle Group Selection
```javascript
<DropDown
  options={MUSCLE_GROUP_OPTIONS}  // Chest, Back, Legs, Shoulders, Custom
  value={workout.selectedMuscleGroup}
  onChange={(value) => updateWorkout({ selectedMuscleGroup: value })}
/>

{/* Custom muscle group input */}
{workout.selectedMuscleGroup === 'custom' && (
  <MuscleGroupAutocomplete
    value={customMuscleGroupName}
    onChange={setCustomMuscleGroupName}
    previousMuscleGroups={previousCustomMuscleGroups}
  />
)}
```

#### B. Set Count Configuration
```javascript
<DropDown
  options={SET_RANGE_OPTIONS}  // 3x15, 4x12, 5x8, Custom
  value={workout.numberOfSets}
  onChange={(value) => updateWorkout({ numberOfSets: value })}
/>

{/* Custom set count */}
{workout.numberOfSets === 'custom' && (
  <input
    type="number"
    value={customSetCount}
    onChange={(e) => setCustomSetCount(e.target.value)}
  />
)}
```

#### C. Exercise Configuration
Uses `MuscleGroupWorkout` component which contains:
- Exercise table with drag-and-drop reordering
- Exercise autocomplete for each row
- Set input fields for each exercise
- Previous workout data display
- Add/remove exercise buttons

#### D. Optional Sections
```javascript
<OptionalWorkoutSections
  showCardio={workout.showCardio}
  showAbs={workout.showAbs}
  cardioAtTop={workout.cardioAtTop}
  absAtTop={workout.absAtTop}
  exerciseData={workout.exerciseData}
  onToggleCardio={() => updateWorkout({ showCardio: !workout.showCardio })}
  onToggleAbs={() => updateWorkout({ showAbs: !workout.showAbs })}
  // ... other props
/>
```

#### E. Template Integration
```javascript
// Load template from URL parameter
useEffect(() => {
  const templateId = searchParams.get('template');
  if (templateId) {
    setIsLoadingTemplate(true);
    loadTemplate(templateId).then(template => {
      if (template) {
        const exerciseData = templateToExerciseData(template, numberOfSets);
        updateWorkout({
          selectedMuscleGroup: template.muscleGroup,
          exerciseData,
          templateId: template.id,
          templateName: template.name
        });
      }
      setIsLoadingTemplate(false);
    });
  }
}, [searchParams]);
```

#### F. Previous Workout Loading
```javascript
useEffect(() => {
  if (!workout.selectedMuscleGroup || !auth.currentUser) return;

  // Query Firebase for last workout of this muscle group
  const q = query(
    collection(db, 'workouts'),
    where('userId', '==', auth.currentUser.uid),
    where('muscleGroup', '==', actualMuscleGroup),
    orderBy('timestamp', 'desc'),
    limit(1)
  );

  getDocs(q).then(snapshot => {
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      setPreviousWorkoutData(data);
    }
  });
}, [workout.selectedMuscleGroup, actualMuscleGroup]);
```

#### G. Start Workout
```javascript
const handleStartWorkout = () => {
  // Validate
  if (!isWorkoutConfigured) {
    alert('Please configure muscle group and sets');
    return;
  }

  if (Object.keys(workout.exerciseData).length === 0) {
    alert('Please add at least one exercise');
    return;
  }

  // Navigate with workout data
  navigate('/start-workout', {
    state: {
      workoutData: {
        ...workout,
        workoutName: actualMuscleGroup,
        customMuscleGroupName,
        customSetCount
      }
    }
  });
};
```

#### H. Save as Template
```javascript
const handleSaveAsTemplate = async () => {
  const templateName = prompt('Template name:');
  if (!templateName) return;

  // Validate
  const hasEmptyExercises = Object.values(workout.exerciseData).some(
    ex => !ex.exerciseName || ex.exerciseName.trim() === ''
  );

  if (hasEmptyExercises) {
    alert('Please provide names for all exercises');
    return;
  }

  // Save to Firebase
  await addDoc(collection(db, 'templates'), {
    userId: auth.currentUser.uid,
    name: templateName,
    muscleGroup: actualMuscleGroup,
    exercises: workout.exerciseData,
    createdAt: new Date().toISOString(),
    lastUsed: null
  });

  alert('Template saved!');
};
```

---

### 3. StartWorkoutPage.js (700+ lines)
**Purpose:** Real-time workout tracking with flash card interface

**Architecture Transformation:**
Converts flat `exerciseData` object → array of exercise objects with progress tracking

**Before (HypertrophyPage format):**
```javascript
exerciseData = {
  'exercise_1': { exerciseName: 'Bench Press', sets: [] },
  'exercise_2': { exerciseName: 'Incline Press', sets: [] }
}
```

**After (StartWorkoutPage format):**
```javascript
exercises = [
  {
    key: 'exercise_1',
    exerciseName: 'Bench Press',
    totalSets: 4,
    completedSets: [
      {
        setNumber: 1,
        weight: '135',
        reps: '12',
        completedAt: 1234567890,
        restDuration: 90
      }
    ]
  },
  {
    key: 'exercise_2',
    exerciseName: 'Incline Press',
    totalSets: 4,
    completedSets: []
  }
]
```

#### State Management
```javascript
const [exercises, setExercises] = useState([]);
const [currentSetIndex, setCurrentSetIndex] = useState(0);  // Global set counter
const [currentSetData, setCurrentSetData] = useState({ weight: '', reps: '' });
const [lastSetCompletedTime, setLastSetCompletedTime] = useState(null);
const [restTimeElapsed, setRestTimeElapsed] = useState(0);
const [pickerOpen, setPickerOpen] = useState(false);
const [showSummary, setShowSummary] = useState(false);
const workoutStartRef = useRef(Date.now());  // Persistent start time
```

#### Initialization
```javascript
useEffect(() => {
  if (!workoutData) {
    navigate('/');
    return;
  }

  // Check for saved session
  const savedSession = workoutSession.get();
  if (savedSession && savedSession.workoutName === workoutName) {
    // Restore session
    setExercises(savedSession.exercises);
    setCurrentSetIndex(savedSession.currentSetIndex || 0);
    workoutStartRef.current = savedSession.startTime;
    return;
  }

  // Initialize from workoutData
  const exerciseArray = [];
  const mainKeys = Object.keys(workoutData.exerciseData || {})
    .filter(k => !k.startsWith('cardio') && !k.startsWith('abs'));

  mainKeys.forEach(key => {
    const exercise = workoutData.exerciseData[key];
    exerciseArray.push({
      key,
      exerciseName: exercise.exerciseName,
      totalSets: workoutData.numberOfSets || 4,
      completedSets: []
    });
  });

  // Add cardio/abs if enabled
  if (workoutData.showCardio) {
    exerciseArray.push({
      key: 'cardio_section',
      exerciseName: 'Treadmill',
      totalSets: 1,
      completedSets: []
    });
  }

  // Reorder based on preferences
  const finalExercises = [];
  if (workoutData.cardioAtTop) finalExercises.push(...cardioExercises);
  if (workoutData.absAtTop) finalExercises.push(...absExercises);
  finalExercises.push(...mainExercises);
  if (!workoutData.cardioAtTop) finalExercises.push(...cardioExercises);
  if (!workoutData.absAtTop) finalExercises.push(...absExercises);

  setExercises(finalExercises);
}, [workoutData]);
```

#### Session Persistence
```javascript
useEffect(() => {
  if (exercises.length > 0) {
    const session = {
      workoutName,
      startTime: workoutStartRef.current,
      currentSetIndex,
      exercises,
      workoutData: {
        selectedMuscleGroup: workoutData?.selectedMuscleGroup,
        numberOfSets: workoutData?.numberOfSets,
        showCardio: workoutData?.showCardio,
        showAbs: workoutData?.showAbs,
        note: workoutData?.note
      }
    };
    workoutSession.save(session);
  }
}, [exercises, currentSetIndex, workoutName]);
```

#### Current Set Calculation
```javascript
// Calculate which exercise and set number based on currentSetIndex
let currentExerciseIndex = 0;
let currentSetNumber = 0;
let accumulatedSets = 0;

for (let i = 0; i < exercises.length; i++) {
  if (currentSetIndex < accumulatedSets + exercises[i].totalSets) {
    currentExerciseIndex = i;
    currentSetNumber = currentSetIndex - accumulatedSets + 1;
    break;
  }
  accumulatedSets += exercises[i].totalSets;
}

const currentExercise = exercises[currentExerciseIndex];
```

#### Complete Set
```javascript
const handleCompleteSet = () => {
  if (!currentExercise || (!currentSetData.weight && !currentSetData.reps)) return;

  const completedSet = {
    setNumber: currentSetNumber,
    weight: currentSetData.weight || '',
    reps: currentSetData.reps || '',
    completedAt: Date.now(),
    restDuration: restTimeElapsed
  };

  // Update exercise
  const updatedExercises = [...exercises];

  // Check if editing existing set
  const existingSetIndex = updatedExercises[currentExerciseIndex]
    .completedSets.findIndex(s => s.setNumber === currentSetNumber);

  if (existingSetIndex >= 0) {
    updatedExercises[currentExerciseIndex].completedSets[existingSetIndex] = completedSet;
  } else {
    updatedExercises[currentExerciseIndex].completedSets.push(completedSet);
  }

  setExercises(updatedExercises);
  setCurrentSetData({ weight: '', reps: '' });

  // Start rest timer
  setLastSetCompletedTime(Date.now());
  setRestTimeElapsed(0);

  // Advance to next set
  if (currentSetIndex < totalSets - 1) {
    setCurrentSetIndex(currentSetIndex + 1);
  } else {
    setShowSummary(true);  // Workout complete!
  }
};
```

#### Rest Timer
```javascript
useEffect(() => {
  if (lastSetCompletedTime) {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastSetCompletedTime) / 1000);
      setRestTimeElapsed(elapsed);
    }, 100);
    return () => clearInterval(interval);
  }
}, [lastSetCompletedTime]);

// UI indicator
{lastSetCompletedTime && (
  <div className="absolute top-4 right-4">
    <div className={`w-3 h-3 rounded-full ${
      restTimeElapsed >= 180 ? 'bg-green-500 animate-pulse' : 'bg-red-500'
    }`} />
    <span>
      {restTimeElapsed >= 180 ? 'Ready!' : `Rest: ${formatTime(180 - restTimeElapsed)}`}
    </span>
  </div>
)}
```

#### Save Workout
```javascript
const handleSaveWorkout = async ({ duration, averageRest }) => {
  try {
    const workoutToSave = {
      workoutName,
      muscleGroup: workoutData.selectedMuscleGroup,
      numberOfSets: workoutData.numberOfSets,
      exerciseData: {},
      note: workoutData.note || '',
      timestamp: workoutStartRef.current,
      duration,
      averageRest,
      completedSets: completedSetsCount,
      totalSets
    };

    // Convert completedSets back to exerciseData format
    exercises.forEach(exercise => {
      workoutToSave.exerciseData[exercise.key] = {
        exerciseName: exercise.exerciseName,
        sets: exercise.completedSets.map(set => {
          if (set.weight) {
            return `${set.weight}x${set.reps}`;
          }
          return set.reps;
        })
      };
    });

    await addDoc(collection(db, 'workouts'), workoutToSave);

    // Clear session
    workoutSession.clear();

    navigate('/SavedWorkouts');
  } catch (error) {
    console.error('Error saving workout:', error);
    alert('Failed to save workout. Please try again.');
  }
};
```

#### UI Structure
```javascript
<div className="min-h-screen">
  {/* Sticky Header */}
  <div className="sticky top-0 bg-white shadow">
    <h1>{workoutName}</h1>
    <p>⏱️ {formatDuration(elapsedSeconds)}</p>
    <button onClick={handlePauseWorkout}>⏸️ Pause</button>
    <button onClick={handleEndWorkout}>🛑 End</button>
  </div>

  {/* Progress Tracker */}
  <WorkoutProgress
    exercises={exercises}
    currentSetIndex={currentSetIndex}
    onUpdateSet={handleUpdateSetFromTable}
    onOpenPicker={handleOpenPickerFromTable}
  />

  {/* Flash Card */}
  <div className="flash-card">
    <h2>{currentExercise.exerciseName}</h2>
    <p>Set {currentSetNumber} of {currentExercise.totalSets}</p>

    {/* Input Fields */}
    {isMobile ? (
      <button onClick={() => handleOpenPicker('weight')}>
        {currentSetData.weight || '---'}
      </button>
    ) : (
      <input
        type="number"
        value={currentSetData.weight}
        onChange={(e) => setCurrentSetData({...currentSetData, weight: e.target.value})}
      />
    )}

    {/* Complete Button */}
    <button onClick={handleCompleteSet}>
      ✓ Complete Set
    </button>

    {/* Navigation */}
    <button onClick={handlePrevious} disabled={currentSetIndex === 0}>
      ← Previous Set
    </button>
  </div>

  {/* Weight/Reps Picker */}
  <WeightRepsPicker
    isOpen={pickerOpen}
    onClose={() => setPickerOpen(false)}
    weight={currentSetData.weight}
    reps={currentSetData.reps}
    onSave={(weight, reps) => {
      setCurrentSetData({ weight, reps });
      setPickerOpen(false);
    }}
    exerciseType={isCardio ? 'cardio' : 'weight'}
  />

  {/* Summary Modal */}
  {showSummary && (
    <WorkoutSummary
      workoutName={workoutName}
      startTime={workoutStartRef.current}
      endTime={Date.now()}
      exercises={exercises}
      onSave={handleSaveWorkout}
      onDiscard={handleDiscardWorkout}
    />
  )}
</div>
```

---

### 4. ListOfWorkouts.js
**Purpose:** View workout history

**Features:**
- Chronological list of workouts
- Filter by muscle group
- Quick stats (sets, duration)
- Navigate to detailed view

**Firebase Query:**
```javascript
const q = query(
  collection(db, 'workouts'),
  where('userId', '==', auth.currentUser.uid),
  orderBy('timestamp', 'desc')
);

const snapshot = await getDocs(q);
const workouts = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

---

### 5. SavedWorkout.js
**Purpose:** View individual workout details

**Features:**
- Full exercise breakdown
- Sets with weight/reps
- Workout notes
- AI-generated summary
- Progress charts

**Route:** `/SavedWorkout/:workoutId`

**Data Loading:**
```javascript
useEffect(() => {
  const loadWorkout = async () => {
    const docRef = doc(db, 'workouts', workoutId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      setWorkout(snapshot.data());
    }
  };

  loadWorkout();
}, [workoutId]);
```

---

## Key Components (Detailed)

### WeightRepsPicker.js
**Purpose:** Mobile-optimized input modal for weight and reps

**Props:**
```javascript
{
  isOpen: Boolean,
  onClose: Function,
  weight: String,
  reps: String,
  onSave: Function(weight, reps),
  exerciseType: 'weight' | 'bodyweight' | 'timed' | 'cardio',
  initialField: 'weight' | 'reps',
  customLabel: String (optional)
}
```

**Features:**
- **Two input modes:** Scroll (DrumPicker) or Keypad (NumPad)
- **Tab switcher** to change modes
- **Exercise type detection** (changes labels and ranges)
- **Modal slides up from bottom** (iOS-style)

**Input Mode: Scroll**
```
┌─────────────────────────────┐
│ Cancel  Select Value   Done │
├─────────────────────────────┤
│  [Scroll]   [Keypad]        │ ← Tabs
├─────────────────────────────┤
│                             │
│  Weight (lbs)   Reps        │
│   ┌──────┐    ┌──────┐     │
│   │  100 │    │   8  │     │
│   │  105 │    │   9  │     │
│   │  110 │    │  10  │     │ ← DrumPickers
│   │ [115]│    │ [12] │     │
│   │  120 │    │  13  │     │
│   │  125 │    │  14  │     │
│   └──────┘    └──────┘     │
│                             │
└─────────────────────────────┘
```

**Input Mode: Keypad**
```
┌─────────────────────────────┐
│ Cancel  Select Value   Done │
├─────────────────────────────┤
│  [Scroll]   [Keypad]        │
├─────────────────────────────┤
│  Weight (lbs)    Reps       │
│  ┌─────────┐  ┌─────────┐  │
│  │  [115]  │  │   12    │  │ ← Click to activate
│  └─────────┘  └─────────┘  │
│                             │
│       ┌───┬───┬───┐        │
│       │ 1 │ 2 │ 3 │        │
│       ├───┼───┼───┤        │
│       │ 4 │ 5 │ 6 │        │
│       ├───┼───┼───┤        │ ← NumPad
│       │ 7 │ 8 │ 9 │        │
│       ├───┼───┼───┤        │
│       │ . │ 0 │ ⌫ │        │
│       └───┴───┴───┘        │
└─────────────────────────────┘
```

**Exercise Type Adaptations:**
```javascript
// exerciseType: 'weight'
Weight (lbs): 0-500, step 0.5
Reps: 0-100, step 1

// exerciseType: 'bodyweight'
Reps: 0-100, step 1 (no weight)

// exerciseType: 'timed'
Seconds: 0-300, step 1

// exerciseType: 'cardio'
Distance (mi): 0-20, step 0.1
Time (min): 0-180, step 0.1
```

**Code:**
```javascript
function WeightRepsPicker({ isOpen, onClose, weight, reps, onSave, exerciseType = 'weight', initialField = 'weight' }) {
  const [selectedWeight, setSelectedWeight] = useState(weight || '');
  const [selectedReps, setSelectedReps] = useState(reps || '');
  const [inputMode, setInputMode] = useState('keypad');  // 'scroll' or 'keypad'
  const [activeField, setActiveField] = useState('weight');

  const handleDone = () => {
    onSave(selectedWeight, selectedReps);
    onClose();
  };

  const showWeight = exerciseType === 'weight';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[100]">
        {/* Header */}
        <div className="flex justify-between px-6 py-4">
          <button onClick={onClose}>Cancel</button>
          <h3>Select Value</h3>
          <button onClick={handleDone}>Done</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button onClick={() => setInputMode('scroll')}>Scroll</button>
          <button onClick={() => setInputMode('keypad')}>Keypad</button>
        </div>

        {/* Content */}
        {inputMode === 'scroll' ? (
          <div className="flex gap-8">
            {showWeight && (
              <DrumPicker
                value={parseFloat(selectedWeight) || 0}
                onChange={(val) => setSelectedWeight(val.toString())}
                min={0}
                max={500}
                step={0.5}
                label="Weight (lbs)"
              />
            )}
            <DrumPicker
              value={parseFloat(selectedReps) || 0}
              onChange={(val) => setSelectedReps(val.toString())}
              min={0}
              max={100}
              step={1}
              label="Reps"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Input Fields */}
            <div className="flex gap-3 mb-4">
              {showWeight && (
                <button
                  onClick={() => setActiveField('weight')}
                  className={activeField === 'weight' ? 'active' : ''}
                >
                  {selectedWeight || '\u00A0'}
                </button>
              )}
              <button
                onClick={() => setActiveField('reps')}
                className={activeField === 'reps' ? 'active' : ''}
              >
                {selectedReps || '\u00A0'}
              </button>
            </div>

            {/* NumPad */}
            <NumPad
              value={activeField === 'weight' ? selectedWeight : selectedReps}
              onChange={(val) => {
                if (activeField === 'weight') {
                  setSelectedWeight(val);
                } else {
                  setSelectedReps(val);
                }
              }}
              allowDecimals={activeField === 'weight' || exerciseType === 'cardio'}
            />
          </div>
        )}
      </div>
    </>
  );
}
```

---

### DrumPicker.js
**Purpose:** iOS-style scrollable value picker

**Props:**
```javascript
{
  value: Number,
  onChange: Function(newValue),
  min: Number,
  max: Number,
  step: Number,
  label: String,
  unit: String
}
```

**Technical Implementation:**
```javascript
// Generate value array
const coreValues = [];
for (let i = min; i <= max; i += step) {
  coreValues.push(i);
}
// Triple it for infinite scroll illusion
const values = [...coreValues, ...coreValues, ...coreValues];

const ITEM_HEIGHT = 44;  // px

// Scrolling logic
const handleScroll = (e) => {
  const scrollTop = e.target.scrollTop;
  const index = Math.round(scrollTop / ITEM_HEIGHT);
  const newValue = values[index];

  if (newValue !== value) {
    onChange(newValue);
    triggerHaptic();  // Vibration feedback
  }
};

// Haptic feedback
const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
};
```

**UI:**
```
┌──────────┐
│   100    │  ← Fade out
│   105    │
│   110    │
│  [115]   │  ← Highlighted (current value)
│   120    │
│   125    │
│   130    │  ← Fade out
└──────────┘
```

---

### NumPad.js
**Purpose:** On-screen numeric keypad

**Props:**
```javascript
{
  value: String,
  onChange: Function(newValue),
  allowDecimals: Boolean
}
```

**Layout:**
```
┌───┬───┬───┐
│ 1 │ 2 │ 3 │
├───┼───┼───┤
│ 4 │ 5 │ 6 │
├───┼───┼───┤
│ 7 │ 8 │ 9 │
├───┼───┼───┤
│ . │ 0 │ ⌫ │
└───┴───┴───┘

If !allowDecimals:
│   │ 0 │ ⌫ │
```

**Functions:**
```javascript
const handleNumberClick = (num) => {
  // Prevent leading zeros
  if (value === '0' && num === '0') return;
  if (value === '' && num === '0') return;

  onChange(value + num);
};

const handleDecimal = () => {
  if (value.includes('.')) return;
  onChange(value === '' ? '0.' : value + '.');
};

const handleBackspace = () => {
  onChange(value.slice(0, -1));
};
```

---

### WorkoutProgress.js
**Purpose:** Visual progress tracker during workout

**Props:**
```javascript
{
  exercises: Array,
  currentSetIndex: Number,
  onUpdateSet: Function(exerciseIndex, setNumber, field, value),
  onOpenPicker: Function(exerciseIndex, setNumber, field, currentWeight, currentReps),
  onReorderExercise: Function(index, direction)
}
```

**Features:**
- Overall progress bar
- Exercise-by-exercise breakdown
- Expandable table for each exercise
- Edit completed sets inline
- Color-coded: gray (incomplete), blue (current), green (complete)

**UI:**
```
┌──────────────────────────────────┐
│ Progress: 8/16 sets (50%)        │
│ ████████░░░░░░░░                 │
└──────────────────────────────────┘
│
├─ ✓ Bench Press (4/4) ────────────┐ ← Click to expand
│  ▼ Set 1: 135x12                 │
│    Set 2: 185x10                  │
│    Set 3: 225x8                   │
│    Set 4: 225x8                   │
└───────────────────────────────────┘
│
├─ ◉ Incline Press (2/4) ──────────┐ ← Current exercise
│  ▼ Set 1: 100x12                 │
│    Set 2: 120x10                  │
│    Set 3: [Edit] [Copy Prev]     │
│    Set 4: [Edit] [Copy Prev]     │
└───────────────────────────────────┘
│
└─ ○ Cable Flies (0/4) ────────────┐ ← Not started
   Set 1-4: ---
```

**Code:**
```javascript
function WorkoutProgress({ exercises, currentSetIndex, onUpdateSet, onOpenPicker }) {
  const [expandedExercises, setExpandedExercises] = useState(new Set());

  // Calculate stats
  const totalSets = exercises.reduce((sum, ex) => sum + ex.totalSets, 0);
  const completedSets = exercises.reduce((sum, ex) => sum + ex.completedSets.length, 0);
  const percentComplete = Math.round((completedSets / totalSets) * 100);

  // Calculate current exercise
  let accumulatedSets = 0;
  const exerciseStatuses = exercises.map((exercise, index) => {
    const isComplete = exercise.completedSets.length === exercise.totalSets;
    const isCurrent = currentSetIndex >= accumulatedSets &&
                      currentSetIndex < accumulatedSets + exercise.totalSets;
    accumulatedSets += exercise.totalSets;

    return { isComplete, isCurrent };
  });

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      {/* Progress Header */}
      <div className="mb-4">
        <p className="font-semibold">Progress: {completedSets}/{totalSets} sets ({percentComplete}%)</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {/* Exercise List */}
      {exercises.map((exercise, index) => {
        const { isComplete, isCurrent } = exerciseStatuses[index];
        const isExpanded = expandedExercises.has(index);

        return (
          <div key={exercise.key} className="mb-2">
            {/* Exercise Header */}
            <button
              onClick={() => {
                const newExpanded = new Set(expandedExercises);
                if (isExpanded) {
                  newExpanded.delete(index);
                } else {
                  newExpanded.add(index);
                }
                setExpandedExercises(newExpanded);
              }}
              className={`w-full p-3 rounded-lg ${
                isComplete ? 'bg-green-100' :
                isCurrent ? 'bg-blue-100' :
                'bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isComplete ? '✓' : isCurrent ? '◉' : '○'}
                  <span className="font-medium">{exercise.exerciseName}</span>
                </div>
                <span className="text-sm">
                  {exercise.completedSets.length}/{exercise.totalSets}
                </span>
              </div>
            </button>

            {/* Expandable Set Table */}
            {isExpanded && (
              <div className="mt-2 pl-4">
                {Array.from({ length: exercise.totalSets }, (_, i) => i + 1).map(setNumber => {
                  const completedSet = exercise.completedSets.find(s => s.setNumber === setNumber);

                  return (
                    <div key={setNumber} className="flex gap-2 mb-2">
                      <span className="w-12">Set {setNumber}:</span>

                      {completedSet ? (
                        <>
                          <input
                            type="number"
                            value={completedSet.weight}
                            onChange={(e) => onUpdateSet(index, setNumber, 'weight', e.target.value)}
                            placeholder="lbs"
                            className="w-20 px-2 py-1 border rounded"
                          />
                          <span>×</span>
                          <input
                            type="number"
                            value={completedSet.reps}
                            onChange={(e) => onUpdateSet(index, setNumber, 'reps', e.target.value)}
                            placeholder="reps"
                            className="w-20 px-2 py-1 border rounded"
                          />
                        </>
                      ) : (
                        <button
                          onClick={() => onOpenPicker(index, setNumber, 'weight', '', '')}
                          className="text-blue-500"
                        >
                          [Edit]
                        </button>
                      )}

                      {setNumber > 1 && (
                        <button
                          onClick={() => {
                            const prevSet = exercise.completedSets.find(s => s.setNumber === setNumber - 1);
                            if (prevSet) {
                              onUpdateSet(index, setNumber, 'weight', prevSet.weight);
                              onUpdateSet(index, setNumber, 'reps', prevSet.reps);
                            }
                          }}
                          className="text-sm text-gray-500"
                        >
                          Copy Prev
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

---

### WorkoutSummary.js
**Purpose:** Post-workout summary and save modal

**Props:**
```javascript
{
  workoutName: String,
  startTime: Number,
  endTime: Number,
  exercises: Array,
  onSave: Function({ duration, averageRest }),
  onDiscard: Function
}
```

**Features:**
- Editable duration
- Calculated stats (average rest)
- Exercise breakdown
- Save or discard

**Calculations:**
```javascript
const stats = useMemo(() => {
  const totalSets = exercises.reduce((sum, ex) => sum + ex.totalSets, 0);
  const completedSets = exercises.reduce((sum, ex) => sum + ex.completedSets.length, 0);

  // Calculate average rest (filter outliers)
  const allRestDurations = exercises.flatMap(ex =>
    ex.completedSets.map(s => s.restDuration)
  ).filter(r => r >= 10 && r <= 600);  // Between 10s and 10min

  const averageRest = allRestDurations.length > 0
    ? Math.round(allRestDurations.reduce((sum, r) => sum + r, 0) / allRestDurations.length)
    : 0;

  return {
    totalSets,
    completedSets,
    averageRest,
    duration: Math.floor((endTime - startTime) / 1000)
  };
}, [exercises, startTime, endTime]);
```

---

### WorkoutHeader.js (NEW - April 2026)
**Purpose:** Displays workout title and state-aware header

**Props:**
```javascript
{
  workflowMode: 'choose' | 'custom' | 'template',
  selectedMuscleGroup: String,
  actualMuscleGroup: String,
  loadedTemplate: Object,
  isLoadingTemplate: Boolean,
  onReset: Function,
  exerciseData: Object
}
```

**Features:**
- Dynamic title based on workflow mode
- "Choose" mode: "Create Workout" with subtitle
- "Custom" mode: "{Muscle Group} Day" (e.g., "Chest Day")  
- "Template" mode: Shows template name
- Loading indicator for template loads
- Reset button (only shows when workout configured)

**UI States:**
```javascript
// Choose mode
<h1>Create Workout</h1>
<p>Choose your training style and start logging your workout.</p>

// Custom mode
<h1>Chest Day</h1>
<p>Following Jonathan's Hypertrophy Program</p>

// Template mode
<h1>Push Day A</h1>
<p>PPL Training</p>
```

---

### WorkflowChoiceCards.js (NEW - April 2026)
**Purpose:** Initial workflow selection screen

**Props:**
```javascript
{
  onSelectWorkflow: Function(mode) // 'custom' or 'template'
}
```

**Features:**
- Two large card options:
  1. **Follow My Program** (custom) - Blue gradient, "RECOMMENDED" badge
  2. **Use Custom Templates** (template) - Purple gradient
- Each card shows benefits with checkmarks
- Link to "Manage My Custom Templates" page
- Responsive grid layout (1 column mobile, 2 columns desktop)

**Design:**
```
┌─────────────────────────────────────────────┐
│ How would you like to train today?          │
├──────────────────────┬──────────────────────┤
│  💪 Follow My Program│  📋 Use Custom       │
│  [RECOMMENDED]       │  Templates           │
│                      │                      │
│  ✓ Quick & simple    │  ✓ Your saved       │
│  ✓ My tested exer... │     routines        │
│  ✓ Perfect for beg...│  ✓ Full customiz... │
└──────────────────────┴──────────────────────┘
        Manage My Custom Templates →
```

---

### CustomWorkflowSection.js (NEW - April 2026)
**Purpose:** Configuration form for custom (Jonathan's Program) workflow

**Props:**
```javascript
{
  selectedMuscleGroup: String,
  numberOfSets: Number | 'custom',
  customMuscleGroupName: String,
  customSetCount: String,
  customRepCount: String,
  previousCustomMuscleGroups: Array,
  workoutDate: String,
  onMuscleGroupSelect: Function,
  onSetCountSelect: Function,
  onCustomMuscleGroupChange: Function,
  onCustomSetCountChange: Function,
  onCustomRepCountChange: Function,
  onWorkoutDateChange: Function,
  onBackToChoice: Function
}
```

**Features:**
- Blue info banner: "Following Jonathan's Program"
- "Back to choices" button (when no muscle group selected)
- 3-step grid layout:
  1. **Select Muscle Group** - Dropdown + custom name input
  2. **Choose Set × Rep Range** - Dropdown + custom inputs
  3. **Workout Date** - Date picker (defaults to today, can backdate)
- Responsive grid (1 column mobile → 3 columns desktop)

**Validation:**
- Date picker max = today (can't schedule future workouts)
- Custom set count: 1-10 range
- Custom rep count: 1-50 range (optional)

---

### TemplateWorkflowSection.js
**Purpose:** Template selection and loading UI

**Features:**
- Template dropdown selector
- Loads user's saved templates from Firebase
- Shows template preview when selected
- "Back to choices" navigation

---

### WorkoutActionButtons.js (NEW - April 2026)
**Purpose:** Action buttons with mobile sticky scroll behavior

**Props:**
```javascript
{
  isWorkoutConfigured: Boolean,
  isButtonSticky: Boolean,
  isSaving: Boolean,
  isGeneratingSummary: Boolean,
  onStartWorkout: Function,
  onSaveWorkout: Function
}
```

**Features:**
- **Three buttons:**
  1. "View Workouts" - Link to workout history (not sticky)
  2. "▶️ Start Workout" - Green, primary action
  3. "Save Workout" - Blue, secondary action
- **Sticky behavior on mobile:**
  - Sticks to bottom of screen while scrolling
  - Unsticks when near page bottom (within 150px)
  - Gradient backdrop: `from-sky-300 via-sky-300 to-transparent`
- **Always static on desktop** (sm+ breakpoint)
- **Disabled states** when saving/generating
- Loading text: "Generating Summary..." or "Saving..."

**CSS Classes:**
```javascript
// Mobile sticky state
className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-sky-300 via-sky-300 to-transparent pt-6 pb-4 px-4 m-0 z-50"

// Desktop/unsticky state  
className="m-6 px-4 sm:px-20"
```

---

## Services & Utilities

### storageService.js
**Purpose:** Centralized localStorage management

**Why:** Consistent API, error handling, type safety

**Namespaces:**
```javascript
// Workout draft (HypertrophyPage)
workoutDraft.save(draft);
workoutDraft.get();
workoutDraft.hasData();
workoutDraft.clear();

// Active session (StartWorkoutPage)
workoutSession.save(session);
workoutSession.get();
workoutSession.exists();
workoutSession.clear();
workoutSession.update(changes);

// User preferences
workoutSettings.save(settings);
workoutSettings.get();
workoutSettings.update(changes);
workoutSettings.clear();

// Favorites
favoriteExercises.save(favorites);
favoriteExercises.get();
favoriteExercises.add(exerciseName);
favoriteExercises.remove(exerciseName);
favoriteExercises.toggle(exerciseName);
favoriteExercises.isFavorite(exerciseName);
favoriteExercises.clear();
```

**Implementation:**
```javascript
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
  }
};

export const workoutDraft = {
  save(draft) {
    return storage.set('active_workout_draft', draft);
  },
  get() {
    return storage.get('active_workout_draft');
  },
  hasData() {
    const draft = this.get();
    if (!draft) return false;
    return (draft.exerciseData && Object.keys(draft.exerciseData).length > 0);
  },
  clear() {
    return storage.remove('active_workout_draft');
  }
};

// Similar for workoutSession, workoutSettings, favoriteExercises...
```

---

### workout.js (Types)
**Purpose:** Factory functions and validators for workout data

**Factory Functions:**
```javascript
export const createWorkout = ({
  workoutName = 'Workout',
  selectedMuscleGroup = null,
  numberOfSets = null,
  exerciseData = {},
  note = '',
  showCardio = false,
  showAbs = false,
  cardioAtTop = false,
  absAtTop = false,
  templateId = null,
  templateName = null,
  workoutDate = null,
} = {}) => ({
  workoutName,
  selectedMuscleGroup,
  numberOfSets,
  exerciseData,
  note,
  showCardio,
  showAbs,
  cardioAtTop,
  absAtTop,
  templateId,
  templateName,
  workoutDate: workoutDate || new Date().toISOString().split('T')[0],
});

export const createExerciseEntry = ({
  exerciseName = '',
  sets = [],
  linkedExerciseId = null,
  detectedCategory = null,
} = {}) => ({
  exerciseName,
  sets,
  ...(linkedExerciseId && { linkedExerciseId }),
  ...(detectedCategory && { detectedCategory }),
});

export const createWorkoutSession = ({
  workoutName,
  startTime,
  exercises = [],
  currentSetIndex = 0,
  workoutData = null,
} = {}) => ({
  workoutName,
  startTime: startTime || Date.now(),
  exercises,
  currentSetIndex,
  workoutData,
});
```

**Validators:**
```javascript
export const isValidWorkout = (workout) => {
  return (
    workout &&
    typeof workout === 'object' &&
    workout.selectedMuscleGroup !== null &&
    workout.numberOfSets !== null
  );
};

export const isValidExerciseData = (exerciseData) => {
  return (
    exerciseData &&
    typeof exerciseData === 'object' &&
    Object.keys(exerciseData).length > 0
  );
};
```

**Converters:**
```javascript
export const workoutToFirebaseFormat = (workout, userId, summary = '') => {
  return {
    userId,
    muscleGroup: workout.selectedMuscleGroup,
    numberOfSets: workout.numberOfSets,
    date: workout.workoutDate,
    exerciseData: workout.exerciseData,
    note: workout.note,
    summary,
    timestamp: new Date().toISOString(),
  };
};

export const firebaseToWorkoutFormat = (firebaseData) => {
  return createWorkout({
    workoutName: firebaseData.muscleGroup || 'Workout',
    selectedMuscleGroup: firebaseData.muscleGroup,
    numberOfSets: firebaseData.numberOfSets,
    exerciseData: firebaseData.exerciseData || {},
    note: firebaseData.note || '',
    workoutDate: firebaseData.date,
  });
};
```

---

### useExerciseData.js (NEW - April 2026)
**Purpose:** Custom hook for managing exercise data state

**Why It Exists:**
Extracted from HypertrophyPage to centralize exercise state logic and make it reusable.

**Returns:**
```javascript
{
  exerciseData: Object,
  setExerciseData: Function,
  batchInitializeExercises: Function(exercisesToInit),
  handleExerciseDataChange: Function(categoryKey, exerciseName, setIndex, setInput, detectedCategory),
  handleRemoveSet: Function(categoryKey, setIndex)
}
```

**Key Functions:**

#### batchInitializeExercises
Efficiently initializes multiple exercises at once (used for template loading):
```javascript
batchInitializeExercises([
  { categoryKey: 'exercise_1', exerciseName: 'Bench Press' },
  { categoryKey: 'exercise_2', exerciseName: 'Incline Press' }
]);
```

#### handleExerciseDataChange
Updates exercise data - either changes exercise name or updates a set:
```javascript
// Change exercise name (setIndex = -1)
handleExerciseDataChange('exercise_1', 'Bench Press', -1, '', null);

// Update set data (setIndex = 0, 1, 2, etc.)
handleExerciseDataChange('exercise_1', 'Bench Press', 0, '135x12', null);
```

**Smart Features:**
- Auto-detects cardio/abs exercises (don't use `actualNumberOfSets`)
- Auto-expands set array when user adds beyond current length
- Stores `detectedCategory` for exercise type detection
- Uses functional setState for reliable updates

**Exercise Data Structure:**
```javascript
{
  'exercise_1': {
    exerciseName: 'Bench Press',
    sets: ['135x12', '185x10', '225x8', '225x8'],
    detectedCategory: 'compound' // optional
  },
  'cardio_section': {
    exerciseName: 'Treadmill',
    sets: ['3.5mi 25min'] // dynamic length for cardio/abs
  }
}
```

---

### useStickyButton.js (NEW - April 2026)
**Purpose:** Manages sticky button scroll behavior on mobile

**Parameters:**
```javascript
function useStickyButton(isWorkoutConfigured: Boolean): Boolean
```

**Returns:** `isButtonSticky` - whether button should stick to bottom

**Logic:**
1. **Desktop:** Always returns `false` (never sticky)
2. **Mobile (< 640px):**
   - Sticky by default while scrolling
   - Unsticks when within 150px of page bottom
   - Re-sticks when scrolling back up beyond 400px from bottom
   - Hysteresis prevents flickering
3. **Short pages (< 1000px):** Always sticky

**Performance:**
- Uses `requestAnimationFrame` for smooth 60fps updates
- Only updates state when scroll position or document height changes
- Cleanup on unmount

**Implementation:**
```javascript
const isButtonSticky = useStickyButton(isWorkoutConfigured);

<div className={isButtonSticky ? 'fixed bottom-0 ...' : 'relative ...'}>
  <button>Start Workout</button>
</div>
```

---

### sessionPersistence.js (NEW - April 2026)
**Purpose:** Robust workout session persistence with redundancy

**Why It Exists:**
Mobile browsers can be unreliable with localStorage. This provides:
- Dual storage (localStorage + sessionStorage)
- Better error handling
- Debugging utilities
- Age tracking

**Functions:**

#### saveWorkoutSession(sessionData)
Saves to BOTH localStorage and sessionStorage:
```javascript
saveWorkoutSession({
  workoutName: 'Chest Day',
  startTime: Date.now(),
  exercises: [...],
  currentSetIndex: 5,
  workoutData: {...}
});
```

**Features:**
- Adds `lastSaved` timestamp automatically
- Console logs save confirmation
- Catches `QuotaExceededError` and alerts user
- Redundant storage for reliability

#### loadWorkoutSession()
Loads session with fallback:
```javascript
const session = loadWorkoutSession();
// Returns: { ...sessionData, lastSaved: timestamp } or null
```

**Fallback Logic:**
1. Try localStorage first
2. If empty, try sessionStorage backup
3. Logs which storage source was used
4. Warns if session > 3 hours old (might be stale)

#### clearWorkoutSession()
Clears both storage locations:
```javascript
clearWorkoutSession();
// Removes from localStorage AND sessionStorage
```

#### debugSessionState()
Debug utility for troubleshooting:
```javascript
debugSessionState();
// Logs:
// - Which storage has data
// - Data sizes
// - Actual session contents
```

**Storage Keys:**
- Primary: `'activeWorkoutSession'` (localStorage)
- Backup: `'activeWorkoutSession_backup'` (sessionStorage)

**Error Handling:**
```javascript
try {
  localStorage.setItem(SESSION_KEY, serialized);
  sessionStorage.setItem(SESSION_BACKUP_KEY, serialized);
} catch (err) {
  if (err.name === 'QuotaExceededError') {
    alert('Storage full! Your workout may not be saved. Please save immediately.');
  }
}
```

---

## Data Structures

### Workout Object (HypertrophyPage)
```javascript
{
  workoutName: 'Chest Day',
  selectedMuscleGroup: 'chest',
  numberOfSets: 4,
  exerciseData: {
    'exercise_1': {
      exerciseName: 'Bench Press',
      sets: ['135x12', '185x10', '225x8', '225x8'],
      linkedExerciseId: 'bp',
      detectedCategory: null
    },
    'exercise_2': {
      exerciseName: 'Incline Press',
      sets: ['100x12', '120x10', '140x8', '140x8']
    },
    'cardio_section': {
      exerciseName: 'Treadmill',
      sets: ['3.5mi 25min']
    }
  },
  note: 'Felt strong today!',
  showCardio: true,
  showAbs: false,
  cardioAtTop: false,
  absAtTop: false,
  templateId: null,
  templateName: null,
  workoutDate: '2026-04-02'
}
```

### Exercise Array (StartWorkoutPage)
```javascript
[
  {
    key: 'exercise_1',
    exerciseName: 'Bench Press',
    totalSets: 4,
    completedSets: [
      {
        setNumber: 1,
        weight: '135',
        reps: '12',
        completedAt: 1234567890,
        restDuration: 0
      },
      {
        setNumber: 2,
        weight: '185',
        reps: '10',
        completedAt: 1234567990,
        restDuration: 90
      }
    ]
  },
  {
    key: 'exercise_2',
    exerciseName: 'Incline Press',
    totalSets: 4,
    completedSets: []
  }
]
```

### Firebase Workout Document
```javascript
{
  userId: 'user_123',
  workoutName: 'Chest Day',
  muscleGroup: 'chest',
  numberOfSets: 4,
  exerciseData: {
    'exercise_1': {
      exerciseName: 'Bench Press',
      sets: ['135x12', '185x10', '225x8', '225x8']
    },
    'exercise_2': {
      exerciseName: 'Incline Press',
      sets: ['100x12', '120x10', '140x8', '140x8']
    }
  },
  note: 'Felt strong today!',
  summary: 'AI-generated summary...',
  timestamp: 1234567890,
  date: '2026-04-02',
  duration: 3600,        // seconds
  averageRest: 90,       // seconds
  completedSets: 8,
  totalSets: 8
}
```

### Template Document
```javascript
{
  id: 'template_123',
  userId: 'user_123',
  name: 'My Chest Day',
  muscleGroup: 'chest',
  exercises: {
    'exercise_1': {
      exerciseName: 'Bench Press'
    },
    'exercise_2': {
      exerciseName: 'Incline Press'
    }
  },
  createdAt: '2026-01-01T00:00:00Z',
  lastUsed: '2026-04-02T10:30:00Z'
}
```

---

## Complete Data Flow

### 1. Creating a Workout

```
┌──────────────────────────────────────┐
│ User navigates to /Hypertrophy      │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ HypertrophyPage initializes          │
│ - Creates empty workout via Context  │
│ - Checks URL for ?template=ID        │
│ - Checks localStorage for draft      │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ User selects muscle group            │
│ → updateWorkout({ selectedMuscleGroup })│
│ → Loads previous workout for reference│
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ User selects set count (3/4/5)       │
│ → updateWorkout({ numberOfSets })    │
│ → Initializes default exercises      │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ User customizes exercises            │
│ - Change exercise names              │
│ - Reorder exercises (drag-and-drop)  │
│ - Add/remove exercises               │
│ → updateExercise(key, data)          │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Optional: Add cardio/abs             │
│ → updateWorkout({ showCardio: true })│
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Auto-save to localStorage            │
│ (every change, debounced)            │
│ → workoutDraft.save(workout)         │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ User clicks "Start Workout"          │
│ → Validates workout configuration    │
│ → navigate('/start-workout', {       │
│     state: { workoutData }           │
│   })                                 │
└──────────────────────────────────────┘
```

### 2. Active Workout

```
┌──────────────────────────────────────┐
│ StartWorkoutPage receives workoutData│
│ via location.state                   │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Check for saved session              │
│ → workoutSession.get()               │
│ If found: restore progress           │
│ Else: initialize from workoutData    │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Convert exerciseData → exercises[]   │
│ {                                    │
│   'ex_1': { name, sets: [] }         │
│ }                                    │
│ ↓                                    │
│ [                                    │
│   { key: 'ex_1', name, totalSets,    │
│     completedSets: [] }              │
│ ]                                    │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Display flash card for current set   │
│ - Calculate current exercise/set     │
│ - Show exercise name                 │
│ - Show weight/reps inputs            │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ User inputs weight and reps          │
│ Mobile: Opens WeightRepsPicker       │
│ Desktop: Types in inputs             │
│ → setCurrentSetData({ weight, reps })│
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ User clicks "Complete Set"           │
│ → handleCompleteSet()                │
│   - Create completedSet object       │
│   - Add to exercise.completedSets    │
│   - Save session to localStorage     │
│   - Start rest timer                 │
│   - Advance currentSetIndex++        │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Session auto-saved                   │
│ (every change)                       │
│ → workoutSession.save({              │
│     exercises,                       │
│     currentSetIndex,                 │
│     startTime,                       │
│     workoutData                      │
│   })                                 │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Repeat for all sets...               │
│                                      │
│ User can:                            │
│ - Navigate to previous sets          │
│ - Edit from progress table           │
│ - Pause workout (saves & goes home)  │
│ - End workout early                  │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ All sets completed                   │
│ → setShowSummary(true)               │
│ → WorkoutSummary modal appears       │
└──────────────────────────────────────┘
```

### 3. Saving Workout

```
┌──────────────────────────────────────┐
│ WorkoutSummary displayed             │
│ - Shows duration, sets, avg rest     │
│ - Exercise breakdown                 │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ User clicks "Save Workout"           │
│ → handleSaveWorkout({ duration,     │
│     averageRest })                   │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Convert exercises[] → exerciseData{} │
│ [                                    │
│   {                                  │
│     key: 'ex_1',                     │
│     completedSets: [                 │
│       { weight: '135', reps: '12' }  │
│     ]                                │
│   }                                  │
│ ]                                    │
│ ↓                                    │
│ {                                    │
│   'ex_1': {                          │
│     exerciseName: 'Bench Press',     │
│     sets: ['135x12', '185x10']       │
│   }                                  │
│ }                                    │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Package workout object               │
│ {                                    │
│   userId,                            │
│   workoutName,                       │
│   muscleGroup,                       │
│   numberOfSets,                      │
│   exerciseData,                      │
│   note,                              │
│   timestamp,                         │
│   duration,                          │
│   averageRest,                       │
│   completedSets,                     │
│   totalSets                          │
│ }                                    │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Save to Firebase                     │
│ → addDoc(collection(db, 'workouts'), │
│     workoutObject)                   │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Cleanup                              │
│ → workoutSession.clear()             │
│ → navigate('/SavedWorkouts')         │
└──────────────────────────────────────┘
```

### 4. Session Recovery (Page Refresh)

```
┌──────────────────────────────────────┐
│ User refreshes page during workout   │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ StartWorkoutPage initializes         │
│ → workoutSession.get()               │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Session found!                       │
│ {                                    │
│   workoutName,                       │
│   startTime,                         │
│   currentSetIndex,                   │
│   exercises: [                       │
│     { ..., completedSets: [...] }    │
│   ],                                 │
│   workoutData                        │
│ }                                    │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Restore state                        │
│ → setExercises(session.exercises)    │
│ → setCurrentSetIndex(session.current)│
│ → workoutStartRef = session.startTime│
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ User continues where they left off!  │
│ - Same exercises                     │
│ - Same completed sets                │
│ - Same timer                         │
└──────────────────────────────────────┘
```

### 5. Resume Workout Modal

```
┌──────────────────────────────────────┐
│ User navigates to any page           │
│ (Landing, Templates, etc.)           │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ ResumeWorkoutModal checks            │
│ → workoutSession.exists()            │
└────────────┬─────────────────────────┘
             │
             ├─ No session → Nothing shown
             │
             └─ Session exists ▼
                ┌──────────────────────────────────────┐
                │ Modal appears                        │
                │ "You have a workout in progress!"    │
                │ [Resume] [Discard]                   │
                └────────────┬─────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
   ┌────────────────────┐   ┌────────────────────┐
   │ User clicks Resume │   │ User clicks Discard│
   │                    │   │                    │
   │ → navigate(        │   │ → workoutSession   │
   │   '/start-workout')│   │     .clear()       │
   │                    │   │ → Close modal      │
   │ (auto-restores)    │   │                    │
   └────────────────────┘   └────────────────────┘
```

---

## Key Features Explained

### 1. Automatic Session Recovery
**Problem:** Users accidentally close browser during workout, losing all progress.

**Solution:**
- Every state change in StartWorkoutPage saves to localStorage
- Includes: exercises, completed sets, current position, start time, original config
- On page load, checks for existing session and restores exact state
- Works even after browser restart

**Key Code:**
```javascript
// Auto-save on every change
useEffect(() => {
  if (exercises.length > 0) {
    workoutSession.save({
      workoutName,
      startTime: workoutStartRef.current,
      currentSetIndex,
      exercises,
      workoutData  // Original config for HypertrophyPage restoration
    });
  }
}, [exercises, currentSetIndex]);

// Restore on mount
const savedSession = workoutSession.get();
if (savedSession && savedSession.workoutName === workoutName) {
  setExercises(savedSession.exercises);
  setCurrentSetIndex(savedSession.currentSetIndex);
  workoutStartRef.current = savedSession.startTime;
}
```

---

### 2. Mobile-First Input (Drum Pickers)
**Design Choice:** Typing on a phone at the gym is difficult and error-prone.

**Solution:**
- **Drum pickers** (iOS-style) for scroll-based input
- **NumPad** for quick number entry
- **Large touch targets** for fat fingers
- **Tab switching** between scroll and keypad modes

**Adaptive UI:**
```javascript
const isMobile = useIsMobile();  // window.matchMedia('(max-width: 768px)')

{isMobile ? (
  <button onClick={() => handleOpenPicker('weight')}>
    {currentSetData.weight || '---'}
  </button>
) : (
  <input
    type="number"
    value={currentSetData.weight}
    onChange={(e) => setCurrentSetData({...currentSetData, weight: e.target.value})}
  />
)}
```

---

### 3. Template System
**Use Case:** User has recurring workout routines (e.g., "Push Day A", "Leg Day")

**Flow:**
```
Create Template → Save to Firebase → Load from dropdown or URL → Modify → Start Workout
```

**Features:**
- Save any workout as template
- Quick load via dropdown or URL parameter
- Track "last used" date for sorting
- Modify before starting (templates are starting points, not rigid)

**URL-Based Loading:**
```javascript
// User clicks template card
navigate('/Hypertrophy?template=abc123');

// HypertrophyPage detects and loads
useEffect(() => {
  const templateId = searchParams.get('template');
  if (templateId) {
    loadTemplate(templateId).then(template => {
      updateWorkout({
        selectedMuscleGroup: template.muscleGroup,
        exerciseData: templateToExerciseData(template),
        templateId: template.id,
        templateName: template.name
      });
    });
  }
}, [searchParams]);
```

---

### 4. Previous Workout Data
**Use Case:** Track progressive overload - did I lift more than last time?

**Implementation:**
- When muscle group selected, fetch last workout for that group
- Display in exercise table as reference
- Shows previous sets for each exercise
- Helps user plan incremental increases

**Firebase Query:**
```javascript
const q = query(
  collection(db, 'workouts'),
  where('userId', '==', userId),
  where('muscleGroup', '==', selectedMuscleGroup),
  orderBy('timestamp', 'desc'),
  limit(1)
);
```

---

### 5. Exercise Type Detection
**Problem:** Different exercises need different inputs.
- Bench Press: weight + reps
- Plank: duration in seconds
- Treadmill: distance + time

**Solution:** Auto-detect based on exercise name and configure inputs.

```javascript
const placeholder = getPlaceholderForExercise(exerciseKey);
// 'cardio_section' → "Distance (mi) / Time (min)"
// 'abs_section' → "Weight (lbs) x Reps"
// 'timed_exercise' → "Duration (sec)"

const isCardio = placeholder.includes('mi');
const isTimed = placeholder.includes('sec');

let exerciseType = 'weight';
if (isCardio) exerciseType = 'cardio';
else if (isTimed) exerciseType = 'timed';
else if (placeholder === 'Reps') exerciseType = 'bodyweight';

// Pass to WeightRepsPicker
<WeightRepsPicker exerciseType={exerciseType} />
```

---

### 6. Rest Timer Intelligence
**Features:**
- Auto-starts after completing a set
- Tracks actual rest time taken (not just default)
- Visual indicator: Red (resting) → Green (ready)
- Records rest duration with each set for analysis
- Default: 180 seconds (3 minutes)

**Implementation:**
```javascript
// After completing set
setLastSetCompletedTime(Date.now());

// Update rest timer every 100ms
useEffect(() => {
  if (lastSetCompletedTime) {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastSetCompletedTime) / 1000);
      setRestTimeElapsed(elapsed);
    }, 100);
    return () => clearInterval(interval);
  }
}, [lastSetCompletedTime]);

// Save actual rest time with set
completedSet.restDuration = restTimeElapsed;
```

---

### 7. Data Validation & Protection
**Protections against data loss:**

1. **Exercise Name Validation:**
```javascript
const hasEmptyExercises = Object.values(exerciseData).some(
  ex => !ex.exerciseName || ex.exerciseName.trim() === ''
);

if (hasEmptyExercises) {
  alert('Please provide names for all exercises');
  return;
}
```

2. **Workout Configuration Validation:**
```javascript
const isWorkoutConfigured = useMemo(() => {
  const hasMuscleGroup = selectedMuscleGroup &&
    (selectedMuscleGroup !== 'custom' || customMuscleGroupName.trim());
  const hasSets = numberOfSets &&
    (numberOfSets !== 'custom' || (customSetCount && parseInt(customSetCount) > 0));
  return hasMuscleGroup && hasSets;
}, [selectedMuscleGroup, customMuscleGroupName, numberOfSets, customSetCount]);
```

3. **Auto-Save Everywhere:**
- Draft saved to localStorage on every change
- Session saved to localStorage on every set completion
- No manual "save" required until final Firebase save

---

## Firebase Integration

### Configuration
**Location:** `src/config/firebase.js`

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: 'jcsgymguide',
  storageBucket: 'jcsgymguide.firebasestorage.app',
  messagingSenderId: '439544885300',
  appId: '1:439544885300:web:264046dd0e1f20da85da61',
  measurementId: 'G-99GC22Z661',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

### Collections

#### 1. `workouts` - Saved workout records
```javascript
{
  userId: String,
  workoutName: String,
  muscleGroup: String,
  numberOfSets: Number,
  exerciseData: Object,
  note: String,
  summary: String,  // AI-generated
  timestamp: Number,
  date: String,  // YYYY-MM-DD
  duration: Number,  // seconds
  averageRest: Number,  // seconds
  completedSets: Number,
  totalSets: Number
}
```

#### 2. `templates` - User workout templates
```javascript
{
  userId: String,
  name: String,
  muscleGroup: String,
  exercises: Object,
  createdAt: String,
  lastUsed: String
}
```

#### 3. `users` - User profiles (future)
```javascript
{
  uid: String,
  email: String,
  displayName: String,
  photoURL: String,
  createdAt: String,
  preferences: Object
}
```

### Authentication
**Method:** Google OAuth via Firebase Auth

```javascript
// Login
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

// Check auth state
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Logged in:', user.uid);
  } else {
    console.log('Not logged in');
  }
});
```

### Security Rules (Recommended)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null
                        && request.auth.uid == resource.data.userId;
    }

    match /templates/{templateId} {
      allow read, write: if request.auth != null
                        && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## Tips for Explaining

### Start with the Big Picture
1. **Show the live app:** Walk through creating a workout, starting it, completing sets, and saving
2. **Explain the pain point:** Why this app exists (traditional pen & paper is tedious)
3. **Highlight key features:** Session recovery, mobile-first design, templates

### Then Dive into Code
1. **Entry points:** index.js → App.js → Main.js → WorkoutProvider → Routes
2. **Pick a feature:** Trace one complete flow (e.g., "Complete Set" button)
3. **Show data transformation:** exerciseData object → exercises array → Firebase document

### Visual Aids
- Draw the component tree
- Sketch the data flow diagrams
- Show the localStorage structure in DevTools
- Open Firebase console and show real data

### Demo Session Recovery
1. Start a workout
2. Complete a few sets
3. Close browser
4. Reopen → show session restored
5. Open DevTools → show localStorage contents

### Explain Architectural Decisions
**Why Context instead of Redux?**
- Simpler for this app size
- No complex async actions needed
- Easier to understand for beginners

**Why localStorage?**
- Works offline
- No server latency
- Immediate persistence
- Survives browser refresh

**Why Firebase?**
- Easy setup (no backend code)
- Real-time sync
- Built-in authentication
- Generous free tier

**Why mobile-first?**
- Primary use case is at the gym on a phone
- Desktop is secondary (planning/reviewing)
- Touch-friendly UI is harder to retrofit later

### Common Questions

**Q: What happens if user has two tabs open?**
A: localStorage is shared, so both tabs would conflict. We could add tab synchronization with `storage` events.

**Q: Can you work out offline?**
A: Yes! The app works entirely offline. Workouts save to localStorage. Firebase sync happens when online.

**Q: Why not use a state management library like Redux?**
A: Context API is sufficient for this app size. Redux adds boilerplate without clear benefits here.

**Q: How do you handle race conditions in Firebase?**
A: We don't have concurrent writes. Each workout is written once at the end. Templates are rarely updated.

**Q: What about data backup?**
A: Firebase handles backups. localStorage is ephemeral (can be cleared). Important data should be saved to Firebase.

---

## Project Statistics

- **Total Files:** ~80 source files (increased from refactoring)
- **Total Lines:** ~12,000 lines of React/JavaScript
- **Largest File:** HypertrophyPage.js (1,890 lines)
- **Most Complex Component:** StartWorkoutPage.js (700+ lines) - manages workout session
- **Exercise Database:** 100+ exercises across 20+ categories
- **Recent Refactoring (April 2026):** Extracted 5 new components and 2 new hooks from HypertrophyPage to improve maintainability

---

## Future Enhancements

### Short Term
1. ~~**Split large components:** Break HypertrophyPage into smaller sub-components~~ ✅ **COMPLETED (April 2026)**
   - Extracted WorkoutHeader, WorkflowChoiceCards, CustomWorkflowSection, TemplateWorkflowSection, WorkoutActionButtons
2. ~~**Custom hooks:** Extract shared logic~~ ✅ **PARTIALLY COMPLETED (April 2026)**
   - ✅ useExerciseData.js - Exercise state management
   - ✅ useStickyButton.js - Scroll behavior
   - ⏳ TODO: useWorkoutSession, usePreviousWorkout
3. **Error boundaries:** Graceful error handling
4. **Loading states:** Better UX during Firebase operations
5. **Offline indicator:** Show when app is offline

### Medium Term
1. **Analytics dashboard:** Volume tracking, personal records, muscle frequency
2. **Exercise library:** Browse all exercises with videos/descriptions
3. **Workout plans:** Multi-week programs with progressive overload
4. **Social features:** Share workouts, follow friends
5. **Export data:** CSV export for external analysis

### Long Term
1. **Progressive Web App (PWA):** Install on home screen, true offline-first
2. **Service workers:** Background sync, push notifications for rest timer
3. **IndexedDB:** Store large datasets locally
4. **Machine learning:** Suggest weights based on historical performance
5. **Wearable integration:** Heart rate, calories burned
6. **Photo uploads:** Progress pics with workout data

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (localhost:3000)
npm run start

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix
```

---

## Environment Variables

Create `.env` file:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
```

---

## Recent Refactoring Summary (April 2026)

### What Changed
HypertrophyPage underwent significant refactoring to improve code organization and maintainability. The page remains ~1,890 lines but is now more modular and easier to understand.

### Extracted Components
| Component | Purpose | Lines | Benefit |
|-----------|---------|-------|---------|
| WorkoutHeader.js | Title & reset button | 89 | Isolated header logic from main page |
| WorkflowChoiceCards.js | Initial workflow selection | 85 | Separated choice UI from configuration |
| CustomWorkflowSection.js | Custom workout form | 137 | Isolated Jonathan's Program workflow |
| TemplateWorkflowSection.js | Template workflow form | ~100 | Separated template loading logic |
| WorkoutActionButtons.js | Action buttons | 82 | Extracted sticky scroll behavior |

### Extracted Hooks
| Hook | Purpose | Lines | Benefit |
|------|---------|-------|---------|
| useExerciseData.js | Exercise state management | 103 | Reusable exercise CRUD operations |
| useStickyButton.js | Sticky button behavior | 78 | Isolated scroll detection logic |

### Extracted Utilities
| Utility | Purpose | Lines | Benefit |
|---------|---------|-------|---------|
| sessionPersistence.js | Robust session save/load | 97 | Better error handling & redundancy |

### Benefits
1. **Better separation of concerns** - Each component has one job
2. **Easier testing** - Smaller units are easier to test
3. **Reusability** - Components and hooks can be reused
4. **Maintainability** - Changes are isolated to specific files
5. **Readability** - Easier to understand each piece

### Migration Notes
- A backup was created: `HypertrophyPage.backup.js` (688 lines - minimal version)
- All functionality preserved - no breaking changes
- Session persistence improved with dual storage (localStorage + sessionStorage)
- Mobile sticky button behavior now more reliable

---

**Good luck explaining the app to your brother! This walkthrough should give you everything you need to confidently present the architecture, data flow, and key features.**

**Remember:** Start with the user experience, then dive into the code. Show, don't just tell!

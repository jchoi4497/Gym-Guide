# Gym Guide - Code Walkthrough

**Last Updated:** 2026-04-11

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Application Routing](#application-routing)
5. [Key Features](#key-features)
6. [Data Model](#data-model)
7. [Component Architecture](#component-architecture)
8. [State Management](#state-management)
9. [Key Files Reference](#key-files-reference)

---

## Project Overview

Gym Guide is a React-based progressive web application for creating, tracking, and managing strength training workouts. Users can create custom workout programs, track their progress with detailed exercise logs, save workout templates, and view historical data with charts and analytics.

### Core Functionality
- **Workout Creation**: Create workouts with customizable muscle groups, set/rep schemes
- **Live Workout Tracking**: Track weights, reps, and rest times during workouts
- **Template System**: Save frequently used workouts as templates for quick access
- **Progress Analytics**: View historical data and progress charts
- **Custom Exercises**: Add and manage custom exercises
- **Weight Unit Conversion**: Support for both lbs and kg

---

## Tech Stack

### Frontend
- **React** 18.3.1 - UI framework
- **React Router** 7.3.0 - Client-side routing
- **Vite** 6.0.5 - Build tool and dev server
- **Tailwind CSS** 4.1.3 - Utility-first CSS framework

### Backend & Database
- **Firebase** 11.6.0
  - Firestore - NoSQL database
  - Authentication - Google OAuth
  - Hosting - Static site deployment

### Additional Libraries
- **Recharts** 3.1.0 - Data visualization
- **@dnd-kit** 6.3.1 - Drag-and-drop functionality
- **date-fns** 4.1.0 - Date utilities
- **classnames** 2.5.1 - Conditional CSS classes

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.js
│   ├── DropDown.js
│   ├── WorkoutTable.js
│   ├── TemplateEditor.js
│   └── ...
├── pages/              # Route-level page components
│   ├── LandingPage.js
│   ├── CreateWorkoutPage.js
│   ├── WorkoutPage.js
│   ├── TemplateSelectionPage.js
│   └── ...
├── config/             # Configuration and constants
│   ├── firebase.js
│   ├── constants.js
│   ├── exerciseConfig.js
│   └── ...
├── contexts/           # React Context providers
│   └── SettingsContext.js
├── utils/              # Utility functions
│   ├── templateHelpers.js
│   └── ...
├── SavedWorkout/       # Saved workout viewer
├── App.js             # Root component
├── Main.js            # Router configuration
└── index.css          # Global styles
```

---

## Application Routing

Defined in `src/Main.js`:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | LandingPage | Home page with app overview |
| `/Info` | InfoPage | App information and instructions |
| `/Create` | CreateWorkoutPage | Create new workout wizard |
| `/Templates` | TemplateSelectionPage | Browse and manage workout templates |
| `/workout/:workoutId` | WorkoutPage | Live workout tracking interface |
| `/start-workout` | StartWorkoutPage | Quick workout start page |
| `/SavedWorkouts` | ListOfWorkouts | Browse completed workouts |
| `/SavedWorkout/:workoutId` | SavedWorkout | View completed workout details |
| `/MyExercises` | MyExercisesPage | Manage custom exercises |
| `/Profile` | ProfilePage | User settings and preferences |

---

## Key Features

### 1. Workout Creation Flow
**Location:** `src/pages/CreateWorkoutPage.js`

**User Journey:**
1. **Quick Start (Optional)**: Load a saved template to auto-fill workout details
2. **Step 1 - Select Workout**: Choose muscle group (Chest/Triceps, Back/Biceps, Legs, Shoulders/Forearms, or Custom)
3. **Step 2 - Set × Rep Range**: Select training volume (3x15, 4x12, 5x8, or Custom)
4. **Step 3 - Workout Date**: Choose date for the workout
5. **Create**: Generates a draft workout in Firestore and navigates to workout page

**Key Features:**
- Wizard-style UI with progress indicator
- Template dropdown for quick workout creation
- Mobile-responsive design
- Draft workout detection (resumes incomplete workouts)

### 2. Live Workout Tracking
**Location:** `src/pages/WorkoutPage.js`

**Functionality:**
- Real-time exercise logging with weights and reps
- Auto-save to Firestore on every change
- Rest timer between sets
- Add/remove exercises dynamically
- Optional cardio and abs sections
- Workout notes and summary
- Previous workout data display for reference
- Drag-and-drop exercise reordering

**Components Used:**
- `WorkoutTable.js` - Main exercise table
- `WorkoutHeader.js` - Date, muscle group, metadata
- `WorkoutActionButtons.js` - Save, delete, complete actions
- `OptionalWorkoutSections.js` - Cardio/abs toggle
- `RestTimer.js` - Countdown timer
- `NumPad.js` - Weight/rep input interface

### 3. Template System
**Location:** `src/pages/TemplateSelectionPage.js`, `src/components/TemplateEditor.js`

**Template Management:**
- Create templates from built-in presets or scratch
- Edit template exercises, sets, reps
- Save templates to Firebase under `userTemplates/{userId}`
- Load templates in workout creation for quick start
- Templates track `lastUsed` timestamp for recency sorting

**Data Structure:**
```javascript
{
  id: "template-123",
  name: "Upper Body Push",
  muscleGroup: "chest",
  numberOfSets: 4,
  customSetCount: 4,
  customRepCount: 12,
  exercises: [
    {
      exerciseName: "Bench Press",
      sets: ["", "", "", ""]
    },
    // ...
  ]
}
```

### 4. Progress Tracking & Analytics
**Location:** `src/pages/MyExercisesPage.js`, `src/components/DataChart.js`

**Features:**
- Exercise history graphs (monthly view or previous workout comparison)
- Track weight progression over time
- Filter by exercise name
- Recharts visualization
- Weight unit conversion (lbs/kg)

### 5. User Settings
**Location:** `src/contexts/SettingsContext.js`, `src/pages/ProfilePage.js`

**Managed Settings:**
- Weight unit preference (lbs or kg)
- Theme toggle (if implemented)
- User profile data

**Storage:**
- Settings stored in `userSettings/{userId}` in Firestore
- Context provides global access via `useSettings()` hook

---

## Data Model

### Firebase Collections

#### 1. **workoutLogs** (Main workout data)
```javascript
{
  userId: "user-uid",
  status: "draft" | "completed",
  type: "program",
  muscleGroup: "chest" | "back" | "legs" | "shoulders" | "custom",
  numberOfSets: 4,
  customSetCount: 4,
  customRepCount: 12,
  exerciseData: {
    "exercise-1": {
      exerciseName: "Bench Press",
      sets: ["225x8", "225x7", "225x6", "225x6"]
    }
  },
  date: Timestamp,
  workoutDate: "2026-04-11",
  createdAt: Timestamp,
  lastModified: Timestamp,
  note: "Felt strong today",
  summary: "Great chest workout",
  showCardio: false,
  showAbs: false,
  cardioAtTop: false,
  absAtTop: false,
  sectionOrder: "abs-first",
  mainExerciseOrder: ["exercise-1", "exercise-2"],
  exerciseOrder: []
}
```

#### 2. **userTemplates** (Saved workout templates)
```javascript
{
  templates: [
    {
      id: "template-123",
      name: "Push Day",
      muscleGroup: "chest",
      numberOfSets: 4,
      customSetCount: 4,
      customRepCount: 12,
      lastUsed: Timestamp,
      exercises: [
        {
          exerciseName: "Bench Press",
          sets: ["", "", "", ""]
        }
      ]
    }
  ]
}
```

#### 3. **userSettings** (User preferences)
```javascript
{
  weightUnit: "lbs" | "kg"
}
```

#### 4. **userFavorites** (Favorited exercises)
```javascript
{
  favorites: ["Bench Press", "Squat", "Deadlift"]
}
```

#### 5. **userCustomExercises** (Custom exercise names)
```javascript
{
  exercises: [
    { name: "Cable Crossover", category: "chest" }
  ]
}
```

---

## Component Architecture

### Core UI Components

#### DropDown.js
- Custom dropdown with favorites support
- Click-outside-to-close behavior
- Sorted options (favorites first)
- Used for muscle group and exercise selection

#### WorkoutTable.js
- Main exercise tracking table
- Handles set input via NumPad
- Previous workout data display
- Add/delete exercise buttons
- Drag-and-drop reordering (dnd-kit)

#### NumPad.js
- Custom numeric keypad for weight/rep input
- Supports weight formats: `225x8`, `225`, `8`
- Mobile-optimized input method

#### TemplateEditor.js
- CRUD operations for templates
- Exercise picker for adding exercises to templates
- Set/rep configuration
- Save/delete template actions

#### Navbar.js
- Top navigation bar
- Google sign-in/sign-out
- Links to all major pages
- Mobile-responsive hamburger menu

### Utility Components

- **Panel.js** - Reusable styled container
- **RestTimer.js** - Countdown timer for rest periods
- **WeightRepsPicker.js** - Combined weight/rep input
- **ExerciseAutocomplete.js** - Exercise name autocomplete with history
- **MuscleGroupAutocomplete.js** - Muscle group autocomplete

---

## State Management

### Global State (Context)
- **SettingsContext** (`src/contexts/SettingsContext.js`)
  - Provides: `weightUnit`, `setWeightUnit`
  - Syncs with Firebase `userSettings/{userId}`
  - Used throughout app for weight conversions

### Local State (Component-Level)
Most pages use React `useState` and `useEffect` for local state:
- Form inputs (CreateWorkoutPage)
- Exercise data (WorkoutPage)
- Template editing (TemplateSelectionPage)
- Filter/search (MyExercisesPage)

### Firebase State Sync
- Auto-save pattern: Update local state → sync to Firestore
- Real-time listeners: `onAuthStateChanged`, document snapshots
- Optimistic updates for better UX

---

## Key Files Reference

### Configuration

**`src/config/constants.js`**
- Muscle group options
- Set/rep range options
- Firebase field name constants
- Graph view modes

**`src/config/exerciseConfig.js`**
- Exercise lists per muscle group
- Default exercise selections

**`src/config/firebase.js`**
- Firebase initialization
- Firestore database export
- Auth export

### Utilities

**`src/utils/templateHelpers.js`**
- `templateToExerciseData()` - Converts template format to workout format
- Helper functions for template processing

### Contexts

**`src/contexts/SettingsContext.js`**
- Global settings provider
- Weight unit management
- Firebase sync for user preferences

---

## Development Workflow

### Running the App
```bash
npm start          # Dev server on port 3000
npm run build      # Production build
npm run preview    # Preview production build
```

### Firebase Setup
1. Create Firebase project
2. Enable Firestore and Authentication
3. Add Firebase config to `src/config/firebase.js`
4. Deploy Firestore security rules (see `FIREBASE_MIGRATION_GUIDE.md`)

### Key Development Notes
- Auto-save is implemented throughout - changes persist immediately
- Draft workouts are checked on CreateWorkoutPage mount
- Templates fetch on page load, sorted by `lastUsed`
- Mobile-first design with responsive breakpoints (`sm:`, `md:`, etc.)
- All components use Tailwind CSS for styling

---

## Future Improvements
- Progressive Web App (PWA) manifest and service worker
- Offline support with Firestore offline persistence
- More detailed analytics and charts
- Social features (share workouts, follow friends)
- Exercise video demonstrations
- Rest timer notifications

---

## Questions or Issues?
See `TECHNICAL_DEBT_AUDIT.md` for known issues and planned improvements.

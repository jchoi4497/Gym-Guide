# Custom Workout Templates System

## Overview
The new template system allows users to create, manage, and use custom workout templates instead of being limited to the default hypertrophy program.

## New Pages Created

### 1. Template Selection Page (`/Templates`)
- **Purpose**: Central hub for choosing workout templates
- **Features**:
  - Built-in "Pure Hypertrophy" template (your original default)
  - User's custom templates displayed in cards
  - Favorites section
  - Search and filter by tags
  - Quick access to create new templates

### 2. My Templates Page (`/MyTemplates`)
- **Purpose**: Manage and create custom templates
- **Features**:
  - Create new templates from scratch
  - Edit existing templates
  - Duplicate templates for variations
  - Delete templates
  - Visual cards showing template details

### 3. Template Editor (`TemplateEditor` component)
- **Purpose**: Form for creating/editing templates
- **Features**:
  - Template name and description
  - Icon selection (20 emoji options)
  - Category labeling
  - Muscle group selection (including custom)
  - Set/rep configuration
  - Exercise list management
  - Optional cardio/abs sections with position settings
  - Tag system for organization
  - Favorite marking

## New Components

### TemplateCard Component
- Displays template information in a card format
- Actions: Start Workout, Edit, Delete, Toggle Favorite
- Shows muscle group, volume, exercise count, tags
- Visual indicators for favorites

## Template Data Structure

```javascript
{
  id: "template_123",
  name: "PPL - Push Day",
  description: "Chest, Shoulders, Triceps focus",
  icon: "💪",
  category: "PPL",
  muscleGroup: "chest", // or "custom"
  customMuscleGroupName: "Push Day", // if custom
  numberOfSets: 4,
  customSetCount: 4,
  customRepCount: 10,
  exercises: [
    { category: "incline", exerciseId: "dip" },
    { category: "chestpress", exerciseId: "bp" },
    // ... more exercises
  ],
  includeCardio: true,
  cardioAtTop: false,
  includeAbs: true,
  absAtTop: false,
  tags: ["PPL", "Intermediate"],
  isFavorite: false,
  createdAt: "2026-03-24T...",
  updatedAt: "2026-03-24T...",
  lastUsed: "2026-03-24"
}
```

## Firebase Collections

### userTemplates
```
userTemplates/{userId}
  - templates: [array of template objects]
```

## User Flow

1. **Landing Page** → Click "Get Started" → **Template Selection Page**
2. **Template Selection** → Choose built-in or custom template → **Hypertrophy Page** (pre-filled)
3. **Template Selection** → Click "Create Custom Template" → **My Templates Page**
4. **My Templates** → Click "Create New" → **Template Editor**
5. **Template Editor** → Fill form → Save → **My Templates** (shows new template)
6. **Template Card** → Click "Start Workout" → **Hypertrophy Page** (pre-filled with template)

## Navigation Updates

### Navbar
- Added "Templates" link (first item)
- Desktop and mobile menus updated

### Routes Added
- `/Templates` - Template Selection Page
- `/MyTemplates` - Template Management Page

## Next Steps (Not Yet Implemented)

To complete the template system, you'll need to:

### 1. Update HypertrophyPage to Accept Templates
The HypertrophyPage needs to:
- Read template ID from URL query params (`?template=template_123`)
- Fetch the template data from Firebase
- Pre-fill all fields based on template data
- Save `templateId` to workout logs when saving

### 2. Template Usage Tracking
- Store `templateId` in workoutLogs when saving a workout
- Track usage count and last used date
- Display "Recently Used" section on Template Selection page

### 3. Advanced Features (Optional)
- Create template from existing workout
- Share templates with other users (export/import)
- Template recommendations based on user's workout history
- Template analytics (most used exercises, progression)

## Files Created/Modified

### New Files:
- `src/pages/TemplateSelectionPage.js`
- `src/pages/MyTemplatesPage.js`
- `src/components/TemplateCard.js`
- `src/components/TemplateEditor.js`

### Modified Files:
- `src/Main.js` - Added routes
- `src/Navbar.js` - Added Templates link
- `src/pages/LandingPage.js` - Updated to link to Templates

## Testing Checklist

- [ ] Navigate to /Templates and see built-in template
- [ ] Sign in and create a new template
- [ ] Edit an existing template
- [ ] Delete a template
- [ ] Mark template as favorite
- [ ] Search and filter templates by tags
- [ ] Duplicate a template
- [ ] Mobile responsiveness

## Example Templates Users Can Create

1. **PPL Split**
   - Push Day (Chest, Shoulders, Triceps)
   - Pull Day (Back, Biceps)
   - Leg Day

2. **Upper/Lower Split**
   - Upper Body A
   - Lower Body A
   - Upper Body B
   - Lower Body B

3. **Full Body**
   - Full Body Beginner
   - Full Body Advanced

4. **Specialized**
   - Arm Day
   - Athletic Performance
   - Home Workout

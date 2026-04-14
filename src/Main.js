import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './index.css';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import InfoPage from './pages/InfoPage';
import TemplateSelectionPage from './pages/TemplateSelectionPage';
import CreateWorkoutPage from './pages/CreateWorkoutPage';
import WorkoutPage from './pages/WorkoutPage';
import StartWorkoutPage from './pages/StartWorkoutPage';
import ColorDesignPage from './pages/ColorDesignPage';
import SavedWorkout from './SavedWorkout/SavedWorkout';
import ListOfWorkouts from './pages/ListOfWorkouts';
import MyExercisesPage from './pages/MyExercisesPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import CalendarPage from './pages/CalendarPage';

function Main() {
    return (
        <ThemeProvider>
            <SettingsProvider>
                <BrowserRouter>
                    <Routes>
                        <Route exact path="/" element={<LandingPage />} />
                        <Route exact path="/Info" element={<InfoPage />} />
                        <Route exact path="/Templates" element={<TemplateSelectionPage />} />
                        <Route exact path="/MyTemplates" element={<Navigate to="/Templates" replace />} />
                        <Route exact path="/Create" element={<CreateWorkoutPage />} />
                        <Route exact path="/create" element={<Navigate to="/Create" replace />} />
                        <Route exact path="/workout/:workoutId" element={<WorkoutPage />} />
                        <Route exact path="/start-workout" element={<StartWorkoutPage />} />
                        <Route exact path="ColorDesign" element={<ColorDesignPage />} />
                        <Route exact path="/SavedWorkout/:workoutId" element={<SavedWorkout />} />
                        <Route exact path="/SavedWorkouts" element={<ListOfWorkouts />} />
                        <Route exact path="/MyExercises" element={<MyExercisesPage />} />
                        <Route exact path="/Profile" element={<ProfilePage />} />
                        <Route exact path="/user/:userId" element={<UserProfilePage />} />
                        <Route exact path="/Calendar" element={<CalendarPage />} />
                    </Routes>
                </BrowserRouter>
            </SettingsProvider>
        </ThemeProvider>
    );
}

export default Main;

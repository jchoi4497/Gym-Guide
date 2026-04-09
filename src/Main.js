import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './index.css';
import { WorkoutProvider } from './context/WorkoutContext';
import LandingPage from './pages/LandingPage';
import TrainingStylePage from './pages/TrainingStyle';
import TemplateSelectionPage from './pages/TemplateSelectionPage';
import MyTemplatesPage from './pages/MyTemplatesPage';
import StrengthPage from './pages/StrengthPage';
import HypertrophyPage from './pages/HypertrophyPage';
import CreateWorkoutPage from './pages/CreateWorkoutPage';
import WorkoutPage from './pages/WorkoutPage';
import StartWorkoutPage from './pages/StartWorkoutPage';
import ColorDesignPage from './pages/ColorDesignPage';
import SavedWorkout from './SavedWorkout/SavedWorkout';
import ListOfWorkouts from './pages/ListOfWorkouts';
import MyExercisesPage from './pages/MyExercisesPage';
import ResumeWorkoutModal from './components/ResumeWorkoutModal';

function Main() {
    return (
        <WorkoutProvider>
            <BrowserRouter>
                <ResumeWorkoutModal />
                <Routes>
                    <Route exact path="/" element={<LandingPage />} />
                    <Route exact path="/Templates" element={<TemplateSelectionPage />} />
                    <Route exact path="/MyTemplates" element={<MyTemplatesPage />} />
                    <Route exact path="/TrainingStyle" element={<TrainingStylePage />} />
                    <Route exact path="/Strength" element={<StrengthPage />} />
                    <Route exact path="/Hypertrophy" element={<HypertrophyPage />} />
                    <Route exact path="/Create" element={<CreateWorkoutPage />} />
                    <Route exact path="/create" element={<Navigate to="/Create" replace />} />
                    <Route exact path="/workout/:workoutId" element={<WorkoutPage />} />
                    <Route exact path="/start-workout" element={<StartWorkoutPage />} />
                    <Route exact path="ColorDesign" element={<ColorDesignPage />} />
                    <Route exact path="/SavedWorkout/:workoutId" element={<SavedWorkout />} />
                    <Route exact path="/SavedWorkouts" element={<ListOfWorkouts />} />
                    <Route exact path="/MyExercises" element={<MyExercisesPage />} />
                </Routes>
            </BrowserRouter>
        </WorkoutProvider>
    );
}

export default Main;

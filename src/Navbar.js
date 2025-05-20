import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="flex space-x-6 mb-6">
      <Link to="/" className="text-blue-700 hover:underline font-medium">🏠 Home</Link>
      <Link to="/Hypertrophy" className="text-blue-700 hover:underline font-medium">Create Workout</Link>
      <Link to="/SavedWorkouts" className="text-blue-700 hover:underline font-medium">Saved Workouts</Link>
    </div>
  );
}

export default Navbar;
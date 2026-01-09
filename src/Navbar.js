import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    console.log('toggle clicked');
    setIsOpen(!isOpen);
  };

  const menuRef = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Desktop Nav Link helper component
  function NavLink({ to, label }) {
    return (
      <Link
        to={to}
        className="text-sky-50 font-medium hover:bg-sky-50 hover:text-blue-600 transition-all px-4 py-2 rounded-lg"
      >
        {label}
      </Link>
    );
  }

  // Mobile Nav Link helper component
  function MobileLink({ to, label, toggleMenu }) {
    return (
      <Link
        to={to}
        onClick={toggleMenu}
        className="block text-blue-700 font-semibold hover:bg-blue-50 active:bg-blue-200 rounded-lg px-3 py-2 transition"
      >
        {label}
      </Link>
    );
  }

  return (
    <nav className="flex items-center justify-between p-5 mb-8 bg-gradient-to-r from-sky-500 to-blue-700 shadow-lg">
      {/* Brand */}
      <Link
        to="/"
        className="text-3xl font-bold italic text-sky-50 inline-block transition-transform duration-300 hover:scale-110 active:scale-95 origin-left"
      >
        JC's Gym Guide
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex space-x-6">
        <NavLink to="/Hypertrophy" label="Create Workout" />
        <NavLink to="/SavedWorkouts" label="Saved Workouts" />
        <NavLink to="/TrainingStyle" label="More Info" />
      </div>

      {/* Mobile Toggle */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="text-sky-50 text-3xl md:hidden focus:outline-none z-30"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-19 right-0 bg-sky-50 rounded-b-xl shadow-xl p-4 space-y-3 z-20 w-48 md:hidden"
        >
          <MobileLink to="/Hypertrophy" label="Create Workout" toggleMenu={toggleMenu} />
          <MobileLink to="/SavedWorkouts" label="Saved Workouts" toggleMenu={toggleMenu} />
          <MobileLink to="/TrainingStyle" label="More Info" toggleMenu={toggleMenu} />
        </div>
      )}
    </nav>
  );
}

export default Navbar;

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { auth } from './firebase'; // Import your auth instance
import { loginWithGoogle } from './googleAuth'; // Import your function
import { signOut } from 'firebase/auth';

function Navbar() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Listen for login/logout
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

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
        className="block text-blue-700 font-semibold rounded-lg px-3 py-2 transition-colors active:bg-blue-200"
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

        {/* Profile UI */}
        {user ? (
          <div className="flex items-center space-x-3 ml-4 border-l pl-6 text-sky-50">
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-sky-50 shadow-sm"
            />
            <button
              onClick={handleLogout}
              className="text-sky-50 hover:text-red-500 hover:bg-sky-50 transition-all px-4 py-2 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3 ml-4 border-l pl-6 text-sky-50">
            <button
              onClick={loginWithGoogle}
              className="text-sky-50 hover:bg-sky-50 hover:text-blue-600 transition-all px-4 py-2 rounded-lg"
            >
              Sign In
            </button>
          </div>
        )}
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
          className="absolute top-19 right-0 bg-sky-50 rounded-b-xl shadow-xl p-4 space-y-3 z-20 w-48 md:hidden text-sky-50"
        >
          {/* 1. User Profile Header (Only shows if logged in) */}
          {user && (
            <div className="flex items-center space-x-3 pb-3 border-b border-blue-100 mb-2">
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-blue-200"
              />
              <span className="text-sm font-bold text-blue-800 truncate">{user.displayName}</span>
            </div>
          )}

          <MobileLink to="/Hypertrophy" label="Create Workout" toggleMenu={toggleMenu} />
          <MobileLink to="/SavedWorkouts" label="Saved Workouts" toggleMenu={toggleMenu} />
          <MobileLink to="/TrainingStyle" label="More Info" toggleMenu={toggleMenu} />

          {/* 3. Conditional Auth Button (Sign In OR Sign Out) */}
          {user ? (
            <button
              onClick={() => {
                handleLogout();
                toggleMenu();
              }}
              className="w-full text-left px-3 py-2 text-red-600 font-bold active:bg-red-200 rounded-lg transition"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => {
                loginWithGoogle();
                toggleMenu();
              }}
              className="w-full text-left px-3 py-2 text-green-600 font-bold rounded-lg transition active:bg-green-200"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;

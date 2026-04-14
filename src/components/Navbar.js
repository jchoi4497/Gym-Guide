import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { auth } from '../config/firebase'; // Import your auth instance
import { loginWithGoogle } from '../config/googleAuth'; // Import your function
import { signOut } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext';

function Navbar() {
  const { theme } = useTheme();
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
  function NavButton({ to, label }) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `font-medium transition-all px-4 py-2 rounded-lg ${
            isActive
              ? theme.navActive
              : `${theme.navText} ${theme.navHover}`
          }`
        }
      >
        {label}
      </NavLink>
    );
  }

  // Mobile Nav Link helper component
  function MobileLink({ to, label, toggleMenu }) {
    return (
      <NavLink
        to={to}
        onClick={toggleMenu}
        className={({ isActive }) =>
          `block rounded-lg px-3 py-2 transition-colors ${
            isActive
              ? theme.mobileMenuActive
              : `${theme.mobileMenuText} font-semibold`
          }`
        }
      >
        {label}
      </NavLink>
    );
  }

  return (
    <nav className={`flex items-center justify-between p-5 mb-8 ${theme.navBg} shadow-lg`}>
      {/* Brand */}
      <Link
        to="/"
        className={`text-xl sm:text-2xl md:text-3xl font-bold italic ${theme.navText} inline-block transition-transform duration-300 hover:scale-105 active:scale-95 origin-left truncate max-w-[60%] sm:max-w-none`}
      >
        JC's Gym Guide
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex space-x-6">
        <NavButton to="/Create" label="New Workout" />
        <NavButton to="/Calendar" label="Calendar" />
        <NavButton to="/Templates" label="Templates" />
        <NavButton to="/SavedWorkouts" label="History" />
        <NavButton to="/MyExercises" label="My Exercises" />
        <NavButton to="/Info" label="More Info" />

        {/* Profile UI */}
        {user ? (
          <div className={`flex items-center space-x-3 ml-4 border-l pl-6 ${theme.navText}`}>
            <NavLink
              to="/Profile"
              className={({ isActive }) =>
                `rounded-full ${
                  isActive
                    ? 'ring-4 ring-blue-300 ring-offset-2' // Highlighted state
                    : '' // Normal state
                }`
              }
            >
              <img
                src={user.photoURL}
                alt="Profile"
                className={`w-10 h-10 rounded-full border-2 shadow-sm cursor-pointer hover:border-blue-300 transition-all ${theme.navBorder}`}
              />
            </NavLink>
            <button
              onClick={handleLogout}
              className={`${theme.navText} hover:text-red-500 ${theme.navHover} transition-all px-4 py-2 rounded-lg`}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className={`flex items-center space-x-3 ml-4 border-l pl-6 ${theme.navText}`}>
            <button
              onClick={loginWithGoogle}
              className={`${theme.navText} ${theme.navHover} transition-all px-4 py-2 rounded-lg`}
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
        className={`${theme.navText} text-3xl md:hidden focus:outline-none z-30`}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute top-19 right-0 ${theme.mobileMenuBg} rounded-b-xl shadow-xl p-4 space-y-3 z-20 w-48 md:hidden`}
        >
          {/* 1. User Profile Header (Only shows if logged in) */}
          {user && (
            <NavLink
              to="/Profile"
              onClick={toggleMenu}
              className={({ isActive }) =>
                `flex items-center space-x-3 pb-3 border-b ${theme.mobileMenuBorder} mb-2 px-2 py-2 rounded-lg transition-colors ${
                  isActive
                    ? theme.mobileMenuActive
                    : theme.mobileMenuHover
                }`
              }
            >
              <img
                src={user.photoURL}
                alt="Profile"
                className={`w-8 h-8 rounded-full border ${theme.mobileMenuBorder}`}
              />
              <span className={`text-sm font-bold ${theme.mobileMenuText} truncate`}>{user.displayName}</span>
            </NavLink>
          )}

          <MobileLink to="/Create" label="New Workout" toggleMenu={toggleMenu} />
          <MobileLink to="/Calendar" label="Calendar" toggleMenu={toggleMenu} />
          <MobileLink to="/Templates" label="Templates" toggleMenu={toggleMenu} />
          <MobileLink to="/SavedWorkouts" label="History" toggleMenu={toggleMenu} />
          <MobileLink to="/MyExercises" label="My Exercises" toggleMenu={toggleMenu} />
          <MobileLink to="/Info" label="More Info" toggleMenu={toggleMenu} />

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

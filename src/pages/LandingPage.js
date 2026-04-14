import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../config/googleAuth';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext';

function LandingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        console.log('Logged in as:', user.displayName);
        // Redirect user to templates page
        navigate('/Templates');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className={`h-screen ${theme.pageBg} flex items-center justify-center`}>
      <div className={`${theme.cardBg} rounded-3xl shadow-2xl p-12 max-w-xl mx-6 text-center animate-fadeIn`}>
        <h1 className={`text-5xl font-extrabold ${theme.headerText} mb-6`}>Jonathan's Gym Guide</h1>
        <p className={`text-lg ${theme.cardTextSecondary} mb-8 italic`}>
          An in-depth fitness guide built from real-world experience & research.
        </p>

        {user && (
          <div className={`mb-8 flex items-center justify-center gap-4 ${theme.cardBgSecondary} rounded-2xl p-4 border-2 ${theme.cardBorder}`}>
            <img
              src={user.photoURL}
              alt="Profile"
              className={`w-12 h-12 rounded-full border-2 ${theme.cardBorder}`}
            />
            <div className="text-left">
              <p className={`font-bold ${theme.cardText}`}>Welcome back, {user.displayName?.split(' ')[0]}!</p>
              <p className={`text-sm ${theme.cardTextSecondary}`}>{user.email}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-8">
          <Link to="/Create">
            <button className={`px-8 py-3 rounded-full ${theme.btnPrimary} ${theme.btnPrimaryText} text-lg font-semibold shadow-lg transition-all duration-300 active:scale-95`}>
              Get Started
            </button>
          </Link>
          {user ? (
            <button
              onClick={handleLogout}
              className="px-8 py-3 rounded-full bg-red-600 text-white text-lg font-semibold shadow-lg transition-all duration-300 hover:bg-red-700 active:bg-red-600 active:scale-95"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className={`px-8 py-3 rounded-full ${theme.btnSecondary} ${theme.btnSecondaryText} text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl active:scale-95 inline-flex items-center gap-2 border ${theme.cardBorder}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

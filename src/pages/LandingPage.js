import { Link, useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../googleAuth';

function LandingPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        console.log('Logged in as:', user.displayName);
        // 3. Redirect user to dashboard programmatically
        navigate('/Hypertrophy');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-sky-300 to-stone-300 flex items-center justify-center">
      <div className="bg-sky-50 rounded-3xl shadow-2xl p-12 max-w-xl mx-6 text-center animate-fadeIn">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-6">Jonathan's Gym Guide</h1>
        <p className="text-lg text-gray-600 mb-8 italic">
          An in-depth fitness guide built from real-world experience & research.
        </p>
        <div className="flex items-center justify-center gap-8">
          <Link to="/TrainingStyle">
            <button className="px-8 py-3 rounded-full bg-blue-600 text-sky-50 text-lg font-semibold shadow-lg transition-all duration-300 hover:bg-blue-700 active:bg-blue-600 active:scale-95">
              Guide
            </button>
          </Link>
          <div>
            <button
              onClick={handleLogin}
              className="px-8 py-3 rounded-full bg-blue-600 text-sky-50 text-lg font-semibold shadow-lg transition-all duration-300 hover:bg-blue-700 active:bg-blue-600 active:scale-95"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

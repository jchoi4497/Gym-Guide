import { Link } from 'react-router-dom';

function LandingPage() {
    return (
        <div className="h-screen bg-gradient-to-br from-sky-300 to-stone-300 flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-xl mx-6 text-center animate-fadeIn">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                    Jonathan's Gym Guide
                </h1>
                <p className="text-lg text-gray-600 mb-8 italic">
                    An in-depth fitness guide built from real-world experience & research.
                </p>
                <Link to="/TrainingStyle">
                    <button className="px-8 py-3 rounded-full bg-blue-600 text-white text-lg font-semibold shadow-lg transition-all duration-300 hover:bg-blue-700 active:bg-blue-600 active:scale-95">
                        Get Started
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default LandingPage;
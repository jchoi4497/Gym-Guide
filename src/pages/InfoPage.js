import HypertrophyImage from '../images/Hypertrophy.png';
import Navbar from '../components/Navbar';
import { useTheme } from '../contexts/ThemeContext';

function InfoPage() {
  const { theme } = useTheme();

  return (
    <div className={`${theme.pageBg} min-h-screen pb-32 font-serif`}>
      <Navbar />

      <h1 className={`text-5xl font-bold text-center mb-10 italic ${theme.headerText}`}>Training Info</h1>

      <div className="flex flex-wrap gap-10 justify-center mb-16">
        <div>
          <h3 className={`text-xl font-serif text-center ${theme.cardText}`}>Hypertrophy Training</h3>
          <img
            src={HypertrophyImage}
            alt="Hypertrophy Training"
            className="w-72 h-72 object-cover border-2 border-solid rounded-2xl shadow-lg mb-6 mt-4"
          />
          <p className={`text-center w-72 h-12 font-serif ${theme.cardTextSecondary}`}>Program designed to increase muscle size and mass.</p>
        </div>
      </div>

      <div className={`max-w-5xl mx-auto ${theme.cardBg} rounded-3xl shadow-2xl p-10 ${theme.cardText} space-y-6`}>
        <h3 className={`text-2xl font-bold underline mb-4 ${theme.cardText}`}>📌 Key Insights for Optimal Results</h3>
        <ul className={`space-y-3 text-lg leading-relaxed ${theme.cardText}`}>
          <li>
            <strong>Discipline:</strong> Train consistently. I personally go to the gym four times a
            week to stay strong and keep improving. The journey matters more than the destination.
          </li>
          <li>
            <strong>Nutrition:</strong> Keep a diet tailored to your goal — bulking, cutting, or
            maintaining — by balancing nutrients and being consistent.
            <div className="pl-6 mt-2 space-y-1">
              <p>📉 Calories in &lt; Calories out → Lose weight</p>
              <p>📈 Calories in &gt; Calories out → Gain weight</p>
              <p>💪 Prioritize protein intake to fuel muscle growth.</p>
            </div>
          </li>
          <li>
            <strong>Intensity:</strong> Every working set (except warm-ups) should push close to
            failure to stimulate maximum growth.
          </li>
          <li>
            <strong>Warm-Ups:</strong> A proper warm-up routine reduces injury risk and improves
            workout performance.
          </li>
          <li>
            <strong>Cardio:</strong> I usually do 30 minutes of cardio post-workout to burn extra
            calories, improve heart health, and stay energized.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default InfoPage;

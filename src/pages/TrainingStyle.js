import WorkoutType from '../WorkoutType';
import HypertrophyImage from '../images/Hypertrophy.png';
import StrengthImage from '../images/Strength.jpg';

function TrainingStylePage() {

    return (
        <div className="p-7 bg-stone-200 h-screen font-serif overflow-y-auto">
            <h1 className="text-4xl text-center mt-6 italic">Training Style</h1>
            <div className="flex space-x-10 justify-center mt-7">
                <WorkoutType to="/Hypertrophy" type='Hypertrophy' image={HypertrophyImage} desc='Program designed to increase muscle size and mass.' />
                {/* <WorkoutType to="/Strength" type='Strength' image={StrengthImage} desc='Program designed to build muscle strength and mass' /> */}
            </div>
            <div className="bg-stone-200 p-4 max-w-6xl mx-auto">
                <h3 className="underline">* Key insights for optimal results *</h3>
                <p>1. Discipline, Train consistently-progress comes from regular effort. I personally go to the gym four times a week to stay strong and keep improving. Remember, the journey is more important than the destination.</p>
                <p>2. Maintain a consistent diet tailored to your goals—whether it's bulking, leaning out, or maintaining weight—by balancing nutrients and staying disciplined with your intake.</p>
                <p className="pl-5">- (Caloric intake &lt; Caloric Caloric expenditure) --&gt; Lose Weight</p>
                <p className="pl-5">- (Caloric intake &gt; Caloric Caloric expenditure) --&gt; Gain Weight</p>
                <p className="pl-5">- To build muscle effectively, the majority of your calories should come from protein.</p>
                <p>3. Intensity should be key in your workouts, with every set (except the first) pushed to failure to maximize muscle growth.</p>
                <p>4. Proper warm-ups should be a crucial part of your workout routine.</p>
                <p>5. Cardio! I most of the time include 30 minutes of cardio at the end of my workouts to burn extra calories, improve cardiovascular health, and boost energy while winding down after strength training.</p>

            </div>
        </div>
    );
}

export default TrainingStylePage;
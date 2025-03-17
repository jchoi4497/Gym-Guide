import WorkoutType from '../WorkoutType'
import HypertrophyImage from '../images/Hypertrophy.png'
import StrengthImage from '../images/Strength.jpg'

function TrainingStylePage() {

    return (
    <div className="p-7 bg-stone-200 h-screen">
        <h1 className="text-4xl text-center mt-6">Choose your training style</h1>
            <div className="flex space-x-10 justify-center mt-7">
                <WorkoutType to="/HypertrophyPage" type='Hypertrophy' image={HypertrophyImage} desc='Program designed to increase muscle size and mass.'/>
                <WorkoutType to="/StrengthPage" type='Strength' image={StrengthImage} desc='Program designed to build muscle strength and mass'/>
            </div>
    </div>
)
}

export default TrainingStylePage
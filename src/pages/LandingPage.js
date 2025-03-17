import { Link } from 'react-router-dom'

function LandingPage(){
    return (
    <div className="p-7 bg-stone-200 h-screen flex items-center justify-center">
        <div className="text-center">
            <h1 className="text-4xl text-center mb-6">Jonathans Gym Guide</h1>
                <Link to="/TrainingStylePage">
                    <button className="px-6 py-2"> Get Started </button>
                </Link>
        </div>
    </div>
    )
}

export default LandingPage
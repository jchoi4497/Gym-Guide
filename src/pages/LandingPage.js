import { Link } from 'react-router-dom'

function LandingPage(){
    return (
    <div className="p-7 bg-stone-200 h-screen flex items-center justify-center font-serif">
        <div className="text-center">
            <h1 className="text-4xl text-center mb-6">Jonathan's Gym Guide</h1>
            <div className="italic mb-6">
                - An in depth gym guide developed through personal experience and research.
            </div>
            <Link to="/TrainingStyle">
                <button className="px-6 py-2 border rounded-lg shadow-lg
                                    transition-all duration-300 hover:filter hover:saturate-100 hover:brightness-75 hover:bg-stone-200 hover:border-white
                                    active:bg-stone-400 active:text-white cursor-pointer"
                >
                     Get Started 
                </button>
            </Link>
        </div>
    </div>
    )
}

export default LandingPage
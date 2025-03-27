import { Link } from "react-router-dom"

function WorkoutType ({type, image, desc, to}) {
    return ( 
    <div>
        <h3 className="text-xl font-serif">{type} Training</h3>
            <Link to={to}>
                <img src={image}
                className=
                "w-72 h-72 object-cover border-2 border-solid transition-all duration-300 hover:filter hover:saturate-150 hover:brightness-75 rounded-lg shadow-lg mb-6 mt-4 hover:border-white active:border-stone-400"
                />
            </Link>
            <p className="text-center w-72 h-72 italic font-serif">{desc}</p>
    </div>
    
)
}

export default WorkoutType
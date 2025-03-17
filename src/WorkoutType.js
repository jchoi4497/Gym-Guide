import { Link } from "react-router-dom"

function WorkoutType ({type, image, desc, to}) {
    return ( 
    <div>
        <h3>{type} Training</h3>
            <Link to={to}>
                <img src={image}
                className=
                "w-72 h-72 object-cover border-2 border-solid transition-all duration-300 hover:filter hover:hue-rotate-180 hover:saturate-150 hover:brightness-75"
                />
            </Link>
            <p className="text-center w-72 h-72">{desc}</p>
    </div>
    
)
}

export default WorkoutType
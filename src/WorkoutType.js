import { Link } from "react-router-dom";

function WorkoutType({ type, image, desc, to }) {
    return (
        <div>
            <h3 className="text-xl font-serif text-center">{type} Training</h3>
            <Link to={to}>
                <img
                    src={image}
                    className="
                    w-72 h-72 object-cover border-white border-2 border-solid
                    transition-all duration-300
                    hover:scale-110 active:scale-110 hover:saturate-125
                    rounded-2xl shadow-lg mb-6 mt-4
                    hover:border-blue-500 active:border-stone-400
                    "
                />
            </Link>
            <p className="text-center w-72 h-12 font-serif">{desc}</p>
        </div>

    );
}

export default WorkoutType;
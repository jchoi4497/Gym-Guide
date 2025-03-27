
// either create seperate components for each muscle group and make columns dynamic. or make both dynamic.
// 
function Plan({ target, reps }) {
    return <div className="flex justify-center">
        {target?.label}
        {reps?.label}
    </div>
}

export default Plan
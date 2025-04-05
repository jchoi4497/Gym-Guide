function Colors({ color }) {
    
    const sky = [
      "bg-sky-100", "bg-sky-200", "bg-sky-300", "bg-sky-400",
      "bg-sky-500", "bg-sky-600", "bg-sky-700", "bg-sky-800", "bg-sky-900"
    ]

    const blue = [
      "bg-blue-100", "bg-blue-200", "bg-blue-300", "bg-blue-400", 
      "bg-blue-500", "bg-blue-600", "bg-blue-700", "bg-blue-800", "bg-blue-900"
    ];

    const red = [
      "bg-red-100", "bg-red-200", "bg-red-300", "bg-red-400", 
      "bg-red-500", "bg-red-600", "bg-red-700", "bg-red-800", "bg-red-900"
    ];
    
    const rose = [
      "bg-rose-100", "bg-rose-200", "bg-rose-300", "bg-rose-400", 
      "bg-rose-500", "bg-rose-600", "bg-rose-700", "bg-rose-800", "bg-rose-900"
    ];
    
    const slate = [
      "bg-slate-100", "bg-slate-200", "bg-slate-300", "bg-slate-400", 
      "bg-slate-500", "bg-slate-600", "bg-slate-700", "bg-slate-800", "bg-slate-900"
    ];
    
    const stone = [
      "bg-stone-100", "bg-stone-200", "bg-stone-300", "bg-stone-400", 
      "bg-stone-500", "bg-stone-600", "bg-stone-700", "bg-stone-800", "bg-stone-900"
    ];
    
    const yellow = [
      "bg-yellow-100", "bg-yellow-200", "bg-yellow-300", "bg-yellow-400", 
      "bg-yellow-500", "bg-yellow-600", "bg-yellow-700", "bg-yellow-800", "bg-yellow-900"
    ];

    const amber = [
      "bg-amber-100", "bg-amber-200", "bg-amber-300", "bg-amber-400", 
      "bg-amber-500", "bg-amber-600", "bg-amber-700", "bg-amber-800", "bg-amber-900"
    ];

    const green = [
      "bg-green-100", "bg-green-200", "bg-green-300", "bg-green-400", 
      "bg-green-500", "bg-green-600", "bg-green-700", "bg-green-800", "bg-green-900"
    ];

    const emerald = [
      "bg-emerald-100", "bg-emerald-200", "bg-emerald-300", "bg-emerald-400", 
      "bg-emerald-500", "bg-emerald-600", "bg-emerald-700", "bg-emerald-800", "bg-emerald-900"
    ];

    const pastelPurple = [
      "bg-pastelPurple-100", "bg-pastelPurple-200", "bg-pastelPurple-300", "bg-pastelPurple-400", 
      "bg-pastelPurple-500", "bg-pastelPurple-600", "bg-pastelPurple-700", "bg-pastelPurple-800", "bg-pastelPurple-900" 
    ]


    const colors = {
      sky,
      blue,
      red,
      rose,
      slate,
      stone,
      yellow,
      amber,
      green,
      emerald,
      pastelPurple,
    }

    const colorProp = colors[color]
  
    return (
      <div className="font-serif">
        
        <div className="">
            {color} shades
        </div>

        <div className="items-center flex">
            {colorProp.map((shade, index) => (
                <div key={index} className={`w-15 h-15 ${shade}`}></div>
            ))}
        </div>

      </div>
      
    );
  }
  
  export default Colors;
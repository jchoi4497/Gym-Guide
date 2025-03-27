 import React, { useState, useEffect, useRef} from "react"
 import Panel from "./Panel";
 
 
 function DropDown ({ options, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef()

    useEffect(() => {
        const handler = (event) => {
            if(!dropdownRef.current){
                return
            }
            if (!dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('click', handler, true);

        return () => {
          document.removeEventListener('click', handler);
         };

    }, []);

        const handleClick = () => {
            setIsOpen(!isOpen)
        }

        const handleOptionClick = (option) => {
            setIsOpen(false)
            onChange(option)
        }
        
        const renderedOptions = options.map((option) => {
            return <div 
                        className="hover:bg-sky-100 rounded cursor-pointer p-1 italic font-serif active:bg-sky-200"
                        onClick={() => handleOptionClick(option)}
                        key={option.value}
                    >
                {option.label}
                </div>
        })

      return (
        <div ref={dropdownRef} className="w-48 relative">
            <Panel 
                className="flex justify-between items-center cursor-pointer italic font-serif active:bg-stone-200 hover:bg-stone-100"
                onClick={handleClick}
            >
                {value?.label || 'Select ...'}
            </Panel>
            {isOpen && (
            <Panel className="absolute top-full">
                {renderedOptions}
            </Panel>)}
        </div>
      )

 }

 export default DropDown
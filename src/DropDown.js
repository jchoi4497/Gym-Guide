import { useState, useEffect, useRef, useMemo } from "react";
import Panel from "./Panel";


function DropDown({ options, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef();

    useEffect(() => {
        const handler = (event) => {
            if (!dropdownRef.current) {
                return;
            }
            if (!dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handler, true);

        return () => {
            document.removeEventListener('click', handler);
        };

    }, []);

    const handleClick = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option) => {
        setIsOpen(false);
        onChange(option);
    };

    const renderedOptions = options?.map((option) => {
        return <div
            className="hover:bg-sky-100 rounded cursor-pointer p-2 italic font-serif active:bg-sky-200"
            onClick={() => handleOptionClick(option.value)}
            key={option.value}
        >
            {option.label}
        </div>;
    });
    const label = useMemo(() => {
        return options.find(option => {
            return option.value === value;
        })?.label;
    });

    return (
        <div ref={dropdownRef} className="relative">
            <Panel
                className="flex justify-between items-center cursor-pointer italic font-serif active:bg-stone-200 hover:bg-stone-100 p-2 min-w-70"
                onClick={handleClick}
            >
                {label || 'Select ...'}
            </Panel>
            {isOpen && (
                <Panel className="absolute top-full left-0 w-full bg-white shadow-lg z-10 rounded max-h-60 overflow-y-auto">
                    {renderedOptions}
                </Panel>)}
        </div>
    );
}

export default DropDown;
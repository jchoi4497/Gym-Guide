import { useState, useEffect, useRef, useMemo } from "react";
import Panel from "./Panel";


function DropDown({ options, value, onChange, favorites = [], onToggleFavorite }) {
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

    const handleStarClick = (e, optionValue) => {
        e.stopPropagation(); // Prevent dropdown from selecting the option
        if (onToggleFavorite) {
            onToggleFavorite(optionValue);
        }
    };

    // Sort options: favorites first, then rest
    const sortedOptions = useMemo(() => {
        if (!options) return [];
        const favorited = options.filter(opt => favorites.includes(opt.value));
        const notFavorited = options.filter(opt => !favorites.includes(opt.value));
        return [...favorited, ...notFavorited];
    }, [options, favorites]);

    const renderedOptions = sortedOptions?.map((option) => {
        const isFavorite = favorites.includes(option.value);
        return <div
            className="hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 rounded-md cursor-pointer p-3 italic font-serif
                       active:bg-blue-300 transition-colors duration-200 flex justify-between items-center"
            onClick={() => handleOptionClick(option.value)}
            key={option.value}
        >
            <span>{option.label}</span>
            {onToggleFavorite && (
                <button
                    onClick={(e) => handleStarClick(e, option.value)}
                    className="ml-2 text-xl hover:scale-110 transition-transform"
                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    {isFavorite ? '★' : '☆'}
                </button>
            )}
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
                className="flex justify-between items-center cursor-pointer italic font-serif p-3 min-w-[280px]
                           rounded-md bg-gradient-to-r from-blue-50 to-blue-100
                           shadow-sm hover:from-blue-100 hover:to-blue-200
                           active:from-blue-200 active:to-blue-300
                           transition-colors duration-300"
                onClick={handleClick}
            >
                {label || 'Select ...'}
            </Panel>
            {isOpen && (
                <Panel className="absolute top-full left-0 w-full bg-sky-50 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto mt-1">
                    {renderedOptions}
                </Panel>)}
        </div>
    );
}

export default DropDown;
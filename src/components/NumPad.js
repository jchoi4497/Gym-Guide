import { useState, useEffect } from 'react';

function NumPad({ value, onChange, label = '', allowDecimals = true }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value) {
      setDisplayValue(value.toString());
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleNumberClick = (num) => {
    // Prevent leading zeros (e.g., "05" should just be "5")
    if (displayValue === '0' && num !== '.') {
      setDisplayValue(num);
      onChange(num);
      return;
    }

    const newValue = displayValue + num;
    setDisplayValue(newValue);
    onChange(newValue);
  };

  const handleDecimal = () => {
    if (!allowDecimals) return;
    if (!displayValue.includes('.')) {
      const newValue = displayValue ? displayValue + '.' : '0.';
      setDisplayValue(newValue);
      onChange(newValue);
    }
  };

  const handleBackspace = () => {
    const newValue = displayValue.slice(0, -1);
    setDisplayValue(newValue);
    onChange(newValue || '');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[280px]">
      {label && <div className="text-sm text-gray-600 mb-2 font-medium">{label}</div>}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num.toString())}
            className="bg-white border border-gray-300 rounded-lg h-12 text-lg font-semibold text-gray-900 active:bg-gray-200 transition-colors"
          >
            {num}
          </button>
        ))}

        {/* Bottom row - same layout for both */}
        <button
          onClick={allowDecimals ? handleDecimal : () => handleNumberClick('0')}
          className="bg-white border border-gray-300 rounded-lg h-12 text-lg font-semibold text-gray-900 active:bg-gray-200 transition-colors"
        >
          {allowDecimals ? '.' : '0'}
        </button>

        <button
          onClick={() => handleNumberClick('0')}
          className="bg-white border border-gray-300 rounded-lg h-12 text-lg font-semibold text-gray-900 active:bg-gray-200 transition-colors"
        >
          0
        </button>

        <button
          onClick={handleBackspace}
          className="bg-white border border-gray-300 rounded-lg h-12 text-lg font-semibold text-gray-700 active:bg-gray-200 transition-colors"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}

export default NumPad;

import { useState, useEffect } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export default function PriceRangeSlider({ min, max, value, onChange }: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value);
    const newValue: [number, number] = [newMin, Math.max(newMin, localValue[1])];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value);
    const newValue: [number, number] = [Math.min(localValue[0], newMax), newMax];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR').format(price);

  return (
    <div className="space-y-4">
      {/* Values display */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{formatPrice(localValue[0])} FCFA</span>
        <span className="text-gray-400">-</span>
        <span className="font-medium text-gray-700">{formatPrice(localValue[1])} FCFA</span>
      </div>

      {/* Slider track */}
      <div className="relative pt-2">
        {/* Background track */}
        <div className="absolute h-1 w-full bg-gray-200 rounded" />

        {/* Active range track */}
        <div
          className="absolute h-1 bg-[#73C8D2] rounded"
          style={{
            left: `${((localValue[0] - min) / (max - min)) * 100}%`,
            right: `${100 - ((localValue[1] - min) / (max - min)) * 100}%`,
          }}
        />

        {/* Min handle */}
        <input
          type="range"
          min={min}
          max={max}
          value={localValue[0]}
          onChange={handleMinChange}
          className="absolute w-full z-20 appearance-none bg-transparent
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-[#73C8D2]
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:shadow"
        />

        {/* Max handle */}
        <input
          type="range"
          min={min}
          max={max}
          value={localValue[1]}
          onChange={handleMaxChange}
          className="absolute w-full z-10 appearance-none bg-transparent
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-[#73C8D2]
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:shadow"
        />
      </div>
    </div>
  );
}

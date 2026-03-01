'use client';

interface GuestCounterProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}

export default function GuestCounter({ value, onChange, min = 1, max = 20 }: GuestCounterProps) {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-white font-medium">Guests</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="w-10 h-10 rounded-xl bg-gray-800/80 border border-gray-600 text-white font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-500 transition-colors"
        >
          −
        </button>
        <span className="text-white font-bold w-8 text-center">{value}</span>
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="w-10 h-10 rounded-xl bg-teal-500 text-white font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-400 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

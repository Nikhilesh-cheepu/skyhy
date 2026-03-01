'use client';

export type MealType = 'lunch' | 'dinner';

interface MealToggleProps {
  value: MealType;
  onChange: (v: MealType) => void;
}

export default function MealToggle({ value, onChange }: MealToggleProps) {
  return (
    <div className="flex gap-2 p-1 bg-gray-800/80 rounded-xl">
      <button
        type="button"
        onClick={() => onChange('lunch')}
        className={`
          flex-1 py-3 rounded-lg font-semibold transition-all duration-200
          ${
            value === 'lunch'
              ? 'bg-teal-500 text-white shadow-md'
              : 'bg-transparent text-white/80 hover:text-white'
          }
        `}
      >
        Lunch
      </button>
      <button
        type="button"
        onClick={() => onChange('dinner')}
        className={`
          flex-1 py-3 rounded-lg font-semibold transition-all duration-200
          ${
            value === 'dinner'
              ? 'bg-teal-500 text-white shadow-md'
              : 'bg-transparent text-white/80 hover:text-white'
          }
        `}
      >
        Dinner
      </button>
    </div>
  );
}

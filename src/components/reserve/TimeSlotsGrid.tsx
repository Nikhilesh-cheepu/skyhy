'use client';

import type { MealType } from './MealToggle';
import { getSlotsForMeal } from './timeSlots';

interface TimeSlotsGridProps {
  meal: MealType;
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export default function TimeSlotsGrid({ meal, selectedTime, onSelect }: TimeSlotsGridProps) {
  const slots = getSlotsForMeal(meal);

  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map((slot) => {
        const isSelected = selectedTime === slot;
        return (
          <button
            key={slot}
            type="button"
            onClick={() => onSelect(slot)}
            className={`
              py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200
              active:scale-95
              ${
                isSelected
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'bg-gray-800/60 text-white/90 border border-gray-600 hover:border-gray-500'
              }
            `}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}

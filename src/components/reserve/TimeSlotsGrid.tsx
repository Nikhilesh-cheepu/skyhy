'use client';

import type { MealType } from './MealToggle';

function generateSlots(meal: MealType): string[] {
  const slots: string[] = [];
  if (meal === 'lunch') {
    for (let h = 12; h <= 16; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 16 && m > 45) break;
        const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        const ampm = h >= 12 ? 'PM' : 'AM';
        slots.push(`${hour12}:${m.toString().padStart(2, '0')} ${ampm}`);
      }
    }
  } else {
    for (let h = 18; h <= 23; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour12 = h > 12 ? h - 12 : h;
        const ampm = 'PM';
        slots.push(`${hour12}:${m.toString().padStart(2, '0')} ${ampm}`);
      }
    }
  }
  return slots;
}

interface TimeSlotsGridProps {
  meal: MealType;
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export default function TimeSlotsGrid({ meal, selectedTime, onSelect }: TimeSlotsGridProps) {
  const slots = generateSlots(meal);

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

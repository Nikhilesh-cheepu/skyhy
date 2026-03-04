'use client';

import type { MealType } from './MealToggle';
import { getSlotsForMeal } from './timeSlots';

interface TimeSlotsGridProps {
  meal: MealType;
  selectedTime: string | null;
  selectedDate: string;
  onSelect: (time: string) => void;
}

function isFutureSlot(slot: string, selectedDate: string): boolean {
  // If not today, always show
  const todayIso = new Date().toISOString().split('T')[0];
  if (selectedDate !== todayIso) return true;

  const match = slot.match(/^(\d+):(\d{2}) (AM|PM)$/);
  if (!match) return true;
  const [, hStr, mStr, ampm] = match;
  let hours = Number(hStr);
  const minutes = Number(mStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return true;
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const slotDate = new Date(`${selectedDate}T00:00:00`);
  slotDate.setHours(hours, minutes, 0, 0);

  return slotDate.getTime() > Date.now();
}

export default function TimeSlotsGrid({ meal, selectedTime, selectedDate, onSelect }: TimeSlotsGridProps) {
  const allSlots = getSlotsForMeal(meal);
  const slots = allSlots.filter((slot) => isFutureSlot(slot, selectedDate));

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

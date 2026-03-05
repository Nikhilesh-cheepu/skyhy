'use client';

import type { MealType } from './MealToggle';
import { getSlotsForMeal } from './timeSlots';

interface TimeSlotsGridProps {
  meal: MealType;
  selectedTime: string | null;
  selectedDate: string;
  onSelect: (time: string) => void;
}

const IST_TIME_ZONE = 'Asia/Kolkata';

function getTodayIstIso(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: IST_TIME_ZONE });
}

function getIstNow(): Date {
  const now = new Date();
  const istString = now.toLocaleString('en-US', { timeZone: IST_TIME_ZONE });
  return new Date(istString);
}

function isFutureSlot(slot: string, selectedDate: string): boolean {
  const todayIso = getTodayIstIso();
  // If not today (IST), always show
  if (selectedDate !== todayIso) return true;

  const match = slot.match(/^(\d+):(\d{2}) (AM|PM)$/);
  if (!match) return true;
  const [, hStr, mStr, ampm] = match;
  let hours = Number(hStr);
  const minutes = Number(mStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return true;
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const istNow = getIstNow();
  const currentMinutes = istNow.getHours() * 60 + istNow.getMinutes();
  const slotMinutes = hours * 60 + minutes;

  return slotMinutes > currentMinutes;
}

export default function TimeSlotsGrid({ meal, selectedTime, selectedDate, onSelect }: TimeSlotsGridProps) {
  const allSlots = getSlotsForMeal(meal);
  const futureSlots = allSlots.filter((slot) => isFutureSlot(slot, selectedDate));
  const slots = futureSlots.length > 0 ? futureSlots : allSlots;

  return (
    <div className="grid grid-cols-4 gap-2">
      {futureSlots.length === 0 && (
        <p className="col-span-full text-xs text-white/60 mb-1">No slots left today — all times shown for reference. Pick another date for available slots.</p>
      )}
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

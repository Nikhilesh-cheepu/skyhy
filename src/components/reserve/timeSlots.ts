import type { MealType } from './MealToggle';

/**
 * Lunch: 12:00 PM – 6:00 PM (15-min steps).
 * Dinner: 6:15 PM – 11:45 PM (15-min steps).
 */
export function getSlotsForMeal(meal: MealType): string[] {
  const slots: string[] = [];
  if (meal === 'lunch') {
    for (let h = 12; h <= 18; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 18 && m > 0) break;
        const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        const ampm = h >= 12 ? 'PM' : 'AM';
        slots.push(`${hour12}:${m.toString().padStart(2, '0')} ${ampm}`);
      }
    }
  } else {
    for (let h = 18; h <= 23; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 18 && m < 15) continue;
        if (h === 23 && m > 45) continue;
        const hour12 = h > 12 ? h - 12 : h;
        slots.push(`${hour12}:${m.toString().padStart(2, '0')} PM`);
      }
    }
  }
  return slots;
}

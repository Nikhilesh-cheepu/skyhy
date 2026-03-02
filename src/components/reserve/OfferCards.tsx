'use client';

import type { MealType } from './MealToggle';

export interface Offer {
  id: string;
  title: string;
  timing: string;
}

/** Single source of truth for offer display names (used in UI + WhatsApp). */
export const OFFER_TITLES = {
  EAT_DRINK_128: 'Eat & Drink Anything @ ₹128',
  DISCOUNT_ALACARTE_25: '25% Discount on À la carte',
} as const;

export const OFFERS: Offer[] = [
  { id: 'eat-drink-128', title: OFFER_TITLES.EAT_DRINK_128, timing: '12 PM – 7:15 PM' },
  { id: 'alacarte-25', title: OFFER_TITLES.DISCOUNT_ALACARTE_25, timing: 'All day' },
];

/** Parse "6:15 PM" to minutes since midnight. 12 PM = 720, 7:15 PM = 1155 */
function parseTimeToMinutes(s: string): number | null {
  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

/** ₹128 offer is valid only 12:00 PM – 7:15 PM inclusive. Outside this range, hide the offer entirely. */
export function is128OfferValid(selectedTime: string): boolean {
  const mins = parseTimeToMinutes(selectedTime);
  if (mins == null) return false;
  const start = 12 * 60; // 12:00 PM
  const end = 19 * 60 + 15; // 7:15 PM inclusive
  return mins >= start && mins <= end;
}

const OFFERS_HEADING_TAGLINE = 'Limited slots available';

interface OfferCardsProps {
  meal: MealType;
  selectedTime: string | null;
  selectedOfferId: string | null;
  onSelect: (id: string | null) => void;
}

export default function OfferCards({ meal, selectedTime, selectedOfferId, onSelect }: OfferCardsProps) {
  const showEatDrink128 =
    meal === 'lunch' && selectedTime !== null && is128OfferValid(selectedTime);
  const visibleOffers = selectedTime
    ? OFFERS.filter((o) => o.id !== 'eat-drink-128' || showEatDrink128)
    : [];

  if (!selectedTime) return null;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span className="text-amber-400">✦</span>
          Available offers for {selectedTime}
        </h3>
        <p className="text-white/60 text-xs mt-1">{OFFERS_HEADING_TAGLINE}</p>
      </div>
      <div className="space-y-2">
        {visibleOffers.map((offer) => {
          const isChecked = selectedOfferId === offer.id;
          return (
            <button
              key={offer.id}
              type="button"
              onClick={() => onSelect(isChecked ? null : offer.id)}
              className={`
                w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200
                ${
                  isChecked
                    ? 'bg-gray-700/60 border-teal-500/60'
                    : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                }
              `}
            >
              <div
                className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                  ${isChecked ? 'bg-teal-500 border-teal-500' : 'border-gray-500'}
                `}
              >
                {isChecked && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-white font-medium">{offer.title}</p>
                <p className="text-sm text-white/70">{offer.timing}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

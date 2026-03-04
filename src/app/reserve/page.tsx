'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/Footer';
import DateChips from '@/components/reserve/DateChips';
import MealToggle, { type MealType } from '@/components/reserve/MealToggle';
import TimeSlotsGrid from '@/components/reserve/TimeSlotsGrid';
import OfferCards, { OFFERS, is128OfferValid } from '@/components/reserve/OfferCards';
import { getSlotsForMeal } from '@/components/reserve/timeSlots';
import GuestCounter from '@/components/reserve/GuestCounter';
import PageTopBar from '@/components/PageTopBar';
import PhoneLogin from '@/components/PhoneLogin';

const WHATSAPP_NUMBER = '7013884485';
const RESERVE_DRAFT_KEY = 'reserveDraft';

type ReserveDraft = {
  date: string;
  meal: MealType;
  selectedTime: string | null;
  selectedOfferId: string | null;
  guests: number;
  name: string;
};

function loadDraft(): Partial<ReserveDraft> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(RESERVE_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ReserveDraft>;
  } catch {
    return null;
  }
}

function saveDraft(draft: ReserveDraft) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(RESERVE_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore
  }
}

function clearDraft() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(RESERVE_DRAFT_KEY);
  } catch {
    // ignore
  }
}

const defaultDate = () => new Date().toISOString().split('T')[0];

export default function ReservePage() {
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [meal, setMeal] = useState<MealType>('dinner');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [formError, setFormError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState<{ phone: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const selectedOffer = OFFERS.find((o) => o.id === selectedOfferId);

  useEffect(() => {
    const draft = loadDraft();
    if (draft?.date) setSelectedDate(draft.date);
    if (draft?.meal) setMeal(draft.meal);
    if (draft?.selectedTime) setSelectedTime(draft.selectedTime);
    if (draft?.selectedOfferId !== undefined) setSelectedOfferId(draft.selectedOfferId);
    if (draft?.guests != null) setGuests(draft.guests);
    if (draft?.name != null) setName(draft.name);
  }, []);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.phone) setUser({ phone: data.user.phone });
      })
      .catch(() => {});
  }, [showLoginModal]);

  useEffect(() => {
    saveDraft({
      date: selectedDate,
      meal,
      selectedTime,
      selectedOfferId,
      guests,
      name,
    });
  }, [selectedDate, meal, selectedTime, selectedOfferId, guests, name]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const formatDateDisplay = (iso: string) => {
    const d = new Date(iso + 'T12:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const t = new Date(d);
    t.setHours(0, 0, 0, 0);
    if (t.getTime() === today.getTime()) return 'Today';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const validate = useCallback(() => {
    setFormError('');
    let valid = true;
    if (!name.trim()) {
      setNameError('Full name is required');
      valid = false;
    } else {
      setNameError('');
    }
    if (!selectedTime) {
      setFormError('Please select a time slot.');
      valid = false;
    }
    if (!selectedDate) {
      setFormError('Please select a date.');
      valid = false;
    }
    return valid;
  }, [name, selectedTime, selectedDate]);

  const doCreateAndWhatsApp = useCallback(
    async (phone: string) => {
      if (!selectedTime || !name.trim()) return;
      setFormError('');
      try {
        await fetch('/api/events/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: name.trim(),
            mobile: phone,
            date: selectedDate,
            time: selectedTime,
            people: guests,
            ticketPrice: 0,
            paymentStatus: 'BOOKING_CREATED',
          }),
        });
      } catch {
        // continue to WhatsApp even if API fails
      }
      const dateStr = formatDateDisplay(selectedDate);
      const offerStr = selectedOffer ? selectedOffer.title : 'None';
      const text = [
        'Hi SKYHY Live, I want to reserve a table.',
        `Date: ${dateStr}`,
        `Time: ${selectedTime}`,
        `Meal: ${meal.charAt(0).toUpperCase() + meal.slice(1)}`,
        `Guests: ${guests}`,
        `Offer: ${offerStr}`,
        `Name: ${name.trim()}`,
        `Mobile: ${phone}`,
      ].join('%0A');
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
      clearDraft();
      setShowConfirmModal(false);
    },
    [selectedDate, selectedTime, meal, guests, selectedOffer, name]
  );

  const handleLoginSuccess = useCallback(() => {
    setShowLoginModal(false);
    setToast('Logged in ✅ Continuing…');
    fetch('/api/auth/session')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.phone) {
          setUser({ phone: data.user.phone });
          doCreateAndWhatsApp(data.user.phone);
        }
      })
      .catch(() => setFormError('Could not continue. Please try again.'));
  }, [doCreateAndWhatsApp]);

  const handleCtaClick = () => {
    if (!validate()) return;
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowConfirmModal(true);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-black">
      <div className="pb-24 pt-6 md:pt-8">
        <div className="mx-auto max-w-lg px-4">
          <PageTopBar
            title="Reserve Your Table"
            fallbackHref="/"
          />

          <section className="mb-5">
            <DateChips selectedDate={selectedDate} onSelect={setSelectedDate} />
          </section>

          <section className="mb-5">
            <MealToggle
              value={meal}
              onChange={(m) => {
                setMeal(m);
                const slotsForNewMeal = getSlotsForMeal(m);
                if (selectedTime && !slotsForNewMeal.includes(selectedTime)) {
                  setSelectedTime(null);
                  setSelectedOfferId(null);
                }
              }}
            />
          </section>

          <section className="mb-5">
            <p className="mb-2 text-sm font-medium text-white/80">Select time</p>
            <TimeSlotsGrid
              meal={meal}
              selectedTime={selectedTime}
              selectedDate={selectedDate}
              onSelect={(time) => {
                setSelectedTime(time);
                if (selectedOfferId === 'eat-drink-128' && !is128OfferValid(time)) {
                  setSelectedOfferId(null);
                }
              }}
            />
          </section>

          {selectedTime && (
            <section className="mb-5">
              <OfferCards
                meal={meal}
                selectedTime={selectedTime}
                selectedOfferId={selectedOfferId}
                onSelect={setSelectedOfferId}
              />
            </section>
          )}

          <section className="mb-5">
            <div className="rounded-2xl border border-white/10 bg-black/70 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.9)]">
              <GuestCounter value={guests} onChange={setGuests} />
            </div>
          </section>

          <section className="mb-6 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-white"
              >
                Full name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(''); }}
                placeholder="Full name *"
                className={`w-full rounded-2xl border px-4 py-3 bg-black/70 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/60 transition-all ${
                  nameError ? 'border-red-500/70' : 'border-white/15'
                }`}
              />
              {nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}
            </div>
          </section>

          {formError && (
            <p className="mb-3 text-xs text-red-400">{formError}</p>
          )}

          <motion.button
            type="button"
            onClick={handleCtaClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] py-3.5 text-base font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.8)] hover:from-[#1D4ED8] hover:to-[#2563EB] transition-colors"
          >
            {user ? 'Confirm booking' : 'Login to confirm booking'}
          </motion.button>
          <p className="mt-2 text-center text-xs text-white/50">
            We&apos;ll use your logged-in number for confirmation &amp; WhatsApp updates.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showConfirmModal && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/15 bg-black p-6 shadow-[0_24px_60px_rgba(0,0,0,0.9)]"
            >
              <h3 className="mb-4 text-xl font-bold text-white">Booking Summary</h3>
              <div className="space-y-2 text-sm text-white/90">
                <p><span className="text-white/60">Date:</span> {formatDateDisplay(selectedDate)}</p>
                <p><span className="text-white/60">Time:</span> {selectedTime || '—'}</p>
                <p><span className="text-white/60">Meal:</span> {meal.charAt(0).toUpperCase() + meal.slice(1)}</p>
                <p><span className="text-white/60">Guests:</span> {guests}</p>
                <p><span className="text-white/60">Offer:</span> {selectedOffer ? selectedOffer.title : 'None'}</p>
                <p><span className="text-white/60">Name:</span> {name}</p>
                <p className="text-white/60 text-xs">Confirmation will be sent to your logged-in number (+91 {user.phone}).</p>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 rounded-xl bg-gray-700 py-3 font-semibold text-white hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => void doCreateAndWhatsApp(user.phone)}
                  className="flex-1 rounded-xl bg-teal-500 py-3 font-semibold text-white hover:bg-teal-400 transition-colors"
                >
                  Confirm &amp; Send via WhatsApp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl border border-white/15 bg-[#020617] shadow-2xl sm:rounded-2xl"
            >
              <div className="mx-auto h-1.5 w-12 rounded-full bg-white/20 sm:hidden" />
              <div className="max-h-[85vh] overflow-y-auto">
                <PhoneLogin
                  variant="modal"
                  onSuccess={handleLoginSuccess}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-emerald-500/95 px-4 py-2 text-sm font-medium text-black shadow-lg">
          {toast}
        </div>
      )}

      <Footer />
    </div>
  );
}

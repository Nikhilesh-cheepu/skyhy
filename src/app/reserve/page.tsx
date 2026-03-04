'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import BottomActionBar from '@/components/BottomActionBar';
import DateChips from '@/components/reserve/DateChips';
import MealToggle, { type MealType } from '@/components/reserve/MealToggle';
import TimeSlotsGrid from '@/components/reserve/TimeSlotsGrid';
import OfferCards, { OFFERS, is128OfferValid } from '@/components/reserve/OfferCards';
import { getSlotsForMeal } from '@/components/reserve/timeSlots';
import GuestCounter from '@/components/reserve/GuestCounter';

const WHATSAPP_NUMBER = '7013884485';

export default function ReservePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [meal, setMeal] = useState<MealType>('dinner');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [nameError, setNameError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  const formatDateDisplay = (iso: string) => {
    const d = new Date(iso + 'T12:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const t = new Date(d);
    t.setHours(0, 0, 0, 0);
    if (t.getTime() === today.getTime()) return 'Today';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const selectedOffer = OFFERS.find((o) => o.id === selectedOfferId);

  const ensureLoggedIn = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.status === 401) {
        router.push('/login?returnTo=/reserve');
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const validate = () => {
    let valid = true;
    if (!name.trim()) {
      setNameError('Full name is required');
      valid = false;
    } else {
      setNameError('');
    }
    const mobileClean = mobile.replace(/\D/g, '');
    if (!mobileClean || mobileClean.length !== 10) {
      setMobileError('Enter a valid 10-digit mobile number');
      valid = false;
    } else {
      setMobileError('');
    }
    return valid;
  };

  const handleConfirmBooking = async () => {
    if (!validate()) return;
    const ok = await ensureLoggedIn();
    if (!ok) return;
    setShowConfirmModal(true);
  };

  const handleWhatsApp = async () => {
    if (!validate()) return;
    const ok = await ensureLoggedIn();
    if (!ok) return;
    const dateStr = formatDateDisplay(selectedDate);
    const offerStr = selectedOffer ? selectedOffer.title : 'None';
    const text = [
      'Hi SKYHY Live, I want to reserve a table.',
      `Date: ${dateStr}`,
      `Time: ${selectedTime || 'Not selected'}`,
      `Meal: ${meal.charAt(0).toUpperCase() + meal.slice(1)}`,
      `Guests: ${guests}`,
      `Offer: ${offerStr}`,
      `Name: ${name}`,
      `Mobile: ${mobile}`,
    ].join('%0A');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] overflow-x-hidden w-full max-w-full">
      <div className="pt-20 md:pt-24 pb-24">
        <div className="max-w-lg mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1 className="text-2xl font-bold text-white">Reserve Your Table</h1>
            <p className="text-white/70 text-sm mt-1">Choose a time, add guests, and confirm your booking</p>
          </div>

          {/* Date chips */}
          <section className="mb-6">
            <DateChips selectedDate={selectedDate} onSelect={setSelectedDate} />
          </section>

          {/* Meal toggle */}
          <section className="mb-6">
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

          {/* Time slots */}
          <section className="mb-6">
            <p className="text-white/80 text-sm mb-3">Select time</p>
            <TimeSlotsGrid
              meal={meal}
              selectedTime={selectedTime}
              onSelect={(time) => {
                setSelectedTime(time);
                if (selectedOfferId === 'eat-drink-128' && !is128OfferValid(time)) {
                  setSelectedOfferId(null);
                }
              }}
            />
          </section>

          {/* Offers - only visible after selecting a time slot */}
          {selectedTime && (
            <section className="mb-6">
              <OfferCards meal={meal} selectedTime={selectedTime} selectedOfferId={selectedOfferId} onSelect={setSelectedOfferId} />
            </section>
          )}

          {/* Guests */}
          <section className="mb-6">
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
              <GuestCounter value={guests} onChange={setGuests} />
            </div>
          </section>

          {/* Contact */}
          <section className="mb-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-white font-medium text-sm mb-2">Full name *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(''); }}
                placeholder="Full name *"
                className={`
                  w-full px-4 py-3 rounded-xl bg-gray-800/80 border text-white placeholder-white/50
                  focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all
                  ${nameError ? 'border-red-500/70' : 'border-gray-600'}
                `}
              />
              {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
            </div>
            <div>
              <label htmlFor="mobile" className="block text-white font-medium text-sm mb-2">10-digit mobile *</label>
              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setMobile(v);
                  setMobileError('');
                }}
                placeholder="10-digit mobile *"
                className={`
                  w-full px-4 py-3 rounded-xl bg-gray-800/80 border text-white placeholder-white/50
                  focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all
                  ${mobileError ? 'border-red-500/70' : 'border-gray-600'}
                `}
              />
              {mobileError && <p className="text-red-400 text-xs mt-1">{mobileError}</p>}
            </div>
          </section>

          {/* CTAs */}
          <div className="space-y-3">
            <motion.button
              type="button"
              onClick={handleConfirmBooking}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl bg-teal-500 text-white font-bold text-lg shadow-lg hover:bg-teal-400 transition-colors"
            >
              Confirm Booking
            </motion.button>
            <motion.button
              type="button"
              onClick={handleWhatsApp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-gray-700/80 border border-gray-600 text-white font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              Book via WhatsApp
            </motion.button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
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
              className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-700 p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-4">Booking Summary</h3>
              <div className="space-y-2 text-white/90 text-sm">
                <p><span className="text-white/60">Date:</span> {formatDateDisplay(selectedDate)}</p>
                <p><span className="text-white/60">Time:</span> {selectedTime || '—'}</p>
                <p><span className="text-white/60">Meal:</span> {meal.charAt(0).toUpperCase() + meal.slice(1)}</p>
                <p><span className="text-white/60">Guests:</span> {guests}</p>
                <p><span className="text-white/60">Offer:</span> {selectedOffer ? selectedOffer.title : 'None'}</p>
                <p><span className="text-white/60">Name:</span> {name}</p>
                <p><span className="text-white/60">Mobile:</span> {mobile}</p>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => { setShowConfirmModal(false); handleWhatsApp(); }}
                  className="flex-1 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-400 transition-colors"
                >
                  Send via WhatsApp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      <BottomActionBar />
    </div>
  );
}

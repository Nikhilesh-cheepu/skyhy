'use client';

import { useRef, useEffect } from 'react';

export interface DateOption {
  date: Date;
  label: string;
  dayNum: string;
  iso: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const IST_TIME_ZONE = 'Asia/Kolkata';

function getTodayIstDate(): Date {
  const todayIso = new Date().toLocaleDateString('en-CA', { timeZone: IST_TIME_ZONE });
  return new Date(todayIso + 'T00:00:00');
}

function buildDateOptions(): DateOption[] {
  const options: DateOption[] = [];
  const today = getTodayIstDate();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const isToday = i === 0;
    const iso = new Intl.DateTimeFormat('en-CA', {
      timeZone: IST_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
    options.push({
      date: d,
      label: isToday ? 'Today' : DAYS[d.getDay()],
      dayNum: d.getDate().toString(),
      iso,
    });
  }
  return options;
}

interface DateChipsProps {
  selectedDate: string;
  onSelect: (iso: string) => void;
}

export default function DateChips({ selectedDate, onSelect }: DateChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const options = buildDateOptions();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const selected = el.querySelector('[data-selected="true"]');
    selected?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [selectedDate]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-2 -mx-1 scrollbar-hide scroll-smooth"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {options.map((opt) => {
        const isSelected = opt.iso === selectedDate;
        return (
          <button
            key={opt.iso}
            type="button"
            data-selected={isSelected}
            onClick={() => onSelect(opt.iso)}
            className={`
              flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-xl
              border-2 transition-all duration-200
              active:scale-95
              ${
                isSelected
                  ? 'bg-gray-700/80 border-teal-400 text-white shadow-lg shadow-teal-500/20'
                  : 'bg-gray-800/60 border-gray-600 text-white/90 hover:border-gray-500'
              }
            `}
          >
            <span className="text-xs font-medium">{opt.label}</span>
            <span className="text-lg font-bold">{opt.dayNum}</span>
          </button>
        );
      })}
    </div>
  );
}

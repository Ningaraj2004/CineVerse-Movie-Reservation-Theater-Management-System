import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Film, Ticket } from 'lucide-react';
import { Movie, Showtime, Screen } from '../types';
import { formatCurrency } from '../utils/seatLayout';

interface ShowtimeScheduleViewProps {
  movies: Movie[];
  showtimes: Showtime[];
  screens: Screen[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  availableDates: { label: string; date: string; subLabel: string }[];
  onBookShowtime: (showtime: Showtime) => void;
}

export const ShowtimeScheduleView: React.FC<ShowtimeScheduleViewProps> = ({
  movies,
  showtimes,
  screens,
  selectedDate,
  onSelectDate,
  availableDates,
  onBookShowtime,
}) => {
  const [selectedScreenId, setSelectedScreenId] = useState<string>('all');

  const filteredShowtimes = showtimes
    .filter(s => {
      const matchesDate = s.date === selectedDate;
      const matchesScreen = selectedScreenId === 'all' || s.screenId === selectedScreenId;
      return matchesDate && matchesScreen;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black font-display text-white">Auditorium Screening Schedule</h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse screening times across our IMAX Laser and Dolby Cinema auditoriums.
          </p>
        </div>

        {/* Date Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {availableDates.map(item => (
            <button
              key={item.date}
              onClick={() => onSelectDate(item.date)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                item.date === selectedDate
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Screen Filter bar */}
      <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
          Filter Screen:
        </span>
        <button
          onClick={() => setSelectedScreenId('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
            selectedScreenId === 'all'
              ? 'bg-slate-800 text-amber-300 border border-amber-400/40'
              : 'bg-slate-900/60 text-slate-400 hover:text-white'
          }`}
        >
          All Screens
        </button>
        {screens.map(sc => (
          <button
            key={sc.id}
            onClick={() => setSelectedScreenId(sc.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              selectedScreenId === sc.id
                ? 'bg-slate-800 text-amber-300 border border-amber-400/40'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            {sc.name} ({sc.type})
          </button>
        ))}
      </div>

      {/* Showtimes Listing */}
      {filteredShowtimes.length === 0 ? (
        <div className="py-24 text-center">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-slate-300">No screenings found</h3>
          <p className="text-xs text-slate-500 mt-1">Try selecting a different date or screen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredShowtimes.map(st => {
            const movie = movies.find(m => m.id === st.movieId);
            const screen = screens.find(sc => sc.id === st.screenId);
            if (!movie || !screen) return null;

            return (
              <div
                key={st.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-amber-400">{screen.name}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-amber-300 border border-slate-700">
                      {st.format}
                    </span>
                  </div>

                  <div className="flex gap-3 items-center">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-16 object-cover rounded-lg border border-slate-700 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white font-display line-clamp-1">
                        {movie.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {movie.duration}m · {movie.rating} · {movie.genre}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-base font-black text-white font-mono flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>{st.time}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      From {formatCurrency(st.basePrice)}
                    </div>
                  </div>

                  <button
                    onClick={() => onBookShowtime(st)}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 transition-all flex items-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Select Seats</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

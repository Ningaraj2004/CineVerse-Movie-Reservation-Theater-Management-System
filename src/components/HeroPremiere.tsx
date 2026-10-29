import React from 'react';
import { Sparkles, Calendar, Clock, Star, Play, Ticket } from 'lucide-react';
import { Movie, Showtime } from '../types';

interface HeroPremiereProps {
  movie: Movie;
  showtimes: Showtime[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onBookShowtime: (showtime: Showtime) => void;
  availableDates: { label: string; date: string; subLabel: string }[];
  onOpenReviewsList?: (movie: Movie) => void;
}

export const HeroPremiere: React.FC<HeroPremiereProps> = ({
  movie,
  showtimes,
  selectedDate,
  onSelectDate,
  onBookShowtime,
  availableDates,
  onOpenReviewsList,
}) => {
  const premiereShowtimes = showtimes
    .filter(s => s.movieId === movie.id && s.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900/90 to-[#090a0f] border-b border-slate-800/80 pt-6 pb-12">
      {/* Background glow and subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        {/* Date Selector Strip */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Select Screening Date</span>
            </div>
            <span className="text-xs text-slate-500">Showtimes updated in real time</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {availableDates.map(item => {
              const isSelected = item.date === selectedDate;
              return (
                <button
                  key={item.date}
                  onClick={() => onSelectDate(item.date)}
                  className={`px-4 py-3 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400/80 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-medium uppercase tracking-wider text-amber-400/90">
                    {item.subLabel}
                  </div>
                  <div className="text-sm font-bold text-slate-100">{item.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Premiere Spotlight */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-center">
          {/* Poster card with zero broken fallback */}
          <div className="w-full sm:w-64 lg:w-72 shrink-0 relative group">
            <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-950 relative">
              <img
                src={movie.poster}
                alt={movie.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-bold text-amber-300 border border-amber-400/30">
                PREMIERE SPOTLIGHT
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="font-semibold text-amber-400">{movie.genre}</span>
              <span aria-hidden="true">·</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                {movie.rating}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {movie.duration} mins
              </span>
              <span aria-hidden="true">·</span>
              <span>Directed by {movie.director}</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onOpenReviewsList && onOpenReviewsList(movie)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 font-semibold transition-colors"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{movie.averageRating ? `${movie.averageRating.toFixed(1)} / 5` : 'New Release'}</span>
                <span className="text-slate-400 font-normal">
                  ({movie.reviewCount || 0} reviews)
                </span>
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight leading-tight">
              {movie.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {movie.description}
            </p>

            <div className="pt-2">
              <div className="text-xs text-slate-400 mb-2">
                <span className="text-slate-500">Starring:</span>{' '}
                <span className="text-slate-300">{movie.cast.join(', ')}</span>
              </div>
            </div>

            {/* Quick showtime booking buttons for selected date */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                <span>Available Screenings Today ({selectedDate}):</span>
              </div>

              {premiereShowtimes.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No scheduled showtimes on this date.</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {premiereShowtimes.map(st => (
                    <button
                      key={st.id}
                      onClick={() => onBookShowtime(st)}
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-400/20 transition-all hover:scale-102"
                    >
                      <span className="text-sm font-black">{st.time}</span>
                      <span className="text-[11px] font-semibold text-slate-800">
                        ({st.format})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { Search, Clock, Film, Ticket, ChevronRight, SlidersHorizontal, Star } from 'lucide-react';
import { Movie, Showtime, Screen } from '../types';

interface MovieCatalogProps {
  movies: Movie[];
  showtimes: Showtime[];
  screens: Screen[];
  selectedDate: string;
  onBookShowtime: (showtime: Showtime) => void;
  onOpenReviewsList?: (movie: Movie) => void;
}

const GENRES = ['All', 'Sci-Fi', 'Action', 'Drama', 'Animation'];

export const MovieCatalog: React.FC<MovieCatalogProps> = ({
  movies,
  showtimes,
  screens,
  selectedDate,
  onBookShowtime,
  onOpenReviewsList,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredMovies = movies.filter(movie => {
    const matchesGenre = selectedGenre === 'All' || movie.genre.toLowerCase() === selectedGenre.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      movie.title.toLowerCase().includes(q) ||
      movie.director.toLowerCase().includes(q) ||
      movie.cast.some(c => c.toLowerCase().includes(q));
    return matchesGenre && matchesSearch;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      {/* Controls: Search and Genre Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black font-display text-white">Now Showing in Theaters</h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse active releases and book seats for <span className="text-amber-400 font-semibold">{selectedDate}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, cast, director..."
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Genre interactive tab bar */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto">
            {GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  selectedGenre === genre
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="py-20 text-center">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-300">No movies found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your genre filter or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-8">
          {filteredMovies.map(movie => {
            const movieShowtimes = showtimes
              .filter(s => s.movieId === movie.id && s.date === selectedDate)
              .sort((a, b) => a.time.localeCompare(b.time));

            return (
              <div
                key={movie.id}
                className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 transition-all shadow-lg hover:shadow-amber-500/5 group"
              >
                {/* Poster */}
                <div className="w-full sm:w-40 shrink-0 aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 relative border border-slate-800">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-amber-300 border border-slate-700">
                    {movie.rating}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-semibold text-amber-400/90">{movie.genre}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {movie.duration} min
                        </span>
                        <span>·</span>
                        <span>{movie.releaseYear}</span>
                      </div>

                      {/* Community Star Rating Badge */}
                      <button
                        type="button"
                        onClick={() => onOpenReviewsList && onOpenReviewsList(movie)}
                        title="View verified audience reviews"
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-500/20 text-[11px] font-semibold transition-colors"
                      >
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{movie.averageRating ? movie.averageRating.toFixed(1) : 'New'}</span>
                        <span className="text-slate-400 font-normal">
                          ({movie.reviewCount || 0})
                        </span>
                      </button>
                    </div>

                    <h3 className="text-lg font-bold font-display text-white group-hover:text-amber-300 transition-colors">
                      {movie.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">
                      {movie.description}
                    </p>

                    <div className="mt-2 text-[11px] text-slate-500 truncate">
                      <span className="text-slate-400 font-medium">Cast:</span> {movie.cast.join(', ')}
                    </div>
                  </div>

                  {/* Showtimes on selected date */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
                      <span>Showtimes for {selectedDate}:</span>
                      {movieShowtimes.length > 0 && (
                        <span className="text-[10px] text-amber-400">Click time to reserve</span>
                      )}
                    </div>

                    {movieShowtimes.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-1">No screenings available on this date.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {movieShowtimes.map(st => {
                          const screen = screens.find(sc => sc.id === st.screenId);
                          return (
                            <button
                              key={st.id}
                              onClick={() => onBookShowtime(st)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-all border border-slate-700/80 flex items-center gap-1.5 group/btn"
                            >
                              <span>{st.time}</span>
                              <span className="text-[10px] text-slate-400 group-hover/btn:text-slate-800">
                                {st.format}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

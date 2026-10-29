import React, { useState } from 'react';
import { Ticket, Calendar, Clock, MapPin, AlertCircle, Ban, Eye, Star, Edit3 } from 'lucide-react';
import { Reservation, Movie, MovieReview } from '../types';
import { formatCurrency } from '../utils/seatLayout';

interface MyReservationsViewProps {
  reservations: Reservation[];
  movies: Movie[];
  userReviews: MovieReview[];
  onCancelReservation: (reservationId: string) => Promise<void>;
  onViewTicket: (reservation: Reservation) => void;
  onExploreMovies: () => void;
  onOpenReviewModal: (movie: Movie, reservation: Reservation, existingReview?: MovieReview) => void;
}

export const MyReservationsView: React.FC<MyReservationsViewProps> = ({
  reservations,
  movies,
  userReviews,
  onCancelReservation,
  onViewTicket,
  onExploreMovies,
  onOpenReviewModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'cancelled'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const now = new Date('2026-10-28T09:49:00'); // current application timestamp

  const filteredReservations = reservations.filter(r => {
    const showtimeDate = new Date(`${r.date}T${r.time}:00`);
    const isUpcoming = showtimeDate.getTime() >= now.getTime();

    if (filter === 'upcoming') {
      return r.status === 'confirmed' && isUpcoming;
    }
    if (filter === 'cancelled') {
      return r.status === 'cancelled';
    }
    return true;
  });

  const handleCancelClick = async (r: Reservation) => {
    if (!window.confirm(`Are you sure you want to cancel your reservation for "${r.movieTitle}" (${r.seats.map(s => s.id).join(', ')})? Seats will be returned to the public pool.`)) {
      return;
    }

    setActionError(null);
    setCancellingId(r.id);
    try {
      await onCancelReservation(r.id);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to cancel reservation.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black font-display text-white">My Movie Tickets & Reviews</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your booked screenings, view admission passes, and rate movies you have booked.
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'upcoming'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upcoming Active
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Bookings
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'cancelled'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {actionError && (
        <div className="mt-6 p-4 rounded-xl bg-rose-950/60 border border-rose-700 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {filteredReservations.length === 0 ? (
        <div className="py-24 text-center">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-slate-300">No {filter} reservations found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {filter === 'upcoming'
              ? 'You have no upcoming movie screenings booked.'
              : 'No reservations match this filter.'}
          </p>
          <button
            onClick={onExploreMovies}
            className="mt-5 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md shadow-amber-400/20 transition-all inline-flex items-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            <span>Browse Now Showing Movies</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 mt-8">
          {filteredReservations.map(res => {
            const showtimeDate = new Date(`${res.date}T${res.time}:00`);
            const isUpcoming = showtimeDate.getTime() >= now.getTime();
            const canCancel = res.status === 'confirmed' && isUpcoming;

            const movie = movies.find(m => m.id === res.movieId) || {
              id: res.movieId,
              title: res.movieTitle,
              description: '',
              poster: res.moviePoster,
              genre: 'Cinema',
              duration: 120,
              rating: 'PG-13' as const,
              director: 'Director',
              cast: [],
              releaseYear: 2026,
            };

            const existingReview = userReviews.find(
              rev => rev.movieId === res.movieId || rev.reservationId === res.id
            );

            return (
              <div
                key={res.id}
                className={`bg-slate-900/60 border rounded-2xl p-5 flex flex-col transition-all ${
                  res.status === 'cancelled'
                    ? 'border-slate-800/50 opacity-60'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row gap-5 items-stretch md:items-center justify-between">
                  {/* Movie & Screening Info */}
                  <div className="flex gap-4 items-center">
                    <img
                      src={res.moviePoster}
                      alt={res.movieTitle}
                      referrerPolicy="no-referrer"
                      className="w-16 h-22 object-cover rounded-xl border border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {res.bookingCode}
                        </span>
                        {res.status === 'confirmed' ? (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                            Confirmed
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800">
                            Cancelled / Refunded
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold font-display text-white mt-0.5">
                        {res.movieTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          {res.date}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {res.time}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {res.screenName}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mt-2">
                        Seats: <strong className="text-amber-400 font-bold">{res.seats.map(s => s.id).join(', ')}</strong> ({res.seats.length} ticket{res.seats.length > 1 ? 's' : ''})
                        {res.concessions && res.concessions.length > 0 && (
                          <span className="text-slate-500 ml-2">
                            + {res.concessions.reduce((acc, c) => acc + c.quantity, 0)} concessions
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Amount & Primary Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-500 block">Total Paid</span>
                      <span className="text-base font-black text-white">
                        {formatCurrency(res.totalAmount)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {res.status === 'confirmed' && (
                        <button
                          onClick={() => onViewTicket(res)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>View Pass</span>
                        </button>
                      )}

                      {/* Verified Review Action */}
                      <button
                        onClick={() => onOpenReviewModal(movie, res, existingReview)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                          existingReview
                            ? 'bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-750'
                            : 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{existingReview ? 'Edit Review' : 'Rate & Review'}</span>
                      </button>

                      {canCancel && (
                        <button
                          onClick={() => handleCancelClick(res)}
                          disabled={cancellingId === res.id}
                          className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-xs font-semibold text-rose-300 border border-rose-800/80 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{cancellingId === res.id ? 'Releasing Seats...' : 'Cancel Booking'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attached Verified User Review Snippet (if reviewed) */}
                {existingReview && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= existingReview.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-amber-300">
                          {existingReview.rating}.0 · Your Verified Review
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({new Date(existingReview.createdAt).toLocaleDateString()})
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 italic mt-1 leading-relaxed">
                        "{existingReview.comment}"
                      </p>
                    </div>

                    <button
                      onClick={() => onOpenReviewModal(movie, res, existingReview)}
                      className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Review</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

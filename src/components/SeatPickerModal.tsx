import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, ShoppingBag, Plus, Minus, ShieldCheck, Clock, Armchair, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Showtime, Movie, Screen, Seat, ConcessionItem, Reservation } from '../types';
import { apiService } from '../services/apiService';
import { formatCurrency } from '../utils/seatLayout';

interface SeatPickerModalProps {
  showtime: Showtime;
  movie: Movie;
  screen: Screen;
  onClose: () => void;
  onReservationComplete: (reservation: Reservation) => void;
  onRequireAuth: () => void;
}

export const SeatPickerModal: React.FC<SeatPickerModalProps> = ({
  showtime,
  movie,
  screen,
  onClose,
  onReservationComplete,
  onRequireAuth,
}) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookedSeatIds, setBookedSeatIds] = useState<string[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [concessions, setConcessions] = useState<ConcessionItem[]>([]);
  const [selectedConcessions, setSelectedConcessions] = useState<{ [itemId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConcessions, setShowConcessions] = useState(false);

  useEffect(() => {
    loadSeatMap();
    loadConcessions();
  }, [showtime.id]);

  const loadSeatMap = async () => {
    setLoading(true);
    setErrorMessage(null);
    const res = await apiService.getSeatAvailability(showtime.id);
    if (res.data) {
      setSeats(res.data.seats);
      setBookedSeatIds(res.data.bookedSeatIds);
    } else if (res.error) {
      setErrorMessage(res.error);
    }
    setLoading(false);
  };

  const loadConcessions = async () => {
    const res = await apiService.getConcessions();
    if (res.data) {
      setConcessions(res.data);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    // If seat is already booked in backend, ignore
    if (bookedSeatIds.includes(seat.id)) return;

    setErrorMessage(null);
    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 8) {
        setErrorMessage('Maximum 8 tickets per reservation limit reached.');
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seat.id]);
    }
  };

  const handleConcessionQuantity = (itemId: string, delta: number) => {
    const current = selectedConcessions[itemId] || 0;
    const next = Math.max(0, current + delta);
    setSelectedConcessions({
      ...selectedConcessions,
      [itemId]: next,
    });
  };

  // Compute totals
  const selectedSeats = seats.filter(s => selectedSeatIds.includes(s.id));
  const seatSubtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const concessionItemsSelected = concessions
    .map(c => ({
      ...c,
      quantity: selectedConcessions[c.id] || 0,
    }))
    .filter(c => c.quantity > 0);

  const concessionSubtotal = concessionItemsSelected.reduce(
    (sum, c) => sum + c.price * c.quantity,
    0
  );

  const grandTotal = seatSubtotal + concessionSubtotal;

  const handleConfirmReservation = async () => {
    const currentUser = apiService.getCurrentUser();
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (selectedSeatIds.length === 0) {
      setErrorMessage('Please select at least one seat before confirming.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const concessionPayload = Object.entries(selectedConcessions)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, quantity]) => ({ itemId, quantity }));

    // Call atomic reservation API
    const response = await apiService.createReservation({
      showtimeId: showtime.id,
      seatIds: selectedSeatIds,
      concessions: concessionPayload,
    });

    setSubmitting(false);

    if (response.status === 201 && response.data) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
      onReservationComplete(response.data);
    } else {
      // Overbooking or conflict error caught!
      setErrorMessage(response.error || 'Failed to complete reservation. Please try again.');
      // Refresh seat map to show newly taken seats
      loadSeatMap();
    }
  };

  // Group seats by row
  const rowMap = new Map<string, Seat[]>();
  seats.forEach(s => {
    if (!rowMap.has(s.row)) rowMap.set(s.row, []);
    rowMap.get(s.row)!.push(s);
  });
  const rows = Array.from(rowMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0b0d14] border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
              <span>{screen.name}</span>
              <span>·</span>
              <span className="text-slate-300">{showtime.format}</span>
            </div>
            <h2 className="text-xl font-bold font-display text-white">{movie.title}</h2>
            <div className="text-xs text-slate-400 mt-0.5">
              <span>{showtime.date}</span> at <span className="text-white font-semibold">{showtime.time}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-700/80 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="flex-1">{errorMessage}</div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400">Loading auditorium seating chart...</p>
            </div>
          ) : (
            <>
              {/* Curved Cinema Screen Visual */}
              <div className="text-center pt-2 pb-6">
                <div className="w-4/5 mx-auto h-2.5 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent rounded-full shadow-[0_4px_20px_rgba(251,191,36,0.5)]" />
                <div className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mt-2">
                  CINEMA SCREEN
                </div>
              </div>

              {/* Seat Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-slate-800 border border-slate-700" />
                  <span>Standard ({formatCurrency(showtime.basePrice)})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-amber-500/20 border border-amber-400/50" />
                  <span>VIP / Prime (+ $4)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-purple-500/20 border border-purple-400/50" />
                  <span>Recliner (+ $7)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-amber-400 text-slate-950 font-bold" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-slate-950 border border-slate-800 opacity-40" />
                  <span>Booked</span>
                </div>
              </div>

              {/* Seating Grid */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-6 overflow-x-auto">
                <div className="min-w-[500px] flex flex-col gap-2.5 items-center">
                  {rows.map(([rowChar, rowSeats]) => (
                    <div key={rowChar} className="flex items-center gap-2">
                      {/* Row Label */}
                      <span className="w-5 text-center text-xs font-bold text-slate-500">
                        {rowChar}
                      </span>

                      {/* Row Seat buttons with aisle gaps */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {rowSeats.map((seat, sIdx) => {
                          const isBooked = bookedSeatIds.includes(seat.id);
                          const isSelected = selectedSeatIds.includes(seat.id);

                          // Insert subtle aisle gap between seats 3-4 and 9-10
                          const hasAisleAfter = sIdx === 2 || (rowSeats.length > 8 && sIdx === rowSeats.length - 4);

                          let seatStyle = 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-amber-400/60';
                          if (seat.tier === 'vip') {
                            seatStyle = 'bg-amber-950/40 border-amber-600/40 text-amber-200 hover:border-amber-400';
                          } else if (seat.tier === 'recliner') {
                            seatStyle = 'bg-purple-950/40 border-purple-600/40 text-purple-200 hover:border-purple-400';
                          }

                          if (isSelected) {
                            seatStyle = 'bg-amber-400 border-amber-300 text-slate-950 font-black shadow-lg shadow-amber-400/30 scale-105';
                          } else if (isBooked) {
                            seatStyle = 'bg-slate-950 border-slate-900 text-slate-700 cursor-not-allowed opacity-30';
                          }

                          return (
                            <React.Fragment key={seat.id}>
                              <button
                                onClick={() => handleSeatClick(seat)}
                                disabled={isBooked}
                                title={`${seat.id} - ${seat.tier.toUpperCase()} (${formatCurrency(seat.price)})${isBooked ? ' (Reserved)' : ''}`}
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center ${seatStyle}`}
                              >
                                {seat.number}
                              </button>
                              {hasAisleAfter && <div className="w-4 sm:w-6" />}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Row Label End */}
                      <span className="w-5 text-center text-xs font-bold text-slate-500">
                        {rowChar}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concessions / Snack Add-ons Accordion */}
              <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/30">
                <button
                  type="button"
                  onClick={() => setShowConcessions(!showConcessions)}
                  className="w-full flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Add Gourmet Snacks & Concessions
                    </span>
                    {concessionItemsSelected.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                        {concessionItemsSelected.reduce((sum, c) => sum + c.quantity, 0)} added
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-amber-400 font-medium">
                    {showConcessions ? 'Hide Options ▲' : 'Browse Snacks ▼'}
                  </span>
                </button>

                {showConcessions && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
                    {concessions.map(item => {
                      const qty = selectedConcessions[item.id] || 0;
                      return (
                        <div
                          key={item.id}
                          className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex-1">
                            <div className="text-xs font-bold text-slate-200">{item.name}</div>
                            <div className="text-[11px] text-slate-400">{item.description}</div>
                            <div className="text-xs font-extrabold text-amber-400 mt-1">
                              {formatCurrency(item.price)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1">
                            <button
                              onClick={() => handleConcessionQuantity(item.id, -1)}
                              disabled={qty === 0}
                              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-5 text-center text-xs font-bold text-white">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleConcessionQuantity(item.id, 1)}
                              className="p-1 rounded text-slate-400 hover:text-white"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Summary */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="text-xs text-slate-400">
              {selectedSeatIds.length === 0 ? (
                <span>No seats selected</span>
              ) : (
                <span>
                  Seats: <strong className="text-white">{selectedSeatIds.join(', ')}</strong> ({selectedSeatIds.length} ticket{selectedSeatIds.length > 1 ? 's' : ''})
                </span>
              )}
            </div>
            <div className="text-lg font-black text-white mt-0.5">
              Total: <span className="text-amber-400">{formatCurrency(grandTotal)}</span>
              {concessionSubtotal > 0 && (
                <span className="text-xs font-normal text-slate-400 ml-2">
                  (Includes {formatCurrency(concessionSubtotal)} snacks)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmReservation}
              disabled={selectedSeatIds.length === 0 || submitting || loading}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-400/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Reserving Seats...</span>
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  <span>Confirm Reservation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

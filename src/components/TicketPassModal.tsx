import React from 'react';
import { X, CheckCircle2, Calendar, Clock, MapPin, Download, QrCode, Ticket as TicketIcon } from 'lucide-react';
import { Reservation } from '../types';
import { formatCurrency } from '../utils/seatLayout';

interface TicketPassModalProps {
  reservation: Reservation;
  onClose: () => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({ reservation, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCalendar = () => {
    // Generate iCal (.ics) file string
    const startIso = `${reservation.date.replace(/-/g, '')}T${reservation.time.replace(':', '')}00`;
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CineVerse//Movie Reservation//EN',
      'BEGIN:VEVENT',
      `UID:${reservation.id}@cineverse.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startIso}`,
      `SUMMARY:Movie: ${reservation.movieTitle} at CineVerse`,
      `DESCRIPTION:Showtime for ${reservation.movieTitle} at ${reservation.screenName}. Seats: ${reservation.seats.map(s => s.id).join(', ')}. Booking Ref: ${reservation.bookingCode}`,
      `LOCATION:${reservation.screenName}, CineVerse Cinema`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${reservation.movieTitle.replace(/\s+/g, '_')}_ticket.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0f111a] border border-slate-700/80 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden my-auto">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 fill-slate-950 text-amber-400" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider">Booking Confirmed</span>
              <div className="text-[11px] font-bold opacity-80">Reference: {reservation.bookingCode}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <X className="w-5 h-5 text-slate-950" />
          </button>
        </div>

        {/* Boarding Pass Body */}
        <div className="p-6 space-y-6">
          {/* Movie banner */}
          <div className="flex gap-4 items-center">
            <img
              src={reservation.moviePoster}
              alt={reservation.movieTitle}
              referrerPolicy="no-referrer"
              className="w-16 h-24 object-cover rounded-xl border border-slate-700 shrink-0 shadow-md"
            />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Official Digital Admission
              </div>
              <h3 className="text-xl font-black font-display text-white leading-tight">
                {reservation.movieTitle}
              </h3>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{reservation.screenName}</span>
              </div>
            </div>
          </div>

          {/* Screening Details Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Date</span>
              <div className="text-sm font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {reservation.date}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Showtime</span>
              <div className="text-sm font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {reservation.time}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Reserved Seats</span>
              <div className="text-sm font-black text-amber-400 mt-0.5">
                {reservation.seats.map(s => s.id).join(', ')}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Total Paid</span>
              <div className="text-sm font-bold text-white mt-0.5">
                {formatCurrency(reservation.totalAmount)}
              </div>
            </div>
          </div>

          {/* Concessions (if any) */}
          {reservation.concessions && reservation.concessions.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500">Pre-ordered Concessions</span>
              <div className="mt-1 space-y-1">
                {reservation.concessions.map((c, i) => (
                  <div key={i} className="text-xs text-slate-300 flex justify-between">
                    <span>
                      {c.quantity}x {c.name}
                    </span>
                    <span className="text-slate-400">{formatCurrency(c.price * c.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Barcode & QR Code Section */}
          <div className="pt-2 text-center border-t border-dashed border-slate-800">
            <div className="flex justify-center items-center gap-4 py-2">
              <div className="p-2 rounded-xl bg-white text-slate-950 inline-block shadow-md">
                <QrCode className="w-16 h-16" />
              </div>
              <div className="text-left">
                <div className="text-xs font-mono font-bold text-amber-400 tracking-wider">
                  {reservation.bookingCode}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Guest: <span className="text-slate-200 font-semibold">{reservation.userName}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Scan at auditorium usher scanner
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              onClick={handleDownloadCalendar}
              className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Add to Calendar</span>
            </button>

            <button
              onClick={handlePrint}
              className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Print / Save Pass</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 transition-colors"
          >
            Done & View Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

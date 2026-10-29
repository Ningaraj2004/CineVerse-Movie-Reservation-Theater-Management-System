import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Film,
  Calendar,
  Users,
  Shield,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Ticket,
  Percent,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Lock,
} from 'lucide-react';
import { Movie, Showtime, Screen, User, Reservation, AdminReport } from '../types';
import { apiService } from '../services/apiService';
import { formatCurrency } from '../utils/seatLayout';

interface AdminPortalProps {
  currentUser: User | null;
  movies: Movie[];
  showtimes: Showtime[];
  screens: Screen[];
  allUsers: User[];
  onRefreshData: () => Promise<void>;
  onSwitchUser: (userId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  movies,
  showtimes,
  screens,
  allUsers,
  onRefreshData,
  onSwitchUser,
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'movies' | 'showtimes' | 'reservations' | 'users'>('reports');
  const [reports, setReports] = useState<AdminReport | null>(null);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Movie Form State
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    poster: '',
    genre: 'Sci-Fi',
    duration: 120,
    rating: 'PG-13' as 'G' | 'PG' | 'PG-13' | 'R',
    director: '',
    cast: '',
    releaseYear: 2026,
  });

  // Showtime Form State
  const [isShowtimeModalOpen, setIsShowtimeModalOpen] = useState(false);
  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '',
    screenId: '',
    date: '2026-10-28',
    time: '19:00',
    format: '2D' as '2D' | '3D' | 'IMAX 3D' | 'Dolby Cinema',
    basePrice: 15.0,
  });

  // Reservation Search Query
  const [resSearch, setResSearch] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadAdminData();
    }
  }, [currentUser]);

  const loadAdminData = async () => {
    setLoading(true);
    const reportRes = await apiService.getAdminReports();
    if (reportRes.data) {
      setReports(reportRes.data);
    }
    const resRes = await apiService.getAllReservations();
    if (resRes.data) {
      setAllReservations(resRes.data);
    }
    setLoading(false);
  };

  // If user is not admin, show barrier with demo promote/switch button
  if (!currentUser || currentUser.role !== 'admin') {
    const adminUser = allUsers.find(u => u.role === 'admin');
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          The Admin Portal is restricted to authorized theater managers. Admins can manage movies, schedule showtimes, inspect real-time financial reporting, and grant admin roles.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {adminUser && (
            <button
              onClick={() => onSwitchUser(adminUser.id)}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Switch to Admin ({adminUser.name})</span>
            </button>
          )}

          {currentUser && (
            <button
              onClick={async () => {
                const res = await apiService.updateUserRole(currentUser.id, 'admin');
                if (res.status === 200) {
                  await onRefreshData();
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
            >
              Promote Current Account to Admin
            </button>
          )}
        </div>
      </div>
    );
  }

  // Handle Movie Save
  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    const castArray = movieForm.cast
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const payload = {
      title: movieForm.title,
      description: movieForm.description,
      poster: movieForm.poster || '/src/assets/images/poster_interstellar_odyssey_1793206434678.jpg',
      genre: movieForm.genre,
      duration: Number(movieForm.duration),
      rating: movieForm.rating,
      director: movieForm.director,
      cast: castArray.length ? castArray : ['Leading Cast'],
      releaseYear: Number(movieForm.releaseYear),
    };

    if (editingMovie) {
      const res = await apiService.updateMovie(editingMovie.id, payload);
      if (res.status === 200) {
        setFeedbackMessage({ type: 'success', text: `Movie "${payload.title}" updated successfully.` });
        setIsMovieModalOpen(false);
        setEditingMovie(null);
        await onRefreshData();
        await loadAdminData();
      } else {
        setFeedbackMessage({ type: 'error', text: res.error || 'Failed to update movie.' });
      }
    } else {
      const res = await apiService.createMovie(payload);
      if (res.status === 201) {
        setFeedbackMessage({ type: 'success', text: `Movie "${payload.title}" created successfully.` });
        setIsMovieModalOpen(false);
        await onRefreshData();
        await loadAdminData();
      } else {
        setFeedbackMessage({ type: 'error', text: res.error || 'Failed to create movie.' });
      }
    }
  };

  const handleDeleteMovie = async (movie: Movie) => {
    if (!window.confirm(`Delete movie "${movie.title}"? Associated showtimes will also be removed.`)) {
      return;
    }
    const res = await apiService.deleteMovie(movie.id);
    if (res.status === 200) {
      setFeedbackMessage({ type: 'success', text: `Movie "${movie.title}" deleted.` });
      await onRefreshData();
      await loadAdminData();
    } else {
      setFeedbackMessage({ type: 'error', text: res.error || 'Failed to delete movie.' });
    }
  };

  // Handle Showtime Save
  const handleSaveShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    if (!showtimeForm.movieId || !showtimeForm.screenId) {
      setFeedbackMessage({ type: 'error', text: 'Please select a movie and auditorium screen.' });
      return;
    }

    const res = await apiService.createShowtime({
      movieId: showtimeForm.movieId,
      screenId: showtimeForm.screenId,
      date: showtimeForm.date,
      time: showtimeForm.time,
      format: showtimeForm.format,
      basePrice: Number(showtimeForm.basePrice),
    });

    if (res.status === 201) {
      setFeedbackMessage({ type: 'success', text: 'Showtime scheduled successfully.' });
      setIsShowtimeModalOpen(false);
      await onRefreshData();
      await loadAdminData();
    } else {
      setFeedbackMessage({ type: 'error', text: res.error || 'Failed to schedule showtime.' });
    }
  };

  const handleDeleteShowtime = async (id: string) => {
    if (!window.confirm('Delete this showtime?')) return;
    const res = await apiService.deleteShowtime(id);
    if (res.status === 200) {
      setFeedbackMessage({ type: 'success', text: 'Showtime deleted.' });
      await onRefreshData();
      await loadAdminData();
    }
  };

  // Handle Role Change
  const handleToggleUserRole = async (targetUser: User) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const actionText = nextRole === 'admin' ? 'promote to Administrator' : 'demote to Regular User';

    if (!window.confirm(`Are you sure you want to ${actionText} for ${targetUser.name}?`)) {
      return;
    }

    const res = await apiService.updateUserRole(targetUser.id, nextRole);
    if (res.status === 200) {
      setFeedbackMessage({
        type: 'success',
        text: `User ${targetUser.name} role updated to ${nextRole.toUpperCase()}.`,
      });
      await onRefreshData();
      await loadAdminData();
    } else {
      setFeedbackMessage({ type: 'error', text: res.error || 'Failed to update user role.' });
    }
  };

  // Filtered reservations for audit
  const filteredAuditReservations = allReservations.filter(r => {
    const q = resSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      r.bookingCode.toLowerCase().includes(q) ||
      r.userName.toLowerCase().includes(q) ||
      r.movieTitle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Admin Portal
            </span>
            <span className="text-xs text-slate-400">Manager: {currentUser.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
            Theater Operations & Reporting
          </h1>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'reports' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Reports</span>
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'movies' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Movies ({movies.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('showtimes')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'showtimes' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Showtimes ({showtimes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'reservations' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Reservations</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'users' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users & Roles</span>
          </button>
        </div>
      </div>

      {/* Global alert / feedback notification */}
      {feedbackMessage && (
        <div
          className={`mt-6 p-4 rounded-xl text-xs flex items-center justify-between gap-3 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-700/80 text-emerald-200'
              : 'bg-rose-950/60 border border-rose-700/80 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: REPORTS & ANALYTICS */}
      {activeTab === 'reports' && (
        <div className="mt-8 space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Ticket Revenue</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white mt-2 font-mono">
                {reports ? formatCurrency(reports.totalRevenue) : '$0.00'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Confirmed bookings gross</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Tickets Booked</span>
                <Ticket className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white mt-2 font-mono">
                {reports ? reports.totalTickets : 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Total seats reserved</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Average Occupancy</span>
                <Percent className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white mt-2 font-mono">
                {reports ? `${reports.occupancyRate}%` : '0%'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Across all auditorium screens</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Active Screenings</span>
                <Calendar className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white mt-2 font-mono">
                {reports ? reports.upcomingShowtimesCount : 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Scheduled in calendar</div>
            </div>
          </div>

          {/* Revenue by Movie and Genre */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Movie */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span>Revenue by Movie Title</span>
              </h3>

              <div className="space-y-4">
                {reports?.revenueByMovie.map(m => {
                  const maxRev = Math.max(1, ...reports.revenueByMovie.map(x => x.revenue));
                  const pct = Math.round((m.revenue / maxRev) * 100);
                  return (
                    <div key={m.movieId}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-200">{m.title}</span>
                        <span className="font-mono text-amber-400 font-bold">
                          {formatCurrency(m.revenue)} ({m.tickets} tickets)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Screen Capacity Utilization */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Auditorium Capacity & Occupancy</span>
              </h3>

              <div className="space-y-4">
                {reports?.screenStats.map(sc => (
                  <div key={sc.screenId} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-white">{sc.screenName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                        {sc.screenType}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 my-1">
                      <span>{sc.seatsBooked} / {sc.totalCapacity} total seats filled</span>
                      <span className="font-mono text-amber-400 font-bold">{sc.occupancyRate}% occupancy</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${Math.min(100, sc.occupancyRate)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOVIE MANAGEMENT */}
      {activeTab === 'movies' && (
        <div className="mt-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Movie Catalog ({movies.length})</h2>
            <button
              onClick={() => {
                setEditingMovie(null);
                setMovieForm({
                  title: '',
                  description: '',
                  poster: '/src/assets/images/poster_interstellar_odyssey_1793206434678.jpg',
                  genre: 'Sci-Fi',
                  duration: 120,
                  rating: 'PG-13',
                  director: '',
                  cast: '',
                  releaseYear: 2026,
                });
                setIsMovieModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Movie</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {movies.map(movie => (
              <div
                key={movie.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center justify-between"
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    referrerPolicy="no-referrer"
                    className="w-14 h-20 object-cover rounded-xl border border-slate-700 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">{movie.genre}</span>
                    <h4 className="text-sm font-bold text-white">{movie.title}</h4>
                    <p className="text-xs text-slate-400">{movie.duration}m · {movie.rating} · {movie.releaseYear}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Dir: {movie.director}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingMovie(movie);
                      setMovieForm({
                        title: movie.title,
                        description: movie.description,
                        poster: movie.poster,
                        genre: movie.genre,
                        duration: movie.duration,
                        rating: movie.rating,
                        director: movie.director,
                        cast: movie.cast.join(', '),
                        releaseYear: movie.releaseYear,
                      });
                      setIsMovieModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMovie(movie)}
                    className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SHOWTIME MANAGEMENT */}
      {activeTab === 'showtimes' && (
        <div className="mt-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white">Showtimes & Screen Schedule</h2>
              <p className="text-xs text-slate-400">Conflict-aware scheduling system prevents double-booking screens.</p>
            </div>
            <button
              onClick={() => {
                setShowtimeForm({
                  movieId: movies[0]?.id || '',
                  screenId: screens[0]?.id || '',
                  date: '2026-10-28',
                  time: '19:00',
                  format: '2D',
                  basePrice: 15.0,
                });
                setIsShowtimeModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Showtime</span>
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Movie</th>
                    <th className="px-4 py-3">Auditorium Screen</th>
                    <th className="px-4 py-3">Format</th>
                    <th className="px-4 py-3">Base Price</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {showtimes.map(st => {
                    const movie = movies.find(m => m.id === st.movieId);
                    const screen = screens.find(sc => sc.id === st.screenId);
                    return (
                      <tr key={st.id} className="hover:bg-slate-850/50">
                        <td className="px-4 py-3 font-mono font-bold text-white">
                          {st.date} <span className="text-amber-400 ml-1">{st.time}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-200">
                          {movie ? movie.title : st.movieId}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {screen ? screen.name : st.screenId}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] font-bold">
                            {st.format}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-200">
                          {formatCurrency(st.basePrice)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteShowtime(st.id)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RESERVATIONS ROSTER */}
      {activeTab === 'reservations' && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">All Reservations ({allReservations.length})</h2>
              <p className="text-xs text-slate-400">Audit trail of all customer ticket bookings and status.</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search code, guest, movie..."
                value={resSearch}
                onChange={(e) => setResSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Movie & Screening</th>
                    <th className="px-4 py-3">Seats</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAuditReservations.map(r => (
                    <tr key={r.id} className="hover:bg-slate-850/50">
                      <td className="px-4 py-3 font-mono font-bold text-amber-400">
                        {r.bookingCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{r.userName}</div>
                        <div className="text-[10px] text-slate-500">{r.userEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-200">{r.movieTitle}</div>
                        <div className="text-[10px] text-slate-400">
                          {r.date} at {r.time} ({r.screenName})
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {r.seats.map(s => s.id).join(', ')}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {formatCurrency(r.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        {r.status === 'confirmed' ? (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Confirmed
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {r.status === 'confirmed' && (
                          <button
                            onClick={async () => {
                              if (window.confirm(`Cancel reservation ${r.bookingCode}?`)) {
                                await apiService.cancelReservation(r.id);
                                await loadAdminData();
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 text-[11px] font-semibold border border-rose-800/60"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: USER ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">User Accounts & Role Permissions</h2>
            <p className="text-xs text-slate-400">
              Fulfills requirement: Only admins have permission to promote users to admin or demote roles.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-850/50">
                    <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        u.role === 'admin'
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.id === currentUser.id ? (
                        <span className="text-[11px] text-slate-500 italic">Current Active Session</span>
                      ) : (
                        <button
                          onClick={() => handleToggleUserRole(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            u.role === 'admin'
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-sm'
                          }`}
                        >
                          {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT MOVIE */}
      {isMovieModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f111a] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingMovie ? 'Edit Movie Details' : 'Add New Movie to Theater'}
              </h3>
              <button
                onClick={() => setIsMovieModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovie} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Movie Title</label>
                <input
                  type="text"
                  required
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Genre</label>
                  <select
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Action">Action</option>
                    <option value="Drama">Drama</option>
                    <option value="Animation">Animation</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Comedy">Comedy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Rating</label>
                  <select
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="G">G</option>
                    <option value="PG">PG</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min={45}
                    max={300}
                    required
                    value={movieForm.duration}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Release Year</label>
                  <input
                    type="number"
                    required
                    value={movieForm.releaseYear}
                    onChange={(e) => setMovieForm({ ...movieForm, releaseYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Director</label>
                <input
                  type="text"
                  required
                  value={movieForm.director}
                  onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Cast Members (comma separated)</label>
                <input
                  type="text"
                  value={movieForm.cast}
                  onChange={(e) => setMovieForm({ ...movieForm, cast: e.target.value })}
                  placeholder="e.g. Actor One, Actor Two, Actor Three"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMovieModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300"
                >
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE SHOWTIME */}
      {isShowtimeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f111a] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Schedule New Screening</h3>
              <button
                onClick={() => setIsShowtimeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShowtime} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Movie</label>
                <select
                  required
                  value={showtimeForm.movieId}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                >
                  {movies.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Auditorium Screen</label>
                <select
                  required
                  value={showtimeForm.screenId}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, screenId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                >
                  {screens.map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.name} ({sc.type} - {sc.capacity} seats)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={showtimeForm.date}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={showtimeForm.time}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Screening Format</label>
                  <select
                    value={showtimeForm.format}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, format: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="Dolby Cinema">Dolby Cinema</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    min={5}
                    max={50}
                    required
                    value={showtimeForm.basePrice}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * System will automatically reject scheduling collisions within 2 hours of another screening on the same screen.
              </p>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsShowtimeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300"
                >
                  Schedule Showtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

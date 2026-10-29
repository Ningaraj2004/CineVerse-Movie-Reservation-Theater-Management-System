import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroPremiere } from './components/HeroPremiere';
import { MovieCatalog } from './components/MovieCatalog';
import { ShowtimeScheduleView } from './components/ShowtimeScheduleView';
import { SeatPickerModal } from './components/SeatPickerModal';
import { TicketPassModal } from './components/TicketPassModal';
import { MyReservationsView } from './components/MyReservationsView';
import { AdminPortal } from './components/AdminPortal';
import { ApiExplorer } from './components/ApiExplorer';
import { AuthModal } from './components/AuthModal';
import { ReviewModal } from './components/ReviewModal';
import { ReviewsListModal } from './components/ReviewsListModal';
import { apiService } from './services/apiService';
import { Movie, Showtime, Screen, User, Reservation, MovieReview } from './types';
import { getRelativeDateString } from './data/seedData';
import { Film } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [userReviews, setUserReviews] = useState<MovieReview[]>([]);
  const [allReviews, setAllReviews] = useState<MovieReview[]>([]);
  const [activeTab, setActiveTab] = useState<'movies' | 'schedule' | 'tickets' | 'admin' | 'api'>('movies');

  // Dates
  const [selectedDate, setSelectedDate] = useState<string>(getRelativeDateString(0));
  const availableDates = [
    { label: 'Today, Oct 28', date: getRelativeDateString(0), subLabel: 'Wednesday' },
    { label: 'Thu, Oct 29', date: getRelativeDateString(1), subLabel: 'Tomorrow' },
    { label: 'Fri, Oct 30', date: getRelativeDateString(2), subLabel: 'Friday Night' },
    { label: 'Sat, Oct 31', date: getRelativeDateString(3), subLabel: 'Saturday Matinee' },
  ];

  // Modals
  const [bookingShowtime, setBookingShowtime] = useState<Showtime | null>(null);
  const [viewingTicketPass, setViewingTicketPass] = useState<Reservation | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Review Modals
  const [reviewingTarget, setReviewingTarget] = useState<{
    movie: Movie;
    reservation?: Reservation;
    existingReview?: MovieReview;
  } | null>(null);
  const [reviewsListMovie, setReviewsListMovie] = useState<Movie | null>(null);

  // Initialize and load all system state
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const cur = apiService.getCurrentUser();
    setCurrentUser(cur);

    const mRes = await apiService.getMovies();
    if (mRes.data) setMovies(mRes.data);

    const sRes = await apiService.getShowtimes();
    if (sRes.data) setShowtimes(sRes.data);

    const scRes = await apiService.getScreens();
    if (scRes.data) setScreens(scRes.data);

    const uRes = await apiService.getUsers();
    if (uRes.data) {
      setAllUsers(uRes.data);
    } else {
      if (cur) setAllUsers([cur]);
    }

    const rRes = await apiService.getUserReservations();
    if (rRes.data) setUserReservations(rRes.data);

    const urRes = await apiService.getUserReviews();
    if (urRes.data) setUserReviews(urRes.data);

    const arRes = await apiService.getReviews();
    if (arRes.data) setAllReviews(arRes.data);
  };

  const handleSwitchUser = (userId: string) => {
    const updated = apiService.switchUser(userId);
    if (updated) {
      setCurrentUser(updated);
      loadData();
    }
  };

  const handleLogout = async () => {
    await apiService.logout();
    setCurrentUser(null);
    loadData();
  };

  const handleBookShowtime = (showtime: Showtime) => {
    setBookingShowtime(showtime);
  };

  const handleReservationCompleted = async (reservation: Reservation) => {
    setBookingShowtime(null);
    setViewingTicketPass(reservation);
    await loadData();
  };

  const handleCancelReservation = async (reservationId: string) => {
    const res = await apiService.cancelReservation(reservationId);
    if (res.status === 200) {
      await loadData();
    } else {
      throw new Error(res.error || 'Failed to cancel reservation');
    }
  };

  const handleOpenReviewModal = (
    movie: Movie,
    reservation: Reservation,
    existingReview?: MovieReview
  ) => {
    setReviewingTarget({
      movie,
      reservation,
      existingReview,
    });
  };

  const featuredMovie = movies.find(m => m.featured) || movies[0];
  const bookingMovie = bookingShowtime ? movies.find(m => m.id === bookingShowtime.movieId) : null;
  const bookingScreen = bookingShowtime ? screens.find(sc => sc.id === bookingShowtime.screenId) : null;

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Navigation Top Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        allUsers={allUsers}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'movies' && (
          <>
            {featuredMovie && (
              <HeroPremiere
                movie={featuredMovie}
                showtimes={showtimes}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onBookShowtime={handleBookShowtime}
                availableDates={availableDates}
                onOpenReviewsList={(m) => setReviewsListMovie(m)}
              />
            )}
            <MovieCatalog
              movies={movies}
              showtimes={showtimes}
              screens={screens}
              selectedDate={selectedDate}
              onBookShowtime={handleBookShowtime}
              onOpenReviewsList={(m) => setReviewsListMovie(m)}
            />
          </>
        )}

        {activeTab === 'schedule' && (
          <ShowtimeScheduleView
            movies={movies}
            showtimes={showtimes}
            screens={screens}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            availableDates={availableDates}
            onBookShowtime={handleBookShowtime}
          />
        )}

        {activeTab === 'tickets' && (
          <MyReservationsView
            reservations={userReservations}
            movies={movies}
            userReviews={userReviews}
            onCancelReservation={handleCancelReservation}
            onViewTicket={(r) => setViewingTicketPass(r)}
            onExploreMovies={() => setActiveTab('movies')}
            onOpenReviewModal={handleOpenReviewModal}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            currentUser={currentUser}
            movies={movies}
            showtimes={showtimes}
            screens={screens}
            allUsers={allUsers}
            onRefreshData={loadData}
            onSwitchUser={handleSwitchUser}
          />
        )}

        {activeTab === 'api' && (
          <ApiExplorer
            currentUser={currentUser}
            movies={movies}
            showtimes={showtimes}
            onRefreshData={loadData}
          />
        )}
      </main>

      {/* Seat Picker Modal */}
      {bookingShowtime && bookingMovie && bookingScreen && (
        <SeatPickerModal
          showtime={bookingShowtime}
          movie={bookingMovie}
          screen={bookingScreen}
          onClose={() => setBookingShowtime(null)}
          onReservationComplete={handleReservationCompleted}
          onRequireAuth={() => {
            setBookingShowtime(null);
            setAuthModalOpen(true);
          }}
        />
      )}

      {/* Digital Boarding Pass Ticket Modal */}
      {viewingTicketPass && (
        <TicketPassModal
          reservation={viewingTicketPass}
          onClose={() => setViewingTicketPass(null)}
        />
      )}

      {/* Write/Edit Movie Review Modal */}
      {reviewingTarget && (
        <ReviewModal
          movie={reviewingTarget.movie}
          reservationId={reviewingTarget.reservation?.id}
          initialReview={reviewingTarget.existingReview}
          onClose={() => setReviewingTarget(null)}
          onSuccess={async () => {
            await loadData();
          }}
          onDelete={async () => {
            await loadData();
          }}
        />
      )}

      {/* Browse Audience Reviews Modal */}
      {reviewsListMovie && (
        <ReviewsListModal
          movie={reviewsListMovie}
          reviews={allReviews.filter(r => r.movieId === reviewsListMovie.id)}
          onClose={() => setReviewsListMovie(null)}
          canReview={userReservations.some(r => r.movieId === reviewsListMovie.id)}
          onOpenAddReview={() => {
            const userRes = userReservations.find(r => r.movieId === reviewsListMovie.id);
            const userExisting = userReviews.find(r => r.movieId === reviewsListMovie.id);
            setReviewingTarget({
              movie: reviewsListMovie,
              reservation: userRes,
              existingReview: userExisting,
            });
          }}
        />
      )}

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            loadData();
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#06070a] py-10 px-4 md:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-300">CineVerse Multiplex System</span>
              <p className="text-[11px] text-slate-500">
                Auditorium reservation engine with verified community ratings & business analytics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-slate-400">
            <button
              onClick={() => setActiveTab('movies')}
              className="hover:text-amber-400 transition-colors"
            >
              Movies
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className="hover:text-amber-400 transition-colors"
            >
              Showtimes
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className="hover:text-amber-400 transition-colors"
            >
              My Tickets
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="hover:text-amber-400 transition-colors"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className="hover:text-amber-400 transition-colors"
            >
              API Docs
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

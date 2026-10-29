import {
  User,
  Movie,
  Screen,
  Showtime,
  Reservation,
  ConcessionItem,
  AdminReport,
  Seat,
  MovieReview,
} from '../types';
import {
  SEED_USERS,
  SEED_MOVIES,
  SEED_SCREENS,
  SEED_CONCESSIONS,
  generateSeedShowtimes,
  generateSeedReservations,
  generateSeedReviews,
} from '../data/seedData';
import { generateSeatsForScreen } from '../utils/seatLayout';

const STORAGE_KEYS = {
  USERS: 'cineverse_users_v1',
  CURRENT_USER: 'cineverse_auth_user_v1',
  MOVIES: 'cineverse_movies_v1',
  SCREENS: 'cineverse_screens_v1',
  SHOWTIMES: 'cineverse_showtimes_v1',
  RESERVATIONS: 'cineverse_reservations_v1',
  CONCESSIONS: 'cineverse_concessions_v1',
  REVIEWS: 'cineverse_reviews_v1',
};

// Response shape for our REST API layer
export interface ApiResponse<T> {
  status: number;
  data?: T;
  error?: string;
  endpoint?: string;
  method?: string;
  timestamp: string;
  durationMs: number;
}

class BackendApiService {
  private users: (User & { passwordHash: string })[] = [];
  private currentUser: User | null = null;
  private movies: Movie[] = [];
  private screens: Screen[] = [];
  private showtimes: Showtime[] = [];
  private reservations: Reservation[] = [];
  private concessions: ConcessionItem[] = [];
  private reviews: MovieReview[] = [];

  constructor() {
    this.initializeState();
  }

  private initializeState() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const storedMovies = localStorage.getItem(STORAGE_KEYS.MOVIES);
      const storedScreens = localStorage.getItem(STORAGE_KEYS.SCREENS);
      const storedShowtimes = localStorage.getItem(STORAGE_KEYS.SHOWTIMES);
      const storedReservations = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      const storedConcessions = localStorage.getItem(STORAGE_KEYS.CONCESSIONS);
      const storedAuth = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

      const storedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);

      this.users = storedUsers ? JSON.parse(storedUsers) : [...SEED_USERS];
      this.movies = storedMovies ? JSON.parse(storedMovies) : [...SEED_MOVIES];
      this.screens = storedScreens ? JSON.parse(storedScreens) : [...SEED_SCREENS];
      this.concessions = storedConcessions ? JSON.parse(storedConcessions) : [...SEED_CONCESSIONS];
      this.reviews = storedReviews ? JSON.parse(storedReviews) : generateSeedReviews();

      if (storedShowtimes) {
        this.showtimes = JSON.parse(storedShowtimes);
      } else {
        this.showtimes = generateSeedShowtimes();
      }

      if (storedReservations) {
        this.reservations = JSON.parse(storedReservations);
      } else {
        this.reservations = generateSeedReservations(this.showtimes);
      }

      if (storedAuth) {
        this.currentUser = JSON.parse(storedAuth);
      } else {
        // Default to Regular User for safe instant user view
        this.currentUser = {
          id: 'usr_user_001',
          name: 'Alex Mercer',
          email: 'alex@cineverse.com',
          role: 'user',
          createdAt: '2026-10-15T12:30:00.000Z',
        };
      }

      this.persist();
    } catch (err) {
      console.warn('Storage initial load error, using memory fallback:', err);
      this.users = [...SEED_USERS];
      this.movies = [...SEED_MOVIES];
      this.screens = [...SEED_SCREENS];
      this.showtimes = generateSeedShowtimes();
      this.reservations = generateSeedReservations(this.showtimes);
      this.concessions = [...SEED_CONCESSIONS];
      this.reviews = generateSeedReviews();
      this.currentUser = this.users[1];
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(this.movies));
      localStorage.setItem(STORAGE_KEYS.SCREENS, JSON.stringify(this.screens));
      localStorage.setItem(STORAGE_KEYS.SHOWTIMES, JSON.stringify(this.showtimes));
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(this.reservations));
      localStorage.setItem(STORAGE_KEYS.CONCESSIONS, JSON.stringify(this.concessions));
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews));
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error('Failed to persist to localStorage:', e);
    }
  }

  public resetToDefault(): void {
    localStorage.clear();
    this.users = [...SEED_USERS];
    this.movies = [...SEED_MOVIES];
    this.screens = [...SEED_SCREENS];
    this.showtimes = generateSeedShowtimes();
    this.reservations = generateSeedReservations(this.showtimes);
    this.concessions = [...SEED_CONCESSIONS];
    this.reviews = generateSeedReviews();
    this.currentUser = this.users[1];
    this.persist();
  }

  private wrapSuccess<T>(
    status: number,
    endpoint: string,
    method: string,
    data: T,
    startMs = performance.now()
  ): ApiResponse<T> {
    return {
      status,
      data,
      endpoint,
      method,
      timestamp: new Date().toISOString(),
      durationMs: Math.max(12, Math.round(performance.now() - startMs)),
    };
  }

  private wrapError<T = any>(
    status: number,
    endpoint: string,
    method: string,
    error: string,
    startMs = performance.now()
  ): ApiResponse<T> {
    return {
      status,
      error,
      endpoint,
      method,
      timestamp: new Date().toISOString(),
      durationMs: Math.max(12, Math.round(performance.now() - startMs)),
    };
  }

  // --- AUTHENTICATION & AUTHORIZATION ---

  public async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const t0 = performance.now();
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.passwordHash !== password) {
      return this.wrapError(401, '/api/auth/login', 'POST', 'Invalid email address or password.', t0);
    }

    const { passwordHash: _, ...safeUser } = user;
    this.currentUser = safeUser;
    this.persist();

    const token = `jwt_token_${safeUser.id}_${Date.now()}`;
    return this.wrapSuccess(200, '/api/auth/login', 'POST', { user: safeUser, token }, t0);
  }

  public async signup(name: string, email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const t0 = performance.now();
    if (!name.trim() || !email.trim() || !password.trim()) {
      return this.wrapError(400, '/api/auth/signup', 'POST', 'Name, email, and password are required.', t0);
    }

    const existing = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return this.wrapError(409, '/api/auth/signup', 'POST', 'An account with this email already exists.', t0);
    }

    const newUser: User & { passwordHash: string } = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'user', // regular user by default
      createdAt: new Date().toISOString(),
      passwordHash: password,
    };

    this.users.push(newUser);
    const { passwordHash: _, ...safeUser } = newUser;
    this.currentUser = safeUser;
    this.persist();

    const token = `jwt_token_${safeUser.id}_${Date.now()}`;
    return this.wrapSuccess(201, '/api/auth/signup', 'POST', { user: safeUser, token }, t0);
  }

  public async logout(): Promise<ApiResponse<{ message: string }>> {
    const t0 = performance.now();
    this.currentUser = null;
    this.persist();
    return this.wrapSuccess(200, '/api/auth/logout', 'POST', { message: 'Logged out successfully.' }, t0);
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public switchUser(userId: string): User | null {
    const found = this.users.find(u => u.id === userId);
    if (found) {
      const { passwordHash: _, ...safeUser } = found;
      this.currentUser = safeUser;
      this.persist();
      return safeUser;
    }
    return null;
  }

  // --- MOVIE MANAGEMENT ---

  private populateMovieRatings(movies: Movie[]): Movie[] {
    return movies.map(m => {
      const movieReviews = this.reviews.filter(r => r.movieId === m.id);
      const count = movieReviews.length;
      let avg = 0;
      if (count > 0) {
        const sum = movieReviews.reduce((acc, r) => acc + r.rating, 0);
        avg = Math.round((sum / count) * 10) / 10;
      }
      return {
        ...m,
        averageRating: avg,
        reviewCount: count,
      };
    });
  }

  public async getMovies(genre?: string, search?: string): Promise<ApiResponse<Movie[]>> {
    const t0 = performance.now();
    let result = [...this.movies];

    if (genre && genre !== 'All') {
      result = result.filter(m => m.genre.toLowerCase() === genre.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        m =>
          m.title.toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q) ||
          m.cast.some(c => c.toLowerCase().includes(q))
      );
    }

    const populated = this.populateMovieRatings(result);
    return this.wrapSuccess(200, `/api/movies?genre=${genre || 'All'}`, 'GET', populated, t0);
  }

  public async getMovieById(id: string): Promise<ApiResponse<Movie>> {
    const t0 = performance.now();
    const movie = this.movies.find(m => m.id === id);
    if (!movie) {
      return this.wrapError(404, `/api/movies/${id}`, 'GET', 'Movie not found.', t0);
    }
    const populated = this.populateMovieRatings([movie])[0];
    return this.wrapSuccess(200, `/api/movies/${id}`, 'GET', populated, t0);
  }

  public async createMovie(movieData: Omit<Movie, 'id'>): Promise<ApiResponse<Movie>> {
    const t0 = performance.now();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      return this.wrapError(403, '/api/movies', 'POST', 'Access denied. Administrator privileges required.', t0);
    }

    if (!movieData.title || !movieData.description || !movieData.genre) {
      return this.wrapError(400, '/api/movies', 'POST', 'Title, description, and genre are required.', t0);
    }

    const newMovie: Movie = {
      ...movieData,
      id: `mov_${Date.now()}`,
    };

    this.movies.unshift(newMovie);
    this.persist();

    return this.wrapSuccess(201, '/api/movies', 'POST', newMovie, t0);
  }

  public async updateMovie(id: string, movieData: Partial<Movie>): Promise<ApiResponse<Movie>> {
    const t0 = performance.now();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      return this.wrapError(403, `/api/movies/${id}`, 'PUT', 'Access denied. Administrator privileges required.', t0);
    }

    const idx = this.movies.findIndex(m => m.id === id);
    if (idx === -1) {
      return this.wrapError(404, `/api/movies/${id}`, 'PUT', 'Movie not found.', t0);
    }

    this.movies[idx] = { ...this.movies[idx], ...movieData };
    this.persist();

    return this.wrapSuccess(200, `/api/movies/${id}`, 'PUT', this.movies[idx], t0);
  }

  public async deleteMovie(id: string): Promise<ApiResponse<{ message: string; deletedId: string }>> {
    const t0 = performance.now();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      return this.wrapError(403, `/api/movies/${id}`, 'DELETE', 'Access denied. Administrator privileges required.', t0);
    }

    const idx = this.movies.findIndex(m => m.id === id);
    if (idx === -1) {
      return this.wrapError(404, `/api/movies/${id}`, 'DELETE', 'Movie not found.', t0);
    }

    this.movies.splice(idx, 1);
    this.showtimes = this.showtimes.filter(s => s.movieId !== id);
    this.persist();

    return this.wrapSuccess(200, `/api/movies/${id}`, 'DELETE', { message: 'Movie and associated showtimes removed.', deletedId: id }, t0);
  }

  // --- SHOWTIME MANAGEMENT & SCREEN CONFLICT CHECK ---

  public async getShowtimes(date?: string, movieId?: string): Promise<ApiResponse<Showtime[]>> {
    const t0 = performance.now();
    let result = [...this.showtimes];

    if (date) {
      result = result.filter(s => s.date === date);
    }

    if (movieId) {
      result = result.filter(s => s.movieId === movieId);
    }

    result.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

    return this.wrapSuccess(200, `/api/showtimes?date=${date || ''}&movieId=${movieId || ''}`, 'GET', result, t0);
  }

  public async getShowtimeById(id: string): Promise<ApiResponse<Showtime>> {
    const t0 = performance.now();
    const showtime = this.showtimes.find(s => s.id === id);
    if (!showtime) {
      return this.wrapError(404, `/api/showtimes/${id}`, 'GET', 'Showtime not found.', t0);
    }
    return this.wrapSuccess(200, `/api/showtimes/${id}`, 'GET', showtime, t0);
  }

  public async createShowtime(data: Omit<Showtime, 'id'>): Promise<ApiResponse<Showtime>> {
    const t0 = performance.now();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      return this.wrapError(403, '/api/showtimes', 'POST', 'Access denied. Administrator privileges required.', t0);
    }

    const [newHour, newMin] = data.time.split(':').map(Number);
    const newTimeMinutes = newHour * 60 + newMin;

    const conflict = this.showtimes.find(existing => {
      if (existing.screenId === data.screenId && existing.date === data.date) {
        const [exHour, exMin] = existing.time.split(':').map(Number);
        const exTimeMinutes = exHour * 60 + exMin;
        return Math.abs(exTimeMinutes - newTimeMinutes) < 120;
      }
      return false;
    });

    if (conflict) {
      return this.wrapError(
        409,
        '/api/showtimes',
        'POST',
        `Auditorium scheduling conflict: Screen is already reserved at ${conflict.time} on ${data.date}. Allow at least 2 hours between showings.`,
        t0
      );
    }

    const newShowtime: Showtime = {
      ...data,
      id: `sht_${Date.now()}`,
    };

    this.showtimes.push(newShowtime);
    this.persist();

    return this.wrapSuccess(201, '/api/showtimes', 'POST', newShowtime, t0);
  }

  public async deleteShowtime(id: string): Promise<ApiResponse<{ message: string }>> {
    const t0 = performance.now();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      return this.wrapError(403, `/api/showtimes/${id}`, 'DELETE', 'Access denied. Administrator privileges required.', t0);
    }

    const idx = this.showtimes.findIndex(s => s.id === id);
    if (idx === -1) {
      return this.wrapError(404, `/api/showtimes/${id}`, 'DELETE', 'Showtime not found.', t0);
    }

    this.showtimes.splice(idx, 1);
    this.persist();

    return this.wrapSuccess(200, `/api/showtimes/${id}`, 'DELETE', { message: 'Showtime deleted.' }, t0);
  }

  // --- AUDITORIUM SCREENS & SEAT AVAILABILITY ---

  public async getScreens(): Promise<ApiResponse<Screen[]>> {
    const t0 = performance.now();
    return this.wrapSuccess(200, '/api/screens', 'GET', this.screens, t0);
  }

  public async getSeatAvailability(
    showtimeId: string
  ): Promise<ApiResponse<{ seats: Seat[]; bookedSeatIds: string[]; screen: Screen; showtime: Showtime }>> {
    const t0 = performance.now();
    const showtime = this.showtimes.find(s => s.id === showtimeId);
    if (!showtime) {
      return this.wrapError(404, `/api/showtimes/${showtimeId}/seats`, 'GET', 'Showtime not found.', t0);
    }

    const screen = this.screens.find(sc => sc.id === showtime.screenId);
    if (!screen) {
      return this.wrapError(404, `/api/showtimes/${showtimeId}/seats`, 'GET', 'Screen not found.', t0);
    }

    const allSeats = generateSeatsForScreen(screen, showtime.basePrice);

    const confirmedReservations = this.reservations.filter(
      r => r.showtimeId === showtimeId && r.status === 'confirmed'
    );

    const bookedSeatIds: string[] = [];
    confirmedReservations.forEach(r => {
      r.seats.forEach(s => bookedSeatIds.push(s.id));
    });

    return this.wrapSuccess(
      200,
      `/api/showtimes/${showtimeId}/seats`,
      'GET',
      {
        seats: allSeats,
        bookedSeatIds,
        screen,
        showtime,
      },
      t0
    );
  }

  // --- RESERVATION MANAGEMENT & OVERBOOKING PREVENTION ---

  public async createReservation(payload: {
    showtimeId: string;
    seatIds: string[];
    concessions?: { itemId: string; quantity: number }[];
  }): Promise<ApiResponse<Reservation>> {
    const t0 = performance.now();
    if (!this.currentUser) {
      return this.wrapError(401, '/api/reservations', 'POST', 'Please log in to reserve seats.', t0);
    }

    if (!payload.seatIds || payload.seatIds.length === 0) {
      return this.wrapError(400, '/api/reservations', 'POST', 'Please select at least one seat.', t0);
    }

    const showtime = this.showtimes.find(s => s.id === payload.showtimeId);
    if (!showtime) {
      return this.wrapError(404, '/api/reservations', 'POST', 'Showtime not found.', t0);
    }

    const screen = this.screens.find(sc => sc.id === showtime.screenId);
    const movie = this.movies.find(m => m.id === showtime.movieId);

    if (!screen || !movie) {
      return this.wrapError(500, '/api/reservations', 'POST', 'Screen or Movie configuration error.', t0);
    }

    // --- ATOMIC OVERBOOKING CHECK ---
    const confirmedForShowtime = this.reservations.filter(
      r => r.showtimeId === payload.showtimeId && r.status === 'confirmed'
    );

    const alreadyBookedSet = new Set<string>();
    confirmedForShowtime.forEach(r => {
      r.seats.forEach(s => alreadyBookedSet.add(s.id));
    });

    const conflictedSeats = payload.seatIds.filter(id => alreadyBookedSet.has(id));
    if (conflictedSeats.length > 0) {
      return this.wrapError(
        409,
        '/api/reservations',
        'POST',
        `Overbooking prevented: Seat(s) ${conflictedSeats.join(', ')} have just been reserved by another guest. Please pick alternative seats.`,
        t0
      );
    }

    const allSeats = generateSeatsForScreen(screen, showtime.basePrice);
    const selectedSeatObjects = payload.seatIds.map(id => {
      const match = allSeats.find(s => s.id === id);
      return {
        id,
        row: id.charAt(0),
        number: parseInt(id.slice(1), 10),
        tier: match ? match.tier : 'standard',
        price: match ? match.price : showtime.basePrice,
      };
    });

    let seatTotal = selectedSeatObjects.reduce((acc, s) => acc + s.price, 0);

    const concessionSelections = (payload.concessions || [])
      .filter(c => c.quantity > 0)
      .map(c => {
        const item = this.concessions.find(ci => ci.id === c.itemId);
        const price = item ? item.price : 0;
        return {
          itemId: c.itemId,
          name: item ? item.name : 'Concession Item',
          quantity: c.quantity,
          price,
        };
      });

    const concessionTotal = concessionSelections.reduce((acc, c) => acc + c.price * c.quantity, 0);
    const totalAmount = Math.round((seatTotal + concessionTotal) * 100) / 100;

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingCode = `CV-${randomSuffix}`;

    const newReservation: Reservation = {
      id: `res_${Date.now()}`,
      bookingCode,
      userId: this.currentUser.id,
      userEmail: this.currentUser.email,
      userName: this.currentUser.name,
      showtimeId: showtime.id,
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.poster,
      screenId: screen.id,
      screenName: screen.name,
      date: showtime.date,
      time: showtime.time,
      seats: selectedSeatObjects,
      concessions: concessionSelections,
      totalAmount,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    this.reservations.unshift(newReservation);
    this.persist();

    return this.wrapSuccess(201, '/api/reservations', 'POST', newReservation, t0);
  }

  public async getUserReservations(): Promise<ApiResponse<Reservation[]>> {
    const t0 = performance.now();
    if (!this.currentUser) {
      return this.wrapError(401, '/api/reservations/my', 'GET', 'Please log in to view reservations.', t0);
    }

    const userRes = this.reservations.filter(r => r.userId === this.currentUser!.id);
    userRes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return this.wrapSuccess(200, '/api/reservations/my', 'GET', userRes, t0);
  }

  public async cancelReservation(reservationId: string): Promise<ApiResponse<{ message: string; reservation: Reservation }>> {
    const t0 = performance.now();
    if (!this.currentUser) {
      return this.wrapError(401, `/api/reservations/${reservationId}`, 'DELETE', 'Unauthorized.', t0);
    }

    const reservation = this.reservations.find(r => r.id === reservationId);
    if (!reservation) {
      return this.wrapError(404, `/api/reservations/${reservationId}`, 'DELETE', 'Reservation not found.', t0);
    }

    if (reservation.userId !== this.currentUser.id && this.currentUser.role !== 'admin') {
      return this.wrapError(403, `/api/reservations/${reservationId}`, 'DELETE', 'Forbidden: You cannot cancel another user’s reservation.', t0);
    }

    if (reservation.status === 'cancelled') {
      return this.wrapError(400, `/api/reservations/${reservationId}`, 'DELETE', 'This reservation is already cancelled.', t0);
    }

    const showtimeDateTime = new Date(`${reservation.date}T${reservation.time}:00`);
    const now = new Date('2026-10-28T09:49:00');

    if (showtimeDateTime.getTime() < now.getTime()) {
      return this.wrapError(
        400,
        `/api/reservations/${reservationId}`,
        'DELETE',
        'Cannot cancel past showtimes. Cancellation is only permitted for upcoming screenings.',
        t0
      );
    }

    reservation.status = 'cancelled';
    this.persist();

    return this.wrapSuccess(
      200,
      `/api/reservations/${reservationId}`,
      'DELETE',
      {
        message: 'Reservation cancelled successfully. Seats have been returned to available inventory.',
        reservation,
      },
      t0
    );
  }

  // --- ADMIN REPORTING & SYSTEM OVERSIGHT ---

  public async getAdminReports(): Promise<ApiResponse<AdminReport>> {
    const t0 = performance.now();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      return this.wrapError(403, '/api/admin/reports', 'GET', 'Access denied. Administrator privileges required.', t0);
    }

    const confirmedReservations = this.reservations.filter(r => r.status === 'confirmed');

    const totalRevenue = confirmedReservations.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalTickets = confirmedReservations.reduce((sum, r) => sum + r.seats.length, 0);

    let totalCapacity = 0;
    this.showtimes.forEach(st => {
      const screen = this.screens.find(sc => sc.id === st.screenId);
      if (screen) {
        totalCapacity += screen.capacity;
      }
    });

    const occupancyRate = totalCapacity > 0 ? Math.round((totalTickets / totalCapacity) * 1000) / 10 : 0;

    const movieRevMap = new Map<string, { title: string; revenue: number; tickets: number }>();
    this.movies.forEach(m => movieRevMap.set(m.id, { title: m.title, revenue: 0, tickets: 0 }));

    confirmedReservations.forEach(r => {
      const entry = movieRevMap.get(r.movieId);
      if (entry) {
        entry.revenue += r.totalAmount;
        entry.tickets += r.seats.length;
      }
    });

    const revenueByMovie = Array.from(movieRevMap.entries()).map(([movieId, data]) => ({
      movieId,
      title: data.title,
      revenue: Math.round(data.revenue * 100) / 100,
      tickets: data.tickets,
    }));

    const genreRevMap = new Map<string, number>();
    confirmedReservations.forEach(r => {
      const movie = this.movies.find(m => m.id === r.movieId);
      const genre = movie ? movie.genre : 'Other';
      genreRevMap.set(genre, (genreRevMap.get(genre) || 0) + r.totalAmount);
    });

    const revenueByGenre = Array.from(genreRevMap.entries()).map(([genre, rev]) => ({
      genre,
      revenue: Math.round(rev * 100) / 100,
      percentage: totalRevenue > 0 ? Math.round((rev / totalRevenue) * 1000) / 10 : 0,
    }));

    const screenStats = this.screens.map(screen => {
      const screenShowtimes = this.showtimes.filter(s => s.screenId === screen.id);
      const screenCap = screenShowtimes.length * screen.capacity;
      let seatsBooked = 0;

      confirmedReservations.forEach(r => {
        if (r.screenId === screen.id) {
          seatsBooked += r.seats.length;
        }
      });

      return {
        screenId: screen.id,
        screenName: screen.name,
        screenType: screen.type,
        totalShowtimes: screenShowtimes.length,
        totalCapacity: screenCap,
        seatsBooked,
        occupancyRate: screenCap > 0 ? Math.round((seatsBooked / screenCap) * 1000) / 10 : 0,
      };
    });

    const report: AdminReport = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalTickets,
      occupancyRate,
      activeMoviesCount: this.movies.length,
      upcomingShowtimesCount: this.showtimes.length,
      revenueByMovie,
      revenueByGenre,
      screenStats,
      allReservations: [...this.reservations],
    };

    return this.wrapSuccess(200, '/api/admin/reports', 'GET', report, t0);
  }

  public async getAllReservations(): Promise<ApiResponse<Reservation[]>> {
    const t0 = performance.now();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      return this.wrapError(403, '/api/admin/reservations', 'GET', 'Access denied. Admin required.', t0);
    }
    const res = [...this.reservations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return this.wrapSuccess(200, '/api/admin/reservations', 'GET', res, t0);
  }

  public async getUsers(): Promise<ApiResponse<User[]>> {
    const t0 = performance.now();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      return this.wrapError(403, '/api/admin/users', 'GET', 'Access denied. Admin required.', t0);
    }

    const safeUsers = this.users.map(({ passwordHash: _, ...u }) => u);
    return this.wrapSuccess(200, '/api/admin/users', 'GET', safeUsers, t0);
  }

  public async updateUserRole(userId: string, role: 'admin' | 'user'): Promise<ApiResponse<User>> {
    const t0 = performance.now();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      return this.wrapError(403, `/api/admin/users/${userId}/role`, 'PATCH', 'Access denied. Admin required.', t0);
    }

    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return this.wrapError(404, `/api/admin/users/${userId}/role`, 'PATCH', 'User not found.', t0);
    }

    user.role = role;
    if (this.currentUser.id === userId) {
      this.currentUser.role = role;
    }
    this.persist();

    const { passwordHash: _, ...safeUser } = user;
    return this.wrapSuccess(200, `/api/admin/users/${userId}/role`, 'PATCH', safeUser, t0);
  }

  public async getConcessions(): Promise<ApiResponse<ConcessionItem[]>> {
    const t0 = performance.now();
    return this.wrapSuccess(200, '/api/concessions', 'GET', this.concessions, t0);
  }

  // --- REVIEWS & RATINGS (FOR BOOKED MOVIES) ---

  public async getReviews(movieId?: string): Promise<ApiResponse<MovieReview[]>> {
    const t0 = performance.now();
    let result = [...this.reviews];
    if (movieId) {
      result = result.filter(r => r.movieId === movieId);
    }
    result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return this.wrapSuccess(200, `/api/reviews?movieId=${movieId || ''}`, 'GET', result, t0);
  }

  public async getUserReviews(): Promise<ApiResponse<MovieReview[]>> {
    const t0 = performance.now();
    if (!this.currentUser) {
      return this.wrapError(401, '/api/reviews/my', 'GET', 'Please log in to view your reviews.', t0);
    }
    const userReviews = this.reviews.filter(r => r.userId === this.currentUser!.id);
    userReviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return this.wrapSuccess(200, '/api/reviews/my', 'GET', userReviews, t0);
  }

  public async createOrUpdateReview(payload: {
    movieId: string;
    reservationId?: string;
    rating: number;
    comment: string;
  }): Promise<ApiResponse<MovieReview>> {
    const t0 = performance.now();
    if (!this.currentUser) {
      return this.wrapError(401, '/api/reviews', 'POST', 'Please sign in to rate or review a movie.', t0);
    }

    if (!payload.movieId) {
      return this.wrapError(400, '/api/reviews', 'POST', 'Movie ID is required.', t0);
    }

    if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
      return this.wrapError(400, '/api/reviews', 'POST', 'Please provide a valid rating from 1 to 5 stars.', t0);
    }

    if (!payload.comment || !payload.comment.trim()) {
      return this.wrapError(400, '/api/reviews', 'POST', 'Please write a brief review comment.', t0);
    }

    // --- CRITICAL ELIGIBILITY CHECK ---
    // Verified booking gate: user must have a reservation in their history for this movie!
    const hasReservation = this.reservations.some(
      r => r.userId === this.currentUser!.id && r.movieId === payload.movieId
    );

    if (!hasReservation) {
      return this.wrapError(
        403,
        '/api/reviews',
        'POST',
        'Review not permitted: Only verified moviegoers who have booked this movie in their reservation history can leave a rating and review.',
        t0
      );
    }

    const matchingRes = payload.reservationId
      ? this.reservations.find(r => r.id === payload.reservationId)
      : this.reservations.find(r => r.userId === this.currentUser!.id && r.movieId === payload.movieId);

    const resId = matchingRes ? matchingRes.id : payload.reservationId || 'res_verified';

    // Check if review already exists for this user and movie
    const existingIndex = this.reviews.findIndex(
      r => r.userId === this.currentUser!.id && r.movieId === payload.movieId
    );

    let resultReview: MovieReview;

    if (existingIndex !== -1) {
      // Update existing review
      this.reviews[existingIndex] = {
        ...this.reviews[existingIndex],
        rating: Math.round(payload.rating),
        comment: payload.comment.trim(),
        updatedAt: new Date().toISOString(),
      };
      resultReview = this.reviews[existingIndex];
    } else {
      // Create new review
      resultReview = {
        id: `rev_${Date.now()}`,
        movieId: payload.movieId,
        reservationId: resId,
        userId: this.currentUser.id,
        userName: this.currentUser.name,
        rating: Math.round(payload.rating),
        comment: payload.comment.trim(),
        createdAt: new Date().toISOString(),
      };
      this.reviews.unshift(resultReview);
    }

    this.persist();
    return this.wrapSuccess(200, '/api/reviews', 'POST', resultReview, t0);
  }

  public async deleteReview(reviewId: string): Promise<ApiResponse<{ message: string; deletedId: string }>> {
    const t0 = performance.now();
    if (!this.currentUser) {
      return this.wrapError(401, `/api/reviews/${reviewId}`, 'DELETE', 'Unauthorized.', t0);
    }

    const idx = this.reviews.findIndex(r => r.id === reviewId);
    if (idx === -1) {
      return this.wrapError(404, `/api/reviews/${reviewId}`, 'DELETE', 'Review not found.', t0);
    }

    const review = this.reviews[idx];
    if (review.userId !== this.currentUser.id && this.currentUser.role !== 'admin') {
      return this.wrapError(403, `/api/reviews/${reviewId}`, 'DELETE', 'Forbidden: You cannot delete another user’s review.', t0);
    }

    this.reviews.splice(idx, 1);
    this.persist();

    return this.wrapSuccess(200, `/api/reviews/${reviewId}`, 'DELETE', { message: 'Review deleted.', deletedId: reviewId }, t0);
  }
}

export const apiService = new BackendApiService();

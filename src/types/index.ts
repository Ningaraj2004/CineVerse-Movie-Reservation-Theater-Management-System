export type Role = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export type Genre = 'All' | 'Sci-Fi' | 'Action' | 'Drama' | 'Animation' | 'Thriller' | 'Comedy';

export interface Movie {
  id: string;
  title: string;
  description: string;
  poster: string;
  genre: string;
  duration: number; // in minutes
  rating: 'G' | 'PG' | 'PG-13' | 'R';
  director: string;
  cast: string[];
  releaseYear: number;
  featured?: boolean;
  averageRating?: number; // 1.0 to 5.0
  reviewCount?: number;
}

export type ScreenType = 'IMAX Laser' | 'Dolby Atmos' | 'Prime Screen';

export interface Screen {
  id: string;
  name: string;
  type: ScreenType;
  totalRows: number; // e.g. 8 (Rows A to H)
  seatsPerRow: number; // e.g. 12
  capacity: number;
}

export type SeatTier = 'standard' | 'vip' | 'recliner';

export interface Seat {
  id: string; // e.g. "A1", "D6"
  row: string;
  number: number;
  tier: SeatTier;
  price: number;
  isAccessible?: boolean;
}

export interface Showtime {
  id: string;
  movieId: string;
  screenId: string;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:MM'
  format: '2D' | '3D' | 'IMAX 3D' | 'Dolby Cinema';
  basePrice: number;
}

export interface ConcessionItem {
  id: string;
  name: string;
  category: 'Popcorn' | 'Beverage' | 'Snack' | 'Combo';
  price: number;
  description: string;
}

export interface ConcessionSelection {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

export type ReservationStatus = 'confirmed' | 'cancelled';

export interface Reservation {
  id: string;
  bookingCode: string; // e.g. "CV-98421"
  userId: string;
  userEmail: string;
  userName: string;
  showtimeId: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  screenId: string;
  screenName: string;
  date: string;
  time: string;
  seats: {
    id: string;
    row: string;
    number: number;
    tier: SeatTier;
    price: number;
  }[];
  concessions: ConcessionSelection[];
  totalAmount: number;
  status: ReservationStatus;
  createdAt: string;
}

export interface AdminReport {
  totalRevenue: number;
  totalTickets: number;
  occupancyRate: number;
  activeMoviesCount: number;
  upcomingShowtimesCount: number;
  revenueByMovie: {
    movieId: string;
    title: string;
    revenue: number;
    tickets: number;
  }[];
  revenueByGenre: {
    genre: string;
    revenue: number;
    percentage: number;
  }[];
  screenStats: {
    screenId: string;
    screenName: string;
    screenType: string;
    totalShowtimes: number;
    totalCapacity: number;
    seatsBooked: number;
    occupancyRate: number;
  }[];
  allReservations: Reservation[];
}

export interface MovieReview {
  id: string;
  movieId: string;
  reservationId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5 integer
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

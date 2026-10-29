import { Movie, Screen, Showtime, ConcessionItem, User, Reservation, MovieReview } from '../types';

export const SEED_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'usr_admin_001',
    name: 'Eleanor Vance',
    email: 'admin@cineverse.com',
    role: 'admin',
    createdAt: '2026-10-01T08:00:00.000Z',
    passwordHash: 'admin123',
  },
  {
    id: 'usr_user_001',
    name: 'Alex Mercer',
    email: 'alex@cineverse.com',
    role: 'user',
    createdAt: '2026-10-15T12:30:00.000Z',
    passwordHash: 'user123',
  },
  {
    id: 'usr_user_002',
    name: 'Maya Chen',
    email: 'maya@cineverse.com',
    role: 'user',
    createdAt: '2026-10-20T14:15:00.000Z',
    passwordHash: 'user123',
  },
];

export const SEED_SCREENS: Screen[] = [
  {
    id: 'scr_imax_1',
    name: 'Grand Theater 1',
    type: 'IMAX Laser',
    totalRows: 8, // A through H
    seatsPerRow: 12,
    capacity: 96,
  },
  {
    id: 'scr_dolby_2',
    name: 'Dolby Cinema 2',
    type: 'Dolby Atmos',
    totalRows: 8,
    seatsPerRow: 12,
    capacity: 96,
  },
  {
    id: 'scr_prime_3',
    name: 'Prime Suite 3',
    type: 'Prime Screen',
    totalRows: 6, // A through F
    seatsPerRow: 10,
    capacity: 60,
  },
];

export const SEED_MOVIES: Movie[] = [
  {
    id: 'mov_interstellar_odyssey',
    title: 'Interstellar Odyssey',
    description:
      'A deep space expedition charts through an unstable cosmic accretion disk on humanity’s greatest frontier crossing, discovering secrets that warp the fabric of memory and time.',
    poster: '/src/assets/images/poster_interstellar_odyssey_1793206434678.jpg',
    genre: 'Sci-Fi',
    duration: 168,
    rating: 'PG-13',
    director: 'Elara Vance',
    cast: ['Marcus Cole', 'Sarah Lin', 'David Oyelowo', 'Hanna Berg'],
    releaseYear: 2026,
    featured: true,
  },
  {
    id: 'mov_shadow_protocol',
    title: 'Shadow Protocol',
    description:
      'In rain-slicked Neo-Kyoto, a disavowed black-ops operative must unravel a syndicate conspiracy inside a hyper-connected metropolis where every shadow is monitored.',
    poster: '/src/assets/images/poster_shadow_protocol_1793206435854.jpg',
    genre: 'Action',
    duration: 134,
    rating: 'R',
    director: 'Eliza Vance',
    cast: ['Luna Chen', 'Elias Thorne', 'Ben Frost', 'Kaito Tanaka'],
    releaseYear: 2026,
    featured: false,
  },
  {
    id: 'mov_crimson_dynasty',
    title: 'The Crimson Dynasty',
    description:
      'A breathtaking historical drama chronicling the rise of rival imperial generals competing for loyalty, duty, and peace across sweeping misty mountain fortresses.',
    poster: '/src/assets/images/poster_crimson_dynasty_1793206434893.jpg',
    genre: 'Drama',
    duration: 152,
    rating: 'PG-13',
    director: 'Liu Wei',
    cast: ['Zhang Wei', 'Liu Feng', 'Chen Xue', 'Liu Jing'],
    releaseYear: 2026,
    featured: false,
  },
  {
    id: 'mov_sunshine_avenue',
    title: 'Sunshine Avenue',
    description:
      'A heartwarming animated comedy capturing the delightful escapades of a tight-knit coastal village neighborhood who band together to revive their historic cobblestone market.',
    poster: '/src/assets/images/poster_sunshine_avenue_1793206435746.jpg',
    genre: 'Animation',
    duration: 102,
    rating: 'PG',
    director: 'Clara Rossi',
    cast: ['Isabella Jones', 'Eliott Brown', 'Matteo Rossi', 'Sofia Conti'],
    releaseYear: 2026,
    featured: false,
  },
];

export const SEED_CONCESSIONS: ConcessionItem[] = [
  {
    id: 'cnc_popcorn_truffle',
    name: 'Artisan Truffle Butter Popcorn',
    category: 'Popcorn',
    price: 9.5,
    description: 'Freshly popped organic corn tossed in warm black truffle oil & flaky sea salt.',
  },
  {
    id: 'cnc_popcorn_caramel',
    name: 'Caramel Crunch Popcorn',
    category: 'Popcorn',
    price: 8.5,
    description: 'Slow-cooked golden butter caramel with roasted crushed pecans.',
  },
  {
    id: 'cnc_drink_craft_soda',
    name: 'Craft Fountain Soda (Large)',
    category: 'Beverage',
    price: 5.5,
    description: 'Choice of cane-sugar Cola, Blood Orange Soda, or Crisp Ginger Ale.',
  },
  {
    id: 'cnc_drink_water',
    name: 'Sparkling Mineral Water',
    category: 'Beverage',
    price: 4.5,
    description: 'San Pellegrino chilled glass bottle with fresh citrus wedge.',
  },
  {
    id: 'cnc_snack_nachos',
    name: 'Loaded Queso Nachos Grande',
    category: 'Snack',
    price: 11.0,
    description: 'Crisp tortilla chips topped with aged cheddar fondue, jalapenos & pico de gallo.',
  },
  {
    id: 'cnc_combo_cinema',
    name: 'Cinema Premiere Combo',
    category: 'Combo',
    price: 18.0,
    description: 'Large Truffle Popcorn + 2 Large Fountain Drinks + Artisan Chocolate Bites.',
  },
];

// Helper to generate calendar dates relative to 2026-10-28
export function getRelativeDateString(daysOffset: number): string {
  const base = new Date('2026-10-28T00:00:00');
  base.setDate(base.getDate() + daysOffset);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  const day = String(base.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateSeedShowtimes(): Showtime[] {
  const dates = [
    getRelativeDateString(0), // Today (2026-10-28)
    getRelativeDateString(1), // Tomorrow (2026-10-29)
    getRelativeDateString(2), // Fri (2026-10-30)
    getRelativeDateString(3), // Sat (2026-10-31)
  ];

  const showtimes: Showtime[] = [];
  let counter = 1;

  dates.forEach((date, dateIdx) => {
    // Interstellar Odyssey in IMAX Laser Screen 1
    showtimes.push({
      id: `sht_${counter++}`,
      movieId: 'mov_interstellar_odyssey',
      screenId: 'scr_imax_1',
      date,
      time: '13:30',
      format: 'IMAX 3D',
      basePrice: 19.5,
    });
    showtimes.push({
      id: `sht_${counter++}`,
      movieId: 'mov_interstellar_odyssey',
      screenId: 'scr_imax_1',
      date,
      time: '17:45',
      format: 'IMAX 3D',
      basePrice: 21.0,
    });
    showtimes.push({
      id: `sht_${counter++}`,
      movieId: 'mov_interstellar_odyssey',
      screenId: 'scr_imax_1',
      date,
      time: '21:15',
      format: 'IMAX 3D',
      basePrice: 21.0,
    });

    // Shadow Protocol in Dolby Cinema Screen 2
    showtimes.push({
      id: `sht_${counter++}`,
      movieId: 'mov_shadow_protocol',
      screenId: 'scr_dolby_2',
      date,
      time: '14:00',
      format: 'Dolby Cinema',
      basePrice: 17.5,
    });
    showtimes.push({
      id: `sht_${counter++}`,
      movieId: 'mov_shadow_protocol',
      screenId: 'scr_dolby_2',
      date,
      time: '18:30',
      format: 'Dolby Cinema',
      basePrice: 18.5,
    });
    showtimes.push({
      id: `sht_${counter++}`,
      movieId: 'mov_shadow_protocol',
      screenId: 'scr_dolby_2',
      date,
      time: '21:45',
      format: 'Dolby Cinema',
      basePrice: 18.5,
    });

    // Sunshine Avenue & Crimson Dynasty in Prime Suite 3
    showtimes.push({
      id: `sht_${counter++}`,
      movieId: 'mov_sunshine_avenue',
      screenId: 'scr_prime_3',
      date,
      time: '11:30',
      format: '2D',
      basePrice: 14.0,
    });
    showtimes.push({
      id: `sht_${counter++}`,
      movieId: 'mov_sunshine_avenue',
      screenId: 'scr_prime_3',
      date,
      time: '14:30',
      format: '2D',
      basePrice: 14.0,
    });
    showtimes.push({
      id: `sht_${counter++}`,
      movieId: 'mov_crimson_dynasty',
      screenId: 'scr_prime_3',
      date,
      time: '17:30',
      format: '2D',
      basePrice: 16.5,
    });
    showtimes.push({
      id: `sht_${counter++}`,
      movieId: 'mov_crimson_dynasty',
      screenId: 'scr_prime_3',
      date,
      time: '20:45',
      format: '2D',
      basePrice: 16.5,
    });
  });

  return showtimes;
}

export function generateSeedReservations(showtimes: Showtime[]): Reservation[] {
  const today = getRelativeDateString(0);
  const targetShowtime1 = showtimes.find(s => s.movieId === 'mov_interstellar_odyssey' && s.date === today && s.time === '17:45') || showtimes[1];
  const targetShowtime2 = showtimes.find(s => s.movieId === 'mov_shadow_protocol' && s.date === today && s.time === '18:30') || showtimes[4];
  const targetShowtime3 = showtimes.find(s => s.movieId === 'mov_sunshine_avenue' && s.date === today && s.time === '14:30') || showtimes[7];

  return [
    {
      id: 'res_seed_001',
      bookingCode: 'CV-84912',
      userId: 'usr_user_001',
      userEmail: 'alex@cineverse.com',
      userName: 'Alex Mercer',
      showtimeId: targetShowtime1.id,
      movieId: 'mov_interstellar_odyssey',
      movieTitle: 'Interstellar Odyssey',
      moviePoster: '/src/assets/images/poster_interstellar_odyssey_1793206434678.jpg',
      screenId: 'scr_imax_1',
      screenName: 'Grand Theater 1',
      date: targetShowtime1.date,
      time: targetShowtime1.time,
      seats: [
        { id: 'E6', row: 'E', number: 6, tier: 'vip', price: 25.0 },
        { id: 'E7', row: 'E', number: 7, tier: 'vip', price: 25.0 },
      ],
      concessions: [
        { itemId: 'cnc_popcorn_truffle', name: 'Artisan Truffle Butter Popcorn', quantity: 1, price: 9.5 },
        { itemId: 'cnc_drink_craft_soda', name: 'Craft Fountain Soda (Large)', quantity: 2, price: 5.5 },
      ],
      totalAmount: 70.5,
      status: 'confirmed',
      createdAt: '2026-10-27T18:30:00.000Z',
    },
    {
      id: 'res_seed_002',
      bookingCode: 'CV-62819',
      userId: 'usr_user_002',
      userEmail: 'maya@cineverse.com',
      userName: 'Maya Chen',
      showtimeId: targetShowtime2.id,
      movieId: 'mov_shadow_protocol',
      movieTitle: 'Shadow Protocol',
      moviePoster: '/src/assets/images/poster_shadow_protocol_1793206435854.jpg',
      screenId: 'scr_dolby_2',
      screenName: 'Dolby Cinema 2',
      date: targetShowtime2.date,
      time: targetShowtime2.time,
      seats: [
        { id: 'D5', row: 'D', number: 5, tier: 'vip', price: 22.5 },
        { id: 'D6', row: 'D', number: 6, tier: 'vip', price: 22.5 },
        { id: 'D7', row: 'D', number: 7, tier: 'vip', price: 22.5 },
      ],
      concessions: [
        { itemId: 'cnc_combo_cinema', name: 'Cinema Premiere Combo', quantity: 1, price: 18.0 },
      ],
      totalAmount: 85.5,
      status: 'confirmed',
      createdAt: '2026-10-28T09:10:00.000Z',
    },
    {
      id: 'res_seed_003',
      bookingCode: 'CV-39201',
      userId: 'usr_user_001',
      userEmail: 'alex@cineverse.com',
      userName: 'Alex Mercer',
      showtimeId: targetShowtime3.id,
      movieId: 'mov_sunshine_avenue',
      movieTitle: 'Sunshine Avenue',
      moviePoster: '/src/assets/images/poster_sunshine_avenue_1793206435746.jpg',
      screenId: 'scr_prime_3',
      screenName: 'Prime Suite 3',
      date: targetShowtime3.date,
      time: targetShowtime3.time,
      seats: [
        { id: 'C3', row: 'C', number: 3, tier: 'standard', price: 14.0 },
        { id: 'C4', row: 'C', number: 4, tier: 'standard', price: 14.0 },
      ],
      concessions: [],
      totalAmount: 28.0,
      status: 'confirmed',
      createdAt: '2026-10-28T08:00:00.000Z',
    },
  ];
}

export function generateSeedReviews(): MovieReview[] {
  return [
    {
      id: 'rev_seed_001',
      movieId: 'mov_interstellar_odyssey',
      reservationId: 'res_seed_001',
      userId: 'usr_user_001',
      userName: 'Alex Mercer',
      rating: 5,
      comment: 'Unbelievable IMAX visual mastery. The cosmic scale and sound design in Grand Theater 1 shook the room in the best way possible!',
      createdAt: '2026-10-28T09:00:00.000Z',
    },
    {
      id: 'rev_seed_002',
      movieId: 'mov_shadow_protocol',
      reservationId: 'res_seed_002',
      userId: 'usr_user_002',
      userName: 'Maya Chen',
      rating: 4,
      comment: 'Sleek cyberpunk atmosphere and pulse-pounding action pacing. The Dolby Cinema audio mix made the rain-slicked city scenes feel completely real.',
      createdAt: '2026-10-28T09:20:00.000Z',
    },
    {
      id: 'rev_seed_003',
      movieId: 'mov_sunshine_avenue',
      reservationId: 'res_seed_003',
      userId: 'usr_user_001',
      userName: 'Alex Mercer',
      rating: 5,
      comment: 'Heartwarming, hilarious, and wonderfully animated. Every character had charm—perfect movie to watch with family on the weekend!',
      createdAt: '2026-10-28T09:40:00.000Z',
    },
  ];
}

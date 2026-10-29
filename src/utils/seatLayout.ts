import { Screen, Seat, SeatTier } from '../types';

export function generateSeatsForScreen(screen: Screen, basePrice: number): Seat[] {
  const seats: Seat[] = [];
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];

  for (let r = 0; r < screen.totalRows; r++) {
    const rowChar = rowLetters[r] || String.fromCharCode(65 + r);
    for (let s = 1; s <= screen.seatsPerRow; s++) {
      let tier: SeatTier = 'standard';
      let price = basePrice;
      let isAccessible = false;

      // Front row ends: Wheelchair accessible
      if (r === 0 && (s === 1 || s === screen.seatsPerRow)) {
        isAccessible = true;
      }

      // Middle rows: VIP / Prime View
      if (screen.totalRows >= 6 && r >= 3 && r <= 5) {
        tier = 'vip';
        price = Math.round((basePrice + 4) * 10) / 10;
      }
      // Back rows: Recliner luxury
      else if (screen.totalRows >= 6 && r >= 6) {
        tier = 'recliner';
        price = Math.round((basePrice + 7) * 10) / 10;
      } else {
        tier = 'standard';
        price = basePrice;
      }

      seats.push({
        id: `${rowChar}${s}`,
        row: rowChar,
        number: s,
        tier,
        price,
        isAccessible,
      });
    }
  }

  return seats;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

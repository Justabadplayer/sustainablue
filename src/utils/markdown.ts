import { FoodType, ActiveFoodListing } from '../types';

export const BASE_HOURS_MAP: Record<FoodType, number> = {
  'Hot prepared meal': 3,
  'Bakery or pastry': 6,
  'Chilled prepared food': 10,
  'Other': 8,
};

export function calculateGrossMargin(price: number, unitCost: number): number {
  if (price <= 0) {
    return unitCost === 0 ? 0 : -100;
  }
  return ((price - unitCost) / price) * 100;
}

export function calculateEffectiveTimeToMinimumMs(
  foodType: FoodType,
  startingPrice: number,
  unitCost: number
): number {
  const baseHours = BASE_HOURS_MAP[foodType] ?? 8;
  const baseTimeMs = baseHours * 3600 * 1000;
  const startingMargin = calculateGrossMargin(startingPrice, unitCost);
  const m = Math.max(0, Math.min(1, startingMargin / 100));
  const effectiveMultiplier = 1.25 - 0.5 * m;
  return baseTimeMs * effectiveMultiplier;
}

export function calculateCurrentPrice(
  listing: ActiveFoodListing,
  simulatedNow: number
): {
  currentPrice: number;
  currentMargin: number;
  isBelowCost: boolean;
  t: number;
  remainingMs: number;
} {
  const elapsed = simulatedNow - listing.addedAtSimulatedTime;
  const effectiveTime = listing.effectiveTimeToMinimumMs;

  let t = 0;
  if (elapsed <= 0) {
    t = 0;
  } else if (effectiveTime <= 0) {
    t = 1;
  } else {
    t = Math.max(0, Math.min(1, elapsed / effectiveTime));
  }

  let price: number;
  if (t >= 1) {
    price = listing.minimumPrice;
  } else {
    const rawDiscount = (listing.startingPrice - listing.minimumPrice) * (t * t);
    // Round the discount to five-centavo steps from the starting price.
    const discountSteps = Math.round(rawDiscount * 20);
    price = (Math.round(listing.startingPrice * 100) - discountSteps * 5) / 100;
    if (price < listing.minimumPrice) {
      price = listing.minimumPrice;
    }
  }

  const currentMargin = calculateGrossMargin(price, listing.unitCost);
  const isBelowCost = price < listing.unitCost;
  const remainingMs = Math.max(0, effectiveTime - Math.max(0, elapsed));

  return {
    currentPrice: price,
    currentMargin,
    isBelowCost,
    t,
    remainingMs,
  };
}

export function formatPesos(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}₱${abs}`;
}

export function formatSimulatedDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function formatDurationHoursMinutes(ms: number): string {
  if (ms <= 0) return '0m';
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

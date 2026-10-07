import { VehicleType } from '@prisma/client';
import { config } from '../config';

export interface FareCalculationResult {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  subtotal: number;
  multiplier: number;
  estimatedFare: number;
  distanceKm: number;
  durationMin: number;
}

export function calculateEstimatedFare(
  pickup: string,
  destination: string,
  rideType: VehicleType = VehicleType.SEDAN,
  distanceOverride?: number
): FareCalculationResult {
  // Estimate distance and time deterministically based on locations if not explicitly passed
  let distanceKm = distanceOverride || 12.5;
  
  // Specific known demo routes for realistic values
  const text = `${pickup.toLowerCase()} -> ${destination.toLowerCase()}`;
  if (text.includes('srm') && text.includes('airport')) {
    distanceKm = 24.8;
  } else if (text.includes('srm') && (text.includes('tambaram') || text.includes('station'))) {
    distanceKm = 14.2;
  } else if (text.includes('srm') && (text.includes('tech park') || text.includes('campus'))) {
    distanceKm = 3.5;
  }

  // Calculate duration roughly assuming 30 km/h average city speed
  const durationMin = Math.max(5, Math.round((distanceKm / 30) * 60));

  const { baseFare, perKmRate, perMinuteRate, multipliers } = config.fareConfig;
  const multiplier = multipliers[rideType] || 1.0;

  const distanceFare = Math.round(distanceKm * perKmRate);
  const timeFare = Math.round(durationMin * perMinuteRate);
  const subtotal = baseFare + distanceFare + timeFare;
  const estimatedFare = Math.round(subtotal * multiplier);

  return {
    baseFare,
    distanceFare,
    timeFare,
    subtotal,
    multiplier,
    estimatedFare,
    distanceKm: parseFloat(distanceKm.toFixed(1)),
    durationMin,
  };
}

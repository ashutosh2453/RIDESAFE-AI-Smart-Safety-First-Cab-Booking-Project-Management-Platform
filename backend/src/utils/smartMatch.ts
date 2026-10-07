import { Driver, Vehicle, VehicleType, DriverStatus } from '@prisma/client';

export interface DriverWithVehicle extends Driver {
  vehicle: Vehicle | null;
}

export interface SmartMatchCandidate {
  driver: DriverWithVehicle;
  distanceKm: number;
  etaMin: number;
  rating: number;
  vehicle: Vehicle | null;
  smartMatchScore: number;
  isRecommended: boolean;
  scoreBreakdown: {
    distanceScore: number;
    etaScore: number;
    ratingScore: number;
    availabilityScore: number;
    vehicleScore: number;
  };
}

export function computeSmartMatch(
  drivers: DriverWithVehicle[],
  requestedType: VehicleType = VehicleType.SEDAN
): SmartMatchCandidate[] {
  const candidates: SmartMatchCandidate[] = drivers.map((driver, index) => {
    // Generate deterministic simulated proximity for demo drivers
    const simulatedDistances = [1.2, 2.1, 3.8, 1.5, 4.2, 0.9];
    const distanceKm = simulatedDistances[index % simulatedDistances.length];
    const etaMin = Math.max(2, Math.round(distanceKm * 2.5 + (index % 3)));

    // 1. Distance Score (30%)
    // 0km -> 100, 5km -> 50, >10km -> 10
    const distanceScore = Math.max(10, Math.min(100, Math.round(100 - distanceKm * 10)));

    // 2. ETA Score (25%)
    // 2 min -> 100, 10 min -> 40
    const etaScore = Math.max(10, Math.min(100, Math.round(100 - etaMin * 7)));

    // 3. Rating Score (20%)
    // (driver.rating / 5.0) * 100
    const ratingScore = Math.round((driver.rating / 5.0) * 100);

    // 4. Availability Score (15%)
    let availabilityScore = 0;
    if (driver.status === DriverStatus.AVAILABLE) availabilityScore = 100;
    else if (driver.status === DriverStatus.ON_RIDE) availabilityScore = 30;
    else availabilityScore = 0;

    // 5. Vehicle Suitability (10%)
    let vehicleScore = 60;
    if (driver.vehicle?.type === requestedType) {
      vehicleScore = 100;
    } else if (driver.vehicle) {
      vehicleScore = 70;
    }

    // Weighted composite score
    const weightedTotal =
      distanceScore * 0.3 +
      etaScore * 0.25 +
      ratingScore * 0.2 +
      availabilityScore * 0.15 +
      vehicleScore * 0.1;

    const smartMatchScore = Math.round(weightedTotal);

    return {
      driver,
      distanceKm: parseFloat(distanceKm.toFixed(1)),
      etaMin,
      rating: driver.rating,
      vehicle: driver.vehicle,
      smartMatchScore,
      isRecommended: false,
      scoreBreakdown: {
        distanceScore,
        etaScore,
        ratingScore,
        availabilityScore,
        vehicleScore,
      },
    };
  });

  // Sort by highest score first, filtering offline if possible
  candidates.sort((a, b) => b.smartMatchScore - a.smartMatchScore);

  if (candidates.length > 0) {
    candidates[0].isRecommended = true;
  }

  return candidates;
}

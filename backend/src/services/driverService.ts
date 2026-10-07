import { VehicleType, DriverStatus } from '@prisma/client';
import { prisma } from '../config/db';
import { computeSmartMatch, DriverWithVehicle } from '../utils/smartMatch';
import { calculateEstimatedFare } from '../utils/fare';

export class DriverService {
  static async listDrivers(status?: DriverStatus) {
    return prisma.driver.findMany({
      where: status ? { status } : undefined,
      include: {
        vehicle: true,
      },
      orderBy: [{ rating: 'desc' }, { totalRides: 'desc' }],
    });
  }

  static async getDriverById(driverId: string) {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        vehicle: true,
        ratings: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!driver) {
      const error: any = new Error('Driver not found.');
      error.statusCode = 404;
      error.code = 'DRIVER_NOT_FOUND';
      throw error;
    }

    return driver;
  }

  static async runSmartMatch(pickup: string, destination: string, rideType: VehicleType = VehicleType.SEDAN) {
    // 1. Calculate fare estimate
    const fareDetails = calculateEstimatedFare(pickup, destination, rideType);

    // 2. Fetch all drivers with vehicles
    const drivers = (await prisma.driver.findMany({
      include: { vehicle: true },
    })) as DriverWithVehicle[];

    // 3. Compute SmartMatch scores
    const candidates = computeSmartMatch(drivers, rideType);
    const recommended = candidates.find((c) => c.isRecommended) || candidates[0];

    return {
      fareDetails,
      recommendedDriver: recommended,
      candidates,
    };
  }
}

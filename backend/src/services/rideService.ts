import crypto from 'crypto';
import { RideStatus, VehicleType, Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { calculateEstimatedFare } from '../utils/fare';
import { DriverService } from './driverService';

export class RideService {
  static async bookRide(
    userId: string,
    data: {
      pickup: string;
      destination: string;
      landmark?: string | null;
      rideType?: VehicleType;
      driverId?: string | null;
    }
  ) {
    const rideType = data.rideType || VehicleType.SEDAN;
    const fare = calculateEstimatedFare(data.pickup, data.destination, rideType);

    // Pick driver: specified driver or top recommended driver via SmartMatch
    let chosenDriverId = data.driverId;
    if (!chosenDriverId) {
      const match = await DriverService.runSmartMatch(data.pickup, data.destination, rideType);
      chosenDriverId = match.recommendedDriver?.driver.id;
    }

    // Generate secure 4-digit PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const ride = await prisma.ride.create({
      data: {
        userId,
        driverId: chosenDriverId,
        pickup: data.pickup.trim(),
        destination: data.destination.trim(),
        landmark: data.landmark?.trim() || null,
        rideType,
        status: chosenDriverId ? RideStatus.DRIVER_ASSIGNED : RideStatus.REQUESTED,
        pin,
        fareEstimate: fare.estimatedFare,
        baseFare: fare.baseFare,
        distanceFare: fare.distanceFare,
        timeFare: fare.timeFare,
        distanceKm: fare.distanceKm,
        durationMin: fare.durationMin,
      },
      include: {
        driver: {
          include: {
            vehicle: true,
          },
        },
      },
    });

    return ride;
  }

  static async listRides(
    userId: string,
    query: {
      status?: RideStatus;
      search?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    const where: Prisma.RideWhereInput = {
      userId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { pickup: { contains: query.search.trim(), mode: 'insensitive' } },
        { destination: { contains: query.search.trim(), mode: 'insensitive' } },
        { driver: { name: { contains: query.search.trim(), mode: 'insensitive' } } },
      ];
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    return prisma.ride.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          include: {
            vehicle: true,
          },
        },
        ratings: true,
        _count: {
          select: {
            safetyEvents: true,
            pickupPhotos: true,
          },
        },
      },
    });
  }

  static async getRideById(userId: string, rideId: string) {
    const ride = await prisma.ride.findFirst({
      where: {
        id: rideId,
        userId,
      },
      include: {
        driver: {
          include: {
            vehicle: true,
          },
        },
        pickupPhotos: {
          orderBy: { createdAt: 'desc' },
        },
        safetyEvents: {
          orderBy: { createdAt: 'desc' },
        },
        ratings: true,
        tripShares: true,
      },
    });

    if (!ride) {
      const error: any = new Error('Ride not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    return ride;
  }

  static async cancelRide(userId: string, rideId: string, reason?: string) {
    const ride = await prisma.ride.findFirst({
      where: { id: rideId, userId },
    });

    if (!ride) {
      const error: any = new Error('Ride not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    if (ride.status === RideStatus.COMPLETED) {
      const error: any = new Error('Cannot cancel a ride that has already been completed.');
      error.statusCode = 400;
      error.code = 'RIDE_ALREADY_COMPLETED';
      throw error;
    }

    if (ride.status === RideStatus.CANCELLED) {
      return ride;
    }

    return prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: {
        driver: {
          include: { vehicle: true },
        },
      },
    });
  }

  static async verifyPin(userId: string, rideId: string, pin: string) {
    const ride = await prisma.ride.findFirst({
      where: { id: rideId, userId },
      include: { driver: { include: { vehicle: true } } },
    });

    if (!ride) {
      const error: any = new Error('Ride not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    if (ride.pin !== pin.trim()) {
      const error: any = new Error('Invalid Ride PIN. Verification failed.');
      error.statusCode = 400;
      error.code = 'INVALID_PIN';
      throw error;
    }

    // Transition ride to STARTED
    return prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.STARTED,
        startedAt: new Date(),
      },
      include: {
        driver: { include: { vehicle: true } },
      },
    });
  }

  static async updateStatus(userId: string, rideId: string, status: RideStatus) {
    const ride = await prisma.ride.findFirst({
      where: { id: rideId, userId },
    });

    if (!ride) {
      const error: any = new Error('Ride not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    // Protect logical state transitions
    if (ride.status === RideStatus.COMPLETED && status !== RideStatus.COMPLETED) {
      const error: any = new Error('Cannot modify status of a completed ride.');
      error.statusCode = 400;
      error.code = 'INVALID_STATUS_TRANSITION';
      throw error;
    }

    const updateData: Prisma.RideUpdateInput = { status };
    if (status === RideStatus.STARTED && !ride.startedAt) {
      updateData.startedAt = new Date();
    } else if (status === RideStatus.COMPLETED && !ride.completedAt) {
      updateData.completedAt = new Date();
    } else if (status === RideStatus.CANCELLED && !ride.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    return prisma.ride.update({
      where: { id: rideId },
      data: updateData,
      include: {
        driver: { include: { vehicle: true } },
      },
    });
  }

  static async completeRide(userId: string, rideId: string) {
    return this.updateStatus(userId, rideId, RideStatus.COMPLETED);
  }

  static async verifyVehicle(userId: string, rideId: string, matches: boolean, notes?: string | null) {
    const ride = await prisma.ride.findFirst({
      where: { id: rideId, userId },
    });

    if (!ride) {
      const error: any = new Error('Ride not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    // Update vehicleMatches status on ride
    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: { vehicleMatches: matches },
      include: { driver: { include: { vehicle: true } } },
    });

    // If report mismatch -> automatically register a SafetyEvent
    if (!matches) {
      await prisma.safetyEvent.create({
        data: {
          userId,
          rideId,
          type: 'VEHICLE_MISMATCH',
          severity: 'HIGH',
          details: notes || 'Passenger reported vehicle plate or model mismatch before boarding.',
          status: 'ACTIVE',
        },
      });
    }

    return updatedRide;
  }

  static async rateRide(userId: string, rideId: string, rating: number, review?: string | null) {
    const ride = await prisma.ride.findFirst({
      where: { id: rideId, userId },
    });

    if (!ride) {
      const error: any = new Error('Ride not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    if (ride.status !== RideStatus.COMPLETED) {
      const error: any = new Error('Only completed rides can be rated.');
      error.statusCode = 400;
      error.code = 'RIDE_NOT_COMPLETED';
      throw error;
    }

    if (!ride.driverId) {
      const error: any = new Error('No driver assigned to this ride.');
      error.statusCode = 400;
      error.code = 'NO_DRIVER_ASSIGNED';
      throw error;
    }

    const existingRating = await prisma.rideRating.findUnique({
      where: { rideId },
    });

    if (existingRating) {
      const error: any = new Error('You have already submitted a rating for this ride.');
      error.statusCode = 400;
      error.code = 'ALREADY_RATED';
      throw error;
    }

    const newRating = await prisma.rideRating.create({
      data: {
        rideId,
        userId,
        driverId: ride.driverId,
        rating,
        review: review?.trim() || null,
      },
    });

    // Update driver aggregate rating and totalRides
    const driverRatings = await prisma.rideRating.findMany({
      where: { driverId: ride.driverId },
      select: { rating: true },
    });

    const totalSum = driverRatings.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = parseFloat((totalSum / driverRatings.length).toFixed(1));

    await prisma.driver.update({
      where: { id: ride.driverId },
      data: {
        rating: avgRating,
        totalRides: { increment: 1 },
      },
    });

    return newRating;
  }
}

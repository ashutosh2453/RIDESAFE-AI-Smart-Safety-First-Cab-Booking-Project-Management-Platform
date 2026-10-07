import path from 'path';
import fs from 'fs';
import { prisma } from '../config/db';

export class PickupService {
  static async uploadPickupPhoto(
    userId: string,
    rideId: string,
    file: Express.Multer.File,
    description?: string | null
  ) {
    // 1. Verify user owns the ride
    const ride = await prisma.ride.findFirst({
      where: { id: rideId, userId },
    });

    if (!ride) {
      // Remove uploaded file if ride is invalid
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      const error: any = new Error('Ride not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    const photoUrl = `/api/uploads/${file.filename}`;

    return prisma.pickupPhoto.create({
      data: {
        rideId,
        userId,
        imageUrl: photoUrl,
        description: description?.trim() || null,
      },
    });
  }

  static async getPickupPhotos(userId: string, rideId: string) {
    const ride = await prisma.ride.findFirst({
      where: { id: rideId, userId },
    });

    if (!ride) {
      const error: any = new Error('Ride not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    return prisma.pickupPhoto.findMany({
      where: { rideId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

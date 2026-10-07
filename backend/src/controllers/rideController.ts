import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { RideService } from '../services/rideService';
import { RideStatus } from '@prisma/client';

export class RideController {
  static async book(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ride = await RideService.bookRide(userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Ride requested successfully',
        data: ride,
      });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { status, search, startDate, endDate } = req.query;
      const rides = await RideService.listRides(userId, {
        status: status as any,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      return res.status(200).json({
        success: true,
        data: rides,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const ride = await RideService.getRideById(userId, id);
      return res.status(200).json({
        success: true,
        data: ride,
      });
    } catch (err) {
      next(err);
    }
  }

  static async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const ride = await RideService.cancelRide(userId, id, req.body?.reason);
      return res.status(200).json({
        success: true,
        message: 'Ride cancelled successfully',
        data: ride,
      });
    } catch (err) {
      next(err);
    }
  }

  static async verifyPin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { pin } = req.body;
      const ride = await RideService.verifyPin(userId, id, pin);
      return res.status(200).json({
        success: true,
        message: 'Ride PIN verified successfully. Ride started.',
        data: ride,
      });
    } catch (err) {
      next(err);
    }
  }

  static async start(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const ride = await RideService.updateStatus(userId, id, RideStatus.STARTED);
      return res.status(200).json({
        success: true,
        message: 'Ride started',
        data: ride,
      });
    } catch (err) {
      next(err);
    }
  }

  static async complete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const ride = await RideService.completeRide(userId, id);
      return res.status(200).json({
        success: true,
        message: 'Ride completed successfully',
        data: ride,
      });
    } catch (err) {
      next(err);
    }
  }

  static async advanceStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { status } = req.body;
      const ride = await RideService.updateStatus(userId, id, status);
      return res.status(200).json({
        success: true,
        message: `Ride status updated to ${status}`,
        data: ride,
      });
    } catch (err) {
      next(err);
    }
  }

  static async verifyVehicle(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { matches, notes } = req.body;
      const ride = await RideService.verifyVehicle(userId, id, matches, notes);
      return res.status(200).json({
        success: true,
        message: matches
          ? 'Vehicle verified successfully'
          : 'Vehicle mismatch reported and logged in Safety Center',
        data: ride,
      });
    } catch (err) {
      next(err);
    }
  }

  static async rateRide(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { rating, review } = req.body;
      const rideRating = await RideService.rateRide(userId, id, rating, review);
      return res.status(201).json({
        success: true,
        message: 'Thank you for your rating!',
        data: rideRating,
      });
    } catch (err) {
      next(err);
    }
  }
}

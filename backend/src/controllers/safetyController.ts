import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { SafetyService } from '../services/safetyService';

export class SafetyController {
  static async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { rideId } = req.query;
      const overview = await SafetyService.getSafetyOverview(userId, rideId as string);
      return res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (err) {
      next(err);
    }
  }

  static async triggerSOS(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id: rideId } = req.params;
      const { details } = req.body;
      const result = await SafetyService.triggerSOS(userId, rideId, details);
      return res.status(200).json({
        success: true,
        message: 'Emergency SOS protocol initiated',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async reportUnsafe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id: rideId } = req.params;
      const { details } = req.body;
      const result = await SafetyService.reportUnsafe(userId, rideId, details);
      return res.status(200).json({
        success: true,
        message: 'Unsafe condition reported and logged',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async checkRouteDeviation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id: rideId } = req.params;
      const { simulatedDeviationMeters } = req.body;
      const result = await SafetyService.checkRouteDeviation(userId, rideId, simulatedDeviationMeters);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // Trusted Contacts Endpoints
  static async listContacts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const contacts = await SafetyService.listContacts(userId);
      return res.status(200).json({
        success: true,
        data: contacts,
      });
    } catch (err) {
      next(err);
    }
  }

  static async createContact(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const contact = await SafetyService.createContact(userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Trusted contact added successfully',
        data: contact,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateContact(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const contact = await SafetyService.updateContact(userId, id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Trusted contact updated',
        data: contact,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteContact(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const result = await SafetyService.deleteContact(userId, id);
      return res.status(200).json({
        success: true,
        message: 'Trusted contact removed',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // Trip Sharing Endpoints
  static async generateTripShare(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id: rideId } = req.params;
      const share = await SafetyService.generateTripShare(userId, rideId);
      return res.status(201).json({
        success: true,
        message: 'Trip sharing link generated successfully',
        data: share,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSharedTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const sharedData = await SafetyService.getSharedTrip(token);
      return res.status(200).json({
        success: true,
        data: sharedData,
      });
    } catch (err) {
      next(err);
    }
  }
}

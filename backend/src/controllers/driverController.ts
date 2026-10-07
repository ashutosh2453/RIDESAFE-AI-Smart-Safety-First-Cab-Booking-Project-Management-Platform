import { Request, Response, NextFunction } from 'express';
import { DriverService } from '../services/driverService';

export class DriverController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const drivers = await DriverService.listDrivers(status as any);
      return res.status(200).json({
        success: true,
        data: drivers,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const driver = await DriverService.getDriverById(id);
      return res.status(200).json({
        success: true,
        data: driver,
      });
    } catch (err) {
      next(err);
    }
  }

  static async runSmartMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { pickup, destination, rideType } = req.body;
      const result = await DriverService.runSmartMatch(pickup, destination, rideType);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

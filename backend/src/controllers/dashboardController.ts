import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { DashboardService } from '../services/dashboardService';

export class DashboardController {
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const stats = await DashboardService.getDashboardStats(userId);
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }
}

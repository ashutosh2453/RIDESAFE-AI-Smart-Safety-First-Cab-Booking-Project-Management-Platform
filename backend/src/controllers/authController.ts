import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(_req: Request, res: Response) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: null,
    });
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
          error: 'UNAUTHORIZED',
        });
      }
      const profile = await AuthService.getProfile(req.user.id);
      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }
}

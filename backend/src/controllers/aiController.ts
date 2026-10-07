import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AiService } from '../services/aiService';

export class AiController {
  static async chat(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { message, sessionId } = req.body;
      const result = await AiService.handleChat(userId, message, sessionId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { sessionId } = req.params;
      const history = await AiService.getChatHistory(userId, sessionId);
      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (err) {
      next(err);
    }
  }
}

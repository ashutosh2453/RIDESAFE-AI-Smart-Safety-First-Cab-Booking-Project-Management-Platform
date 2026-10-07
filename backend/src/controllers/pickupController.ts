import { Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthenticatedRequest } from '../types';
import { PickupService } from '../services/pickupService';
import { config } from '../config';

export class PickupController {
  static async uploadPhoto(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id: rideId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No photo provided for upload.',
          error: 'FILE_REQUIRED',
        });
      }

      const { description } = req.body;
      const photo = await PickupService.uploadPickupPhoto(userId, rideId, file, description);

      return res.status(201).json({
        success: true,
        message: 'Visual Pickup photo uploaded successfully',
        data: photo,
      });
    } catch (err) {
      next(err);
    }
  }

  static async listPhotos(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id: rideId } = req.params;
      const photos = await PickupService.getPickupPhotos(userId, rideId);
      return res.status(200).json({
        success: true,
        data: photos,
      });
    } catch (err) {
      next(err);
    }
  }

  static async serveFile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params;
      // Sanitize filename to prevent directory traversal
      const safeFilename = path.basename(filename);
      const filePath = path.join(path.resolve(config.uploadDir), safeFilename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Requested image not found',
          error: 'IMAGE_NOT_FOUND',
        });
      }

      return res.sendFile(filePath);
    } catch (err) {
      next(err);
    }
  }
}

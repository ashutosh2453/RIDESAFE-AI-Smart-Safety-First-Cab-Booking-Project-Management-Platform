import { Router } from 'express';
import authRoutes from './authRoutes';
import projectRoutes from './projectRoutes';
import taskRoutes from './taskRoutes';
import dashboardRoutes from './dashboardRoutes';
import rideRoutes from './rideRoutes';
import driverRoutes from './driverRoutes';
import contactRoutes from './contactRoutes';
import aiRoutes from './aiRoutes';
import { SafetyController } from '../controllers/safetyController';
import { PickupController } from '../controllers/pickupController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'online',
    ok: true,
    platform: 'RideSafe AI Engine',
    timestamp: new Date().toISOString(),
  });
});

// Primary modules
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/rides', rideRoutes);
router.use('/drivers', driverRoutes);
router.use('/trusted-contacts', contactRoutes);
router.use('/contacts', contactRoutes);
router.use('/ai', aiRoutes);

// Public Trip Sharing
router.get('/shared-trip/:token', SafetyController.getSharedTrip);

// Secure pickup image retrieval
router.get('/uploads/:filename', authenticate, PickupController.serveFile);

export default router;

import { Router } from 'express';
import { RideController } from '../controllers/rideController';
import { PickupController } from '../controllers/pickupController';
import { SafetyController } from '../controllers/safetyController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadPickupPhoto } from '../middleware/upload';
import { sosRateLimiter } from '../middleware/rateLimit';
import {
  bookRideSchema,
  verifyPinSchema,
  verifyVehicleSchema,
  createRideRatingSchema,
  routeCheckSchema,
} from '../validators';

const router = Router();

router.use(authenticate);

// Ride booking & history
router.post('/', validate(bookRideSchema), RideController.book);
router.post('/book', validate(bookRideSchema), RideController.book);
router.get('/', RideController.list);
router.get('/:id', RideController.getById);
router.post('/:id/cancel', RideController.cancel);
router.post('/:id/verify-pin', validate(verifyPinSchema), RideController.verifyPin);
router.post('/:id/start', RideController.start);
router.post('/:id/complete', RideController.complete);
router.post('/:id/status', RideController.advanceStatus);
router.post('/:id/verify-vehicle', validate(verifyVehicleSchema), RideController.verifyVehicle);
router.post('/:id/rating', validate(createRideRatingSchema), RideController.rateRide);

// Visual Pickup Assistance
router.post('/:id/pickup-photo', uploadPickupPhoto.single('photo'), PickupController.uploadPhoto);
router.get('/:id/pickup-photo', PickupController.listPhotos);

// Safety actions scoped to a ride
router.get('/:id/safety', SafetyController.getOverview);
router.post('/:id/sos', sosRateLimiter, SafetyController.triggerSOS);
router.post('/:id/unsafe', SafetyController.reportUnsafe);
router.post('/:id/route-check', validate(routeCheckSchema), SafetyController.checkRouteDeviation);
router.post('/:id/share', SafetyController.generateTripShare);

export default router;

import { Router } from 'express';
import { DriverController } from '../controllers/driverController';
import { validate } from '../middleware/validate';
import { smartMatchQuerySchema } from '../validators';

const router = Router();

router.get('/', DriverController.list);
router.get('/:id', DriverController.getById);
router.post('/smartmatch', validate(smartMatchQuerySchema), DriverController.runSmartMatch);

export default router;

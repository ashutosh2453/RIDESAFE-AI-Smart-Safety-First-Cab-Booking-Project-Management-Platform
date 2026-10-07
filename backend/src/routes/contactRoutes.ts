import { Router } from 'express';
import { SafetyController } from '../controllers/safetyController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTrustedContactSchema, updateTrustedContactSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/', SafetyController.listContacts);
router.post('/', validate(createTrustedContactSchema), SafetyController.createContact);
router.put('/:id', validate(updateTrustedContactSchema), SafetyController.updateContact);
router.delete('/:id', SafetyController.deleteContact);

export default router;

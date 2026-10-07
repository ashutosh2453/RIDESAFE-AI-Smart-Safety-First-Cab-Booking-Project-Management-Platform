import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProjectSchema, updateProjectSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/', ProjectController.list);
router.get('/:id', ProjectController.getById);
router.post('/', validate(createProjectSchema), ProjectController.create);
router.put('/:id', validate(updateProjectSchema), ProjectController.update);
router.delete('/:id', ProjectController.delete);

export default router;

import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/', TaskController.list);
router.get('/:id', TaskController.getById);
router.post('/', validate(createTaskSchema), TaskController.create);
router.put('/:id', validate(updateTaskSchema), TaskController.update);
router.delete('/:id', TaskController.delete);

export default router;

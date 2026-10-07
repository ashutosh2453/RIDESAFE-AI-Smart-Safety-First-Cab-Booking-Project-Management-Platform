import { Router } from 'express';
import { AiController } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { aiRateLimiter } from '../middleware/rateLimit';
import { aiChatSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.post('/chat', aiRateLimiter, validate(aiChatSchema), AiController.chat);
router.get('/history/:sessionId', AiController.getHistory);

export default router;

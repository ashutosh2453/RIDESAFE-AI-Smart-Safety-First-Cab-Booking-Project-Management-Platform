import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimit';
import { registerSchema, loginSchema } from '../validators';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authRateLimiter, validate(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);

export default router;

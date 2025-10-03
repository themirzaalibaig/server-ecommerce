import { signup, login } from '../controllers/auth.controller';
import { loginSchema, signupSchema } from '../validations/auth.validation';
import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';

const router: Router = Router();

router.post('/signup', validate(signupSchema), signup);

router.post('/login', validate(loginSchema), login);

export { router as authRoutes };

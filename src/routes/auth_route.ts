import { Router } from 'express';
import * as authController from '../controllers/auth_controller';

const router = Router();

router.use('/register', authController.register);
router.use('/login', authController.login);
router.use('/logout', authController.logout);

export default router;

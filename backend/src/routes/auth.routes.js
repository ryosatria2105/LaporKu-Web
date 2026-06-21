import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  verifyForgotOtp,
  resetPassword,
} from '../controllers/auth.controller.js';
import { authenticate, loginRateLimiter } from '../middleware/auth.middleware.js';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from '../middleware/validate.middleware.js';

const router = Router();

router.post('/register',          validateRegister,       register);
router.post('/login',             loginRateLimiter, validateLogin, login);
router.post('/forgot-password',   validateForgotPassword, forgotPassword);
router.post('/verify-forgot-otp', verifyForgotOtp);
router.post('/reset-password',    validateResetPassword,  resetPassword);
router.post('/logout',            authenticate,           logout);
router.get('/me',                 authenticate,           getMe);

export default router;
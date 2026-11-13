import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, getCurrentUser } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { forgotPassword, verifyResetCode, resetPassword, updateProfile, verifyEmailChange } from '../controllers/authController.js';

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.patch('/profile', authenticateUser, updateProfile);
router.post('/verify-email-change', authenticateUser, verifyEmailChange);

// Register
router.post('/register',
  body('email').isEmail(),
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Le nom d\'utilisateur doit contenir 3 à 20 caractères')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Seulement lettres, chiffres et _'),
  body('password').isLength({ min: 8 }).withMessage('Mot de passe : 8 caractères minimum'),
  body('fullName').notEmpty().trim(),
  validate,
  register
);

// Login
router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  validate,
  login
);

// Logout
router.post('/logout', logout);

// Get current user (protected route)
router.get('/me', authenticateUser, getCurrentUser);

// THIS LINE IS CRUCIAL:
export default router;
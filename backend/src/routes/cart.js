import express from 'express';
import { getCart, addToCart, removeFromCart } from '../controllers/cartController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateUser, getCart);
router.post('/add', authenticateUser, addToCart);
router.delete('/:itemId', authenticateUser, removeFromCart);

export default router;

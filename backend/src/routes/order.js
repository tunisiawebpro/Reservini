import express from 'express';
import { createOrder, getUserOrders } from '../controllers/orderController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/checkout', authenticateUser, createOrder);
router.get('/', authenticateUser, getUserOrders);

export default router;

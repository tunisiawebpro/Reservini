import express from 'express';
import { getAllProducts, getProductBySlug } from '../controllers/productController.js';

const router = express.Router();

// Get all products
router.get('/', getAllProducts);

// Get product by slug
router.get('/:slug', getProductBySlug);

// THIS LINE IS CRUCIAL:
export default router;
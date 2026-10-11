import express from 'express';
import {
  getAllProducts,
  getProductById,
  getCategories,
} from '../controllers/productController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getAllProducts);
router.get('/categories', optionalAuth, getCategories);
router.get('/:id', optionalAuth, getProductById);

export default router;

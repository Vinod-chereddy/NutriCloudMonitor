import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';
import { createOrder } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.post('/add', protect, addToCart);
router.post('/remove', protect, removeFromCart);
router.delete('/', protect, removeFromCart);
router.delete('/remove', protect, removeFromCart);
router.delete('/:productId', protect, (req, res, next) => {
  req.body.productId = req.params.productId;
  removeFromCart(req, res, next);
});
router.put('/', protect, updateCartItemQuantity);
router.put('/update', protect, updateCartItemQuantity);
router.post('/checkout', protect, createOrder);

export default router;

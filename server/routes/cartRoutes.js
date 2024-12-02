import express from 'express';
import { cartController } from '../controllers/cartController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.get('/', isAuthenticated, cartController.getCart);
router.post('/add', isAuthenticated, cartController.addToCart);
router.post('/checkout', isAuthenticated, cartController.createCheckoutSession);

export default router;
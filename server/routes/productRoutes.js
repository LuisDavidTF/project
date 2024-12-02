import express from 'express';
import { productController } from '../controllers/productController.js';

const router = express.Router();



router.get('/', productController.getHome);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/product/:id', productController.getProduct);
router.get('/products/add',productController.getAddProduct);
router.post(
    '/products/add',
    productController.addProduct
  );
export default router;
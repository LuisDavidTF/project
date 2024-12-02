import { ProductDao } from '../dao/productDao.js';
import multer from 'multer';
import path from 'path';

const productDao = new ProductDao();

const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

export const productController = {
  async getHome(req, res) {
    try {
      const products = await productDao.findAll();
      res.render('home', {
        title: 'Velonia - Home',
        products,
        user: req.session.user
      });
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { error: 'Failed to load products' });
    }
  },

  async getProductsByCategory(req, res) {
    try {
      const { category } = req.params;
      const products = await productDao.findAll(category);
      res.render('products/category', {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Products`,
        products,
        category,
        user: req.session.user
      });
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { error: 'Failed to load products' });
    }
  },

  async getProduct(req, res) {
    try {
      
      const product = await productDao.findById(req.params.id);
      console.log('File:',product.images)
      if (!product) {
        return res.status(404).render('error', { error: 'Product not found' });
      }
      res.render('products/detail', {
        title: product.name,
        product,
        user: req.session.user
      });
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { error: 'Failed to load product' });
    }
  },

  async getAddProduct(req, res) {
    try {
      res.render('products/add', {
        title: 'Add New Product',
        user: req.session.user, // Información del usuario autenticado
        error: null // Sin errores inicialmente
      });
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { error: 'Failed to load the form' });
    }
  },
  addProduct: [
    // Middleware de multer para procesar archivos
    upload.array('images', 5), // Permite hasta 5 imágenes
    async (req, res) => {
    try {
      console.log('Body:', req.body);
      console.log('Files:', req.files); // Asegúrate de que los archivos están siendo procesados

      const { name, description, price, category_id,stock } = req.body;
      const sellerId = req.session.user.id; // ID del vendedor desde la sesión

      const files = req.files;
      // Validar campos obligatorios
      if (!name || !description || !price || !category_id||!files || files.length === 0) {
        return res.render('products/add', {
          title: 'Add New Product',
          user: req.session.user,
          error: 'All fields are required'+imagePromises
        });
      }
  
      // Crear el producto
      const productId = await productDao.create(
        { name, description, price, stock, category_id },
        sellerId
      );
  
      // Manejar imágenes si están presentes
      for (let i = 0; i < files.length; i++) {
        const isPrimary = (i === 0) ? 1 : 0; // La primera imagen será la principal
        await productDao.addImage({
          product_id: productId,
          image_url: `/uploads/${files[i].filename}`,
          is_primary: isPrimary,
        });
      }
  
      // Manejar tallas seleccionadas
      
  
      // Redirigir al detalle del producto
      res.redirect(`/product/${productId}`);
    } catch (error) {
      console.error(error);
      res.status(500).render('products/add', {
        title: 'Add New Product',
        user: req.session.user,
        error: 'Failed to add product. Please try again.'
      });
    }
    },
  ],
};
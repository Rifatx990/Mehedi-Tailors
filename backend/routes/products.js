const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/categories/all', productController.getCategories);

// Admin only routes
router.post('/', authMiddleware(['admin']), productController.createProduct);
router.put('/:id', authMiddleware(['admin']), productController.updateProduct);
router.delete('/:id', authMiddleware(['admin']), productController.deleteProduct);

module.exports = router;

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const { validate, orderValidation } = require('../middleware/validation');

// Customer routes
router.get('/', authMiddleware(['customer', 'admin']), orderController.getUserOrders);
router.get('/:id', authMiddleware(['customer', 'admin']), orderController.getOrderById);
router.post('/', authMiddleware(['customer']), validate(orderValidation), orderController.createOrder);
router.post('/custom', authMiddleware(['customer']), orderController.createCustomOrder);

// Admin routes
router.put('/:id/status', authMiddleware(['admin']), orderController.updateOrderStatus);

module.exports = router;

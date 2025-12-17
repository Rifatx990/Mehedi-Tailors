const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { validate, registerValidation, loginValidation } = require('../middleware/validation');

// Public routes
router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);

// Protected routes
router.get('/profile', authMiddleware(['customer', 'admin', 'worker']), authController.getProfile);
router.put('/profile', authMiddleware(['customer', 'admin', 'worker']), authController.updateProfile);

module.exports = router;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { name, email, password, phone, address } = req.body;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Insert user
      const query = `
        INSERT INTO users (name, email, password_hash, phone, address, role)
        VALUES ($1, $2, $3, $4, $5, 'customer')
        RETURNING id, name, email, role
      `;
      
      const { rows } = await pool.query(query, [name, email, passwordHash, phone, address]);
      const user = rows[0];

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const query = 'SELECT id, name, email, password_hash, role FROM users WHERE email = $1';
      const { rows } = await pool.query(query, [email]);
      
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = rows[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Remove password_hash from response
      delete user.password_hash;

      res.json({
        success: true,
        message: 'Login successful',
        user,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const query = `
        SELECT id, name, email, phone, address, role, created_at
        FROM users WHERE id = $1
      `;
      const { rows } = await pool.query(query, [req.userId]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, user: rows[0] });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  },

  // Update profile
  updateProfile: async (req, res) => {
    try {
      const { name, phone, address } = req.body;
      
      const query = `
        UPDATE users 
        SET name = COALESCE($1, name),
            phone = COALESCE($2, phone),
            address = COALESCE($3, address),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id, name, email, phone, address, role
      `;
      
      const { rows } = await pool.query(query, [name, phone, address, req.userId]);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: rows[0]
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
};

module.exports = authController;

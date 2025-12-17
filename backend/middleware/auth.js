const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No authentication token, access denied' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user exists
      const userQuery = 'SELECT id, name, email, role FROM users WHERE id = $1';
      const { rows } = await pool.query(userQuery, [decoded.userId]);
      
      if (rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      const user = rows[0];

      // Check role permission
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // Add user to request
      req.user = user;
      req.userId = user.id;
      
      // Log activity for admin actions
      if (user.role === 'admin') {
        const logQuery = `
          INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent)
          VALUES ($1, $2, $3, $4, $5)
        `;
        await pool.query(logQuery, [
          user.id,
          req.method + ' ' + req.originalUrl,
          `Accessed ${req.originalUrl}`,
          req.ip,
          req.get('User-Agent')
        ]);
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ error: 'Token is invalid' });
    }
  };
};

module.exports = authMiddleware;

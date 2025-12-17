const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');

// All admin routes require admin role
router.use(authMiddleware(['admin']));

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    // Get today's date
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    // Get stats from database
    const [
      totalSales,
      totalOrders,
      totalCustomers,
      totalProducts,
      todaySales,
      pendingOrders
    ] = await Promise.all([
      // Total sales
      pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders'),
      
      // Total orders
      pool.query('SELECT COUNT(*) as count FROM orders'),
      
      // Total customers
      pool.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['customer']),
      
      // Total products
      pool.query('SELECT COUNT(*) as count FROM products WHERE status = $1', ['active']),
      
      // Today's sales
      pool.query(
        'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE created_at >= $1 AND created_at <= $2',
        [todayStart, todayEnd]
      ),
      
      // Pending orders
      pool.query('SELECT COUNT(*) as count FROM orders WHERE status = $1', ['pending'])
    ]);

    res.json({
      success: true,
      stats: {
        totalSales: parseFloat(totalSales.rows[0].total) || 0,
        totalOrders: parseInt(totalOrders.rows[0].count) || 0,
        totalCustomers: parseInt(totalCustomers.rows[0].count) || 0,
        totalProducts: parseInt(totalProducts.rows[0].count) || 0,
        todaySales: parseFloat(todaySales.rows[0].total) || 0,
        pendingOrders: parseInt(pendingOrders.rows[0].count) || 0
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get recent orders
router.get('/orders/recent', async (req, res) => {
  try {
    const query = `
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `;
    
    const { rows } = await pool.query(query);
    
    res.json({ success: true, orders: rows });
  } catch (error) {
    console.error('Recent orders error:', error);
    res.status(500).json({ error: 'Failed to fetch recent orders' });
  }
});

// Get sales chart data
router.get('/reports/sales', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    let groupBy = '';
    
    switch (period) {
      case 'day':
        dateFilter = "DATE_TRUNC('day', created_at)";
        groupBy = "DATE_TRUNC('day', created_at)";
        break;
      case 'week':
        dateFilter = "DATE_TRUNC('week', created_at)";
        groupBy = "DATE_TRUNC('week', created_at)";
        break;
      case 'year':
        dateFilter = "DATE_TRUNC('year', created_at)";
        groupBy = "DATE_TRUNC('year', created_at)";
        break;
      default: // month
        dateFilter = "DATE_TRUNC('month', created_at)";
        groupBy = "DATE_TRUNC('month', created_at)";
    }
    
    const query = `
      SELECT 
        ${dateFilter} as date,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as total_sales
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 year'
      GROUP BY ${groupBy}
      ORDER BY date
    `;
    
    const { rows } = await pool.query(query);
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'Failed to fetch sales report' });
  }
});

// Get all customers
router.get('/customers', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, name, email, phone, address, created_at
      FROM users 
      WHERE role = 'customer'
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);
    
    const { rows } = await pool.query(query, params);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM users 
      WHERE role = 'customer'
      ${search ? `AND (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)` : ''}
    `;
    
    const countParams = search ? [`%${search}%`] : [];
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      success: true,
      customers: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

module.exports = router;

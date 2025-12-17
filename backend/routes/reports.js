const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');

// All report routes require admin role
router.use(authMiddleware(['admin']));

// Get sales report with filters
router.get('/sales', async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      category,
      product_id,
      customer_id,
      status
    } = req.query;

    let query = `
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        json_agg(
          json_build_object(
            'product_name', p.name,
            'quantity', oi.quantity,
            'price', oi.price,
            'total', oi.quantity * oi.price
          )
        ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Apply filters
    if (start_date) {
      query += ` AND o.created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND o.created_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    if (customer_id) {
      query += ` AND o.user_id = $${paramCount}`;
      params.push(customer_id);
      paramCount++;
    }

    if (status) {
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` GROUP BY o.id, u.id ORDER BY o.created_at DESC`;

    const { rows } = await pool.query(query, params);

    res.json({
      success: true,
      orders: rows,
      summary: {
        totalOrders: rows.length,
        totalSales: rows.reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
        averageOrder: rows.length > 0 ? 
          rows.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) / rows.length : 0
      }
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

// Get payment report
router.get('/payments', async (req, res) => {
  try {
    const { start_date, end_date, user_id } = req.query;

    let query = `
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        o.order_number
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN orders o ON t.order_id = o.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (start_date) {
      query += ` AND t.created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND t.created_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    if (user_id) {
      query += ` AND t.user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }

    query += ` ORDER BY t.created_at DESC`;

    const { rows } = await pool.query(query, params);

    res.json({
      success: true,
      transactions: rows,
      summary: {
        totalTransactions: rows.length,
        totalAmount: rows.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      }
    });
  } catch (error) {
    console.error('Payment report error:', error);
    res.status(500).json({ error: 'Failed to generate payment report' });
  }
});

// Get inventory report
router.get('/inventory', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        CASE 
          WHEN p.stock = 0 THEN 'Out of Stock'
          WHEN p.stock <= 10 THEN 'Low Stock'
          ELSE 'In Stock'
        END as stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active'
      ORDER BY p.stock ASC
    `;

    const { rows } = await pool.query(query);

    const summary = {
      totalProducts: rows.length,
      outOfStock: rows.filter(p => p.stock === 0).length,
      lowStock: rows.filter(p => p.stock > 0 && p.stock <= 10).length,
      inStock: rows.filter(p => p.stock > 10).length,
      totalStockValue: rows.reduce((sum, p) => sum + (p.price * p.stock), 0)
    };

    res.json({
      success: true,
      products: rows,
      summary
    });
  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({ error: 'Failed to generate inventory report' });
  }
});

// Get worker performance report
router.get('/workers', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        w.*,
        COUNT(DISTINCT a.order_id) as assigned_orders,
        COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.order_id END) as completed_orders,
        AVG(CASE WHEN a.status = 'completed' THEN a.progress END) as avg_progress
      FROM workers w
      LEFT JOIN assignments a ON w.id = a.worker_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (start_date) {
      query += ` AND a.assigned_date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND a.assigned_date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += ` GROUP BY w.id ORDER BY w.created_at DESC`;

    const { rows } = await pool.query(query, params);

    res.json({
      success: true,
      workers: rows
    });
  } catch (error) {
    console.error('Worker report error:', error);
    res.status(500).json({ error: 'Failed to generate worker report' });
  }
});

module.exports = router;

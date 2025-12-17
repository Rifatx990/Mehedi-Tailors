const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');

// All worker routes require admin role
router.use(authMiddleware(['admin']));

// Get all workers
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT w.*, u.email, u.phone
      FROM workers w
      LEFT JOIN users u ON w.user_id = u.id
      ORDER BY w.created_at DESC
    `;
    
    const { rows } = await pool.query(query);
    
    res.json({ success: true, workers: rows });
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// Create new worker
router.post('/', async (req, res) => {
  try {
    const {
      name,
      role,
      salary_type,
      salary_amount,
      phone,
      address,
      email,
      password
    } = req.body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create user account for worker
      let userId = null;
      
      if (email && password) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const userQuery = `
          INSERT INTO users (name, email, password_hash, phone, address, role)
          VALUES ($1, $2, $3, $4, $5, 'worker')
          RETURNING id
        `;
        
        const userResult = await client.query(userQuery, [
          name,
          email,
          passwordHash,
          phone,
          address
        ]);
        
        userId = userResult.rows[0].id;
      }

      // Create worker record
      const workerQuery = `
        INSERT INTO workers (
          user_id, name, role, salary_type, salary_amount,
          phone, address, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
        RETURNING *
      `;

      const { rows } = await client.query(workerQuery, [
        userId,
        name,
        role,
        salary_type || 'fixed',
        salary_amount,
        phone,
        address
      ]);

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Worker created successfully',
        worker: rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create worker error:', error);
    res.status(500).json({ error: 'Failed to create worker' });
  }
});

// Update worker
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    
    const query = `
      UPDATE workers 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json({
      success: true,
      message: 'Worker updated successfully',
      worker: rows[0]
    });
  } catch (error) {
    console.error('Update worker error:', error);
    res.status(500).json({ error: 'Failed to update worker' });
  }
});

// Delete worker
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM workers WHERE id = $1 RETURNING id';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json({
      success: true,
      message: 'Worker deleted successfully'
    });
  } catch (error) {
    console.error('Delete worker error:', error);
    res.status(500).json({ error: 'Failed to delete worker' });
  }
});

// Get worker assignments
router.get('/:id/assignments', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT a.*, o.order_number, o.total_amount, o.status as order_status,
             c.name as customer_name
      FROM assignments a
      LEFT JOIN orders o ON a.order_id = o.id
      LEFT JOIN users c ON o.user_id = c.id
      WHERE a.worker_id = $1
      ORDER BY a.created_at DESC
    `;
    
    const { rows } = await pool.query(query, [id]);
    
    res.json({ success: true, assignments: rows });
  } catch (error) {
    console.error('Get worker assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

module.exports = router;

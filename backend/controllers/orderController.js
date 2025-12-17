const pool = require('../config/database');
// REMOVE THIS LINE: const { v4: uuidv4 } = require('uuid');

const orderController = {
  // Create new order
  createOrder: async (req, res) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { 
        items, 
        delivery_address, 
        notes, 
        delivery_date,
        payment_method = 'cod'
      } = req.body;
      
      const userId = req.userId;
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Calculate total amount
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const productQuery = 'SELECT price, discount_price, stock FROM products WHERE id = $1';
        const productResult = await client.query(productQuery, [item.product_id]);
        
        if (productResult.rows.length === 0) {
          throw new Error(`Product ${item.product_id} not found`);
        }

        if (productResult.rows[0].stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.product_id}`);
        }

        const price = productResult.rows[0].discount_price || productResult.rows[0].price;
        const itemTotal = price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price,
          size: item.size,
          color: item.color,
          fabric: item.fabric
        });

        // Update stock
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // Create order
      const orderQuery = `
        INSERT INTO orders (
          user_id, order_number, total_amount, delivery_address,
          notes, delivery_date, payment_method
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const orderResult = await client.query(orderQuery, [
        userId,
        orderNumber,
        totalAmount,
        delivery_address,
        notes,
        delivery_date,
        payment_method
      ]);

      const order = orderResult.rows[0];

      // Create order items
      for (const item of orderItems) {
        await client.query(
          `INSERT INTO order_items 
           (order_id, product_id, quantity, price, size, color, fabric)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [order.id, item.product_id, item.quantity, item.price, item.size, item.color, item.fabric]
        );
      }

      // Create transaction record
      await client.query(
        `INSERT INTO transactions (order_id, user_id, type, amount, payment_method)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, userId, 'payment', totalAmount, payment_method]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order,
        order_number: orderNumber
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Create order error:', error);
      res.status(400).json({ 
        error: 'Failed to create order',
        message: error.message 
      });
    } finally {
      client.release();
    }
  },

  // Get user orders
  getUserOrders: async (req, res) => {
    try {
      const { status } = req.query;
      const userId = req.userId;

      let query = `
        SELECT o.*, 
               COUNT(oi.id) as item_count,
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'product_id', oi.product_id,
                   'quantity', oi.quantity,
                   'price', oi.price,
                   'size', oi.size,
                   'color', oi.color,
                   'fabric', oi.fabric,
                   'product_name', p.name,
                   'product_image', p.images[1]
                 )
               ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = $1
      `;
      
      const params = [userId];

      if (status) {
        query += ` AND o.status = $2`;
        params.push(status);
      }

      query += ` GROUP BY o.id ORDER BY o.created_at DESC`;

      const { rows } = await pool.query(query, params);

      res.json({ success: true, orders: rows });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  },

  // Get single order details
  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      // Check if user owns the order or is admin
      let query = `
        SELECT o.*, 
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'product_id', oi.product_id,
                   'quantity', oi.quantity,
                   'price', oi.price,
                   'size', oi.size,
                   'color', oi.color,
                   'fabric', oi.fabric,
                   'product_name', p.name,
                   'product_images', p.images
                 )
               ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.id = $1 AND (o.user_id = $2 OR $3 = 'admin')
        GROUP BY o.id
      `;

      const { rows } = await pool.query(query, [id, userId, req.user.role]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({ success: true, order: rows[0] });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  },

  // Create custom tailoring order
  createCustomOrder: async (req, res) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const {
        garment_type,
        measurements,
        notes,
        delivery_date,
        fabric_preference,
        design_description,
        estimated_price
      } = req.body;

      const userId = req.userId;
      const orderNumber = `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create custom order
      const orderQuery = `
        INSERT INTO orders (
          user_id, order_number, total_amount, order_type,
          notes, delivery_date, status
        )
        VALUES ($1, $2, $3, 'custom', $4, $5, 'pending')
        RETURNING *
      `;

      const orderResult = await client.query(orderQuery, [
        userId,
        orderNumber,
        estimated_price || 0,
        notes,
        delivery_date
      ]);

      const order = orderResult.rows[0];

      // Save measurements
      await client.query(
        `INSERT INTO measurements (user_id, order_id, garment_type, measurements, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, order.id, garment_type, JSON.stringify(measurements), notes]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Custom order created successfully',
        order,
        order_number: orderNumber
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Create custom order error:', error);
      res.status(400).json({ 
        error: 'Failed to create custom order',
        message: error.message 
      });
    } finally {
      client.release();
    }
  },

  // Update order status (admin only)
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, payment_status } = req.body;

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (status) {
        updates.push(`status = $${paramCount}`);
        values.push(status);
        paramCount++;
      }

      if (payment_status) {
        updates.push(`payment_status = $${paramCount}`);
        values.push(payment_status);
        paramCount++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      values.push(id);
      
      const query = `
        UPDATE orders 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const { rows } = await pool.query(query, values);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({
        success: true,
        message: 'Order updated successfully',
        order: rows[0]
      });
    } catch (error) {
      console.error('Update order error:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  }
};

module.exports = orderController;

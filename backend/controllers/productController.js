const pool = require('../config/database');

const productController = {
  // Get all products with filters
  getAllProducts: async (req, res) => {
    try {
      const { 
        category, 
        minPrice, 
        maxPrice, 
        size, 
        color, 
        fabric,
        search,
        page = 1,
        limit = 12
      } = req.query;

      let query = `
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active'
      `;
      const params = [];
      let paramCount = 0;

      // Apply filters
      if (category) {
        paramCount++;
        query += ` AND c.name = $${paramCount}`;
        params.push(category);
      }

      if (minPrice) {
        paramCount++;
        query += ` AND p.price >= $${paramCount}`;
        params.push(minPrice);
      }

      if (maxPrice) {
        paramCount++;
        query += ` AND p.price <= $${paramCount}`;
        params.push(maxPrice);
      }

      if (size) {
        paramCount++;
        query += ` AND $${paramCount} = ANY(p.size)`;
        params.push(size);
      }

      if (color) {
        paramCount++;
        query += ` AND $${paramCount} = ANY(p.color)`;
        params.push(color);
      }

      if (fabric) {
        paramCount++;
        query += ` AND $${paramCount} = ANY(p.fabric)`;
        params.push(fabric);
      }

      if (search) {
        paramCount++;
        query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) FROM (${query}) as filtered`;
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Add pagination
      paramCount++;
      query += ` ORDER BY p.created_at DESC LIMIT $${paramCount}`;
      params.push(parseInt(limit));

      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push((parseInt(page) - 1) * parseInt(limit));

      const { rows } = await pool.query(query, params);

      res.json({
        success: true,
        products: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  },

  // Get single product
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1 AND p.status = 'active'
      `;
      
      const { rows } = await pool.query(query, [id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ success: true, product: rows[0] });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  },

  // Create product (admin only)
  createProduct: async (req, res) => {
    try {
      const {
        name,
        category_id,
        description,
        price,
        discount_price,
        stock,
        size,
        color,
        fabric
      } = req.body;

      // Handle images - assuming images are uploaded and paths are stored
      const images = req.files?.map(file => `/uploads/products/${file.filename}`) || [];

      const query = `
        INSERT INTO products (
          name, category_id, description, price, discount_price,
          stock, images, size, color, fabric
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const { rows } = await pool.query(query, [
        name,
        category_id,
        description,
        price,
        discount_price,
        stock,
        images,
        Array.isArray(size) ? size : [size],
        Array.isArray(color) ? color : [color],
        Array.isArray(fabric) ? fabric : [fabric]
      ]);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: rows[0]
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  },

  // Update product (admin only)
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Build dynamic update query
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
        UPDATE products 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const { rows } = await pool.query(query, values);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
        product: rows[0]
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  },

  // Delete product (admin only)
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;

      const query = 'UPDATE products SET status = $1 WHERE id = $2 RETURNING id';
      const { rows } = await pool.query(query, ['inactive', id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  },

  // Get all categories
  getCategories: async (req, res) => {
    try {
      const query = 'SELECT * FROM categories ORDER BY name';
      const { rows } = await pool.query(query);
      
      res.json({ success: true, categories: rows });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }
};

module.exports = productController;

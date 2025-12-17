const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database seeding...');
    
    // Hash password for admin user
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Insert admin user
    await client.query(`
      INSERT INTO users (name, email, password_hash, phone, role) 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, [
      'Admin User',
      'admin@meheditailors.com',
      passwordHash,
      '+8801712345678',
      'admin'
    ]);
    
    console.log('✅ Admin user created (admin@meheditailors.com / admin123)');
    
    // Insert categories
    const categories = [
      ['Shirts', 'Formal and casual shirts for men', '/images/categories/shirts.jpg'],
      ['Pants', 'Trousers and jeans', '/images/categories/pants.jpg'],
      ['Suits', 'Formal suits and blazers', '/images/categories/suits.jpg'],
      ['Traditional', 'Panjabi, Sherwani, and traditional wear', '/images/categories/traditional.jpg'],
      ['Ladies Wear', 'Salwar Kameez, Sarees', '/images/categories/ladies.jpg'],
      ['Kids Wear', 'Clothing for children', '/images/categories/kids.jpg']
    ];
    
    for (const [name, description, image_url] of categories) {
      await client.query(`
        INSERT INTO categories (name, description, image_url)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO NOTHING
      `, [name, description, image_url]);
    }
    
    console.log('✅ Categories inserted');
    
    // Get category IDs
    const categoriesResult = await client.query('SELECT id, name FROM categories');
    const categoryMap = {};
    categoriesResult.rows.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });
    
    // Insert sample products
    const products = [
      {
        name: 'Premium Cotton Shirt',
        category: 'Shirts',
        description: 'High-quality cotton shirt with premium stitching',
        price: 1250.00,
        discount_price: null,
        stock: 50,
        size: ['S', 'M', 'L', 'XL'],
        color: ['White', 'Blue', 'Gray'],
        fabric: ['Cotton', 'Linen']
      },
      {
        name: 'Formal Suit Set',
        category: 'Suits',
        description: 'Complete 3-piece formal suit',
        price: 8500.00,
        discount_price: 7999.00,
        stock: 25,
        size: ['M', 'L', 'XL', 'XXL'],
        color: ['Black', 'Navy Blue', 'Charcoal Gray'],
        fabric: ['Wool', 'Polyester Blend']
      },
      {
        name: 'Designer Panjabi',
        category: 'Traditional',
        description: 'Traditional panjabi with modern design',
        price: 2200.00,
        discount_price: 1999.00,
        stock: 30,
        size: ['M', 'L', 'XL'],
        color: ['White', 'Beige', 'Maroon'],
        fabric: ['Cotton', 'Silk']
      }
    ];
    
    for (const product of products) {
      await client.query(`
        INSERT INTO products (
          name, category_id, description, price, discount_price,
          stock, size, color, fabric, images
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        product.name,
        categoryMap[product.category],
        product.description,
        product.price,
        product.discount_price,
        product.stock,
        product.size,
        product.color,
        product.fabric,
        ['/images/products/product1.jpg', '/images/products/product2.jpg']
      ]);
    }
    
    console.log('✅ Products inserted');
    
    // Insert sample worker
    await client.query(`
      INSERT INTO workers (name, role, salary_type, salary_amount, phone, status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      'Abdul Karim',
      'Master Tailor',
      'fixed',
      35000.00,
      '+8801711111111',
      'active'
    ]);
    
    console.log('✅ Worker inserted');
    
    // Log activity
    const adminResult = await client.query(
      "SELECT id FROM users WHERE email = 'admin@meheditailors.com'"
    );
    
    if (adminResult.rows.length > 0) {
      await client.query(`
        INSERT INTO activity_logs (user_id, action, description)
        VALUES ($1, $2, $3)
      `, [
        adminResult.rows[0].id,
        'SYSTEM_SEED',
        'Database seeded with sample data'
      ]);
    }
    
    console.log('✅ Seeding completed successfully!');
    console.log('\n=== Login Credentials ===');
    console.log('Admin: admin@meheditailors.com / admin123');
    console.log('=========================');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

// Run seeding
seedDatabase();

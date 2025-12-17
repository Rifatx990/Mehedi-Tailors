const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedProductionDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting production database seeding...');
    
    // Check if admin already exists
    const adminCheck = await client.query(
      "SELECT id FROM users WHERE email = 'admin@meheditailors.com'"
    );
    
    if (adminCheck.rows.length === 0) {
      // Hash password for admin user
      const password = 'admin123';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      // Insert admin user
      await client.query(`
        INSERT INTO users (name, email, password_hash, phone, role) 
        VALUES ($1, $2, $3, $4, $5)
      `, [
        'Admin User',
        'admin@meheditailors.com',
        passwordHash,
        '+8801712345678',
        'admin'
      ]);
      
      console.log('✅ Admin user created: admin@meheditailors.com / admin123');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Insert basic categories if they don't exist
    const categories = [
      ['Shirts', 'Formal and casual shirts for men'],
      ['Pants', 'Trousers and jeans'],
      ['Suits', 'Formal suits and blazers'],
      ['Traditional', 'Panjabi, Sherwani, and traditional wear']
    ];
    
    for (const [name, description] of categories) {
      await client.query(`
        INSERT INTO categories (name, description)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING
      `, [name, description]);
    }
    
    console.log('✅ Categories seeded');
    
    console.log('🎉 Production seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Production seeding failed:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedProductionDatabase();
}

module.exports = { seedProductionDatabase };

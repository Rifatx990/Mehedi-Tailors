const { Pool } = require('pg');

// Use DATABASE_URL from environment (Render provides this)
// Make sure it includes ?sslmode=require
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=require`;

console.log('Connecting to database:', connectionString.replace(/:[^:@]*?@/, ':****@'));

// Render PostgreSQL requires SSL
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Render PostgreSQL
    sslmode: 'require'
  },
  max: 10, // Reduced for Render free tier
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('✅ Database connection established');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err.message);
});

// Test connection function
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('📅 Database time:', result.rows[0].now);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // More detailed error info
    console.error('🔍 Connection details:', {
      hasConnectionString: !!process.env.DATABASE_URL,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      sslRequired: true,
      errorCode: error.code
    });
    
    if (client) client.release();
    return false;
  }
};

// Export pool and test function
module.exports = {
  pool,
  testConnection
};

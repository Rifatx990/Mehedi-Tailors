// Database connection
const { pool, testConnection } = require('./config/database');

// Test database connection on startup
async function initializeDatabase() {
  console.log('🔧 Initializing database connection...');
  const connected = await testConnection();
  
  if (!connected) {
    console.log('⚠️  Database connection failed. Application will start but database features will not work.');
    console.log('⚠️  Check environment variables and PostgreSQL service status on Render.');
    
    // You can choose to exit or continue without database
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  In production, consider exiting if database is critical');
      // process.exit(1); // Uncomment if you want to exit on DB failure
    }
  }
  
  return connected;
}

// Initialize database before starting server
initializeDatabase().then(connected => {
  if (connected) {
    console.log('✅ Database initialized successfully');
  }
});

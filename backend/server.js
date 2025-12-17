const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render.com
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting - fix for proxy
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  trustProxy: true, // Trust the X-Forwarded-For header
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health' || req.path === '/';
  }
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
const { pool, testConnection } = require('./config/database');

// Test database connection on startup
async function initializeDatabase() {
  console.log('🔧 Initializing database connection...');
  const connected = await testConnection();
  
  if (!connected) {
    console.log('⚠️  Database connection failed. Some features may not work.');
    console.log('⚠️  Check environment variables and PostgreSQL service status on Render.');
  } else {
    console.log('✅ Database initialized successfully');
  }
  
  return connected;
}

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const workerRoutes = require('./routes/workers');
const reportRoutes = require('./routes/reports');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint (important for Render)
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Mehedi Tailors API',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'checking...'
  };

  try {
    // Test database connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    healthCheck.database = 'connected';
    res.json(healthCheck);
  } catch (error) {
    healthCheck.status = 'degraded';
    healthCheck.database = 'disconnected';
    healthCheck.databaseError = error.message;
    res.status(503).json(healthCheck);
  }
});

// In production, serve React frontend
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  
  // Path to React build folder (relative from backend folder)
  const frontendBuildPath = path.join(__dirname, '../frontend/build');
  
  console.log('🔍 Checking for React build at:', frontendBuildPath);
  
  // Check if React build exists
  if (fs.existsSync(frontendBuildPath)) {
    console.log('✅ Found React build at:', frontendBuildPath);
    
    // Serve static files from React build
    app.use(express.static(frontendBuildPath, {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.png') || filePath.endsWith('.jpg')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
      }
    }));
    
    // For any other requests, send React app
    app.get('*', (req, res, next) => {
      // Don't serve React for API routes
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
    
    console.log('✅ React frontend will be served from build folder');
  } else {
    console.log('❌ React build folder not found at:', frontendBuildPath);
    
    // Create a simple frontend landing page
    app.get('*', (req, res, next) => {
      // Don't serve landing page for API routes
      if (req.path.startsWith('/api/')) {
        return next();
      }
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Mehedi Tailors - Setup Required</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            }
            .container {
              background: rgba(255, 255, 255, 0.95);
              border-radius: 20px;
              padding: 40px;
              max-width: 800px;
              width: 90%;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              color: #333;
            }
            h1 {
              color: #0ea5e9;
              margin-bottom: 10px;
              font-size: 2.5rem;
            }
            .subtitle {
              color: #666;
              margin-bottom: 30px;
              font-size: 1.2rem;
            }
            .status-box {
              background: #f0f9ff;
              border: 2px solid #0ea5e9;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            .step {
              background: #f9fafb;
              border-left: 4px solid #10b981;
              padding: 15px;
              margin: 10px 0;
            }
            code {
              background: #e5e7eb;
              padding: 4px 8px;
              border-radius: 4px;
              font-family: monospace;
              color: #374151;
              display: inline-block;
              margin: 5px 0;
            }
            .links {
              margin-top: 30px;
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              justify-content: center;
            }
            .link {
              background: #0ea5e9;
              color: white;
              padding: 12px 24px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 500;
              transition: all 0.3s;
            }
            .link:hover {
              background: #0284c7;
              transform: translateY(-2px);
            }
            .healthy {
              color: #065f46;
              background: #d1fae5;
              padding: 8px 12px;
              border-radius: 6px;
              display: inline-block;
              margin: 5px 0;
            }
            .unhealthy {
              color: #991b1b;
              background: #fee2e2;
              padding: 8px 12px;
              border-radius: 6px;
              display: inline-block;
              margin: 5px 0;
            }
            .logo {
              font-size: 2rem;
              font-weight: bold;
              color: #0ea5e9;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">👔 Mehedi Tailors</div>
            <h1>Premium Clothing Shop & Tailoring</h1>
            <p class="subtitle">Your backend API is running. Frontend setup is required.</p>
            
            <div class="status-box">
              <h3>System Status</h3>
              <div id="api-status">
                <p>Checking API health...</p>
              </div>
            </div>
            
            <div class="step">
              <h4>Step 1: Update Build Command on Render</h4>
              <p>Go to Render dashboard → Your service → Build & Deploy</p>
              <p>Update <strong>Build Command</strong> to:</p>
              <code>cd frontend && npm install && npm run build</code>
            </div>
            
            <div class="step">
              <h4>Step 2: Trigger Manual Rebuild</h4>
              <p>In Render dashboard, click "Manual Deploy" → "Clear cache and deploy"</p>
            </div>
            
            <div class="step">
              <h4>Step 3: Test Your API</h4>
              <p>API endpoints are already working:</p>
              <ul>
                <li><a href="/api/health" style="color: #0ea5e9;">Health Check</a></li>
                <li><a href="/api/products" style="color: #0ea5e9;">Products API</a></li>
                <li><a href="/api/auth" style="color: #0ea5e9;">Authentication</a></li>
              </ul>
            </div>
            
            <div class="links">
              <a href="/api/health" class="link">Check API Health</a>
              <a href="/api/products" class="link">Test Products</a>
              <a href="https://dashboard.render.com" target="_blank" class="link" style="background: #10b981;">Render Dashboard</a>
            </div>
          </div>
          
          <script>
            // Check API health
            fetch('/api/health')
              .then(response => response.json())
              .then(data => {
                const statusDiv = document.getElementById('api-status');
                if (data.status === 'healthy') {
                  statusDiv.innerHTML = \`
                    <div class="healthy">
                      ✅ API Healthy • Database: \${data.database} • Environment: \${data.environment}
                    </div>
                  \`;
                } else {
                  statusDiv.innerHTML = \`
                    <div class="unhealthy">
                      ⚠️ API Issue: \${data.databaseError || 'Unknown error'}
                    </div>
                  \`;
                }
              })
              .catch(error => {
                document.getElementById('api-status').innerHTML = \`
                  <div class="unhealthy">
                    ❌ Cannot reach API: \${error.message}
                  </div>
                \`;
              });
          </script>
        </body>
        </html>
      `);
    });
  }
}

// Root route - API info
app.get('/', (req, res) => {
  res.json({ 
    message: 'Mehedi Tailors And Fabrics API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    documentation: 'https://mehedi-tailors.onrender.com/api/health',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      admin: '/api/admin',
      workers: '/api/workers',
      reports: '/api/reports'
    },
    instructions: 'For the React frontend, ensure frontend/build folder exists'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    path: req.path
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      admin: '/api/admin',
      workers: '/api/workers',
      reports: '/api/reports',
      health: '/api/health'
    }
  });
});

// Start server after database initialization
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: https://mehedi-tailors.onrender.com/api/health`);
      console.log(`🔗 API Base URL: https://mehedi-tailors.onrender.com/api`);
      console.log(`🎯 Application URL: https://mehedi-tailors.onrender.com`);
      
      // Show available routes
      console.log('\n📋 Available API Routes:');
      console.log('  GET  /api/health        - Health check');
      console.log('  POST /api/auth/login    - User login');
      console.log('  POST /api/auth/register - User registration');
      console.log('  GET  /api/products      - Get all products');
      console.log('  GET  /api/products/:id  - Get single product');
      console.log('  GET  /api/orders        - Get user orders');
      console.log('  POST /api/orders        - Create new order');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

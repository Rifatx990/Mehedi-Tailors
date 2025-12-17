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
const pool = require('./config/database');

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
  try {
    // Test database connection
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Mehedi Tailors API',
      database: 'connected',
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'Mehedi Tailors API',
      database: 'disconnected',
      error: error.message
    });
  }
});

// In production, serve React frontend
// In production, serve React frontend
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const path = require('path');
  
  // Path to React build folder (relative from backend folder)
  const frontendBuildPath = path.join(__dirname, '../frontend/build');
  
  console.log('🔍 Checking for React build at:', frontendBuildPath);
  console.log('🔍 Current directory:', __dirname);
  
  try {
    // List files in parent directory
    const parentDir = path.join(__dirname, '..');
    const files = fs.readdirSync(parentDir);
    console.log('📁 Files in parent directory:', files);
    
    // Check if frontend folder exists
    const frontendPath = path.join(__dirname, '../frontend');
    if (fs.existsSync(frontendPath)) {
      console.log('✅ Found frontend folder');
      const frontendFiles = fs.readdirSync(frontendPath);
      console.log('📁 Files in frontend folder:', frontendFiles);
    } else {
      console.log('❌ Frontend folder not found at:', frontendPath);
    }
  } catch (err) {
    console.log('⚠️  Error reading directories:', err.message);
  }
  
  // Check if React build exists
  if (fs.existsSync(frontendBuildPath)) {
    console.log('✅ Found React build at:', frontendBuildPath);
    
    // Serve static files from React build
    app.use(express.static(frontendBuildPath, {
      maxAge: '1d',
      setHeaders: (res, path) => {
        if (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.png') || path.endsWith('.jpg')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
      }
    }));
    
    // For any other requests, send React app
    app.get('*', (req, res) => {
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
    app.get('*', (req, res) => {
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
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              max-width: 800px;
              width: 90%;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #666;
              margin-bottom: 30px;
              font-size: 18px;
            }
            .status {
              background: #f0f9ff;
              border: 2px solid #0ea5e9;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
              text-align: left;
            }
            .status h3 {
              color: #0ea5e9;
              margin-top: 0;
            }
            .step {
              background: #f9fafb;
              border-left: 4px solid #10b981;
              padding: 15px;
              margin: 10px 0;
              text-align: left;
            }
            code {
              background: #e5e7eb;
              padding: 4px 8px;
              border-radius: 4px;
              font-family: monospace;
              color: #374151;
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
              padding: 10px 20px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 500;
              transition: background 0.3s;
            }
            .link:hover {
              background: #0284c7;
            }
            .api-status {
              padding: 10px;
              border-radius: 8px;
              font-weight: bold;
              margin: 10px 0;
            }
            .healthy {
              background: #d1fae5;
              color: #065f46;
            }
            .unhealthy {
              background: #fee2e2;
              color: #991b1b;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Mehedi Tailors And Fabrics</h1>
            <p class="subtitle">Premium Clothing Shop & Tailoring Management System</p>
            
            <div class="status">
              <h3>Current Status</h3>
              <p>✅ <strong>Backend API is running</strong> - All API endpoints are working</p>
              <p>⚠️ <strong>React Frontend needs to be built</strong> - Build folder not found</p>
              
              <div id="api-status" class="api-status">
                Checking API health...
              </div>
            </div>
            
            <div class="step">
              <h4>Step 1: Check Build Configuration</h4>
              <p>In Render.com dashboard, go to your service → Build & Deploy</p>
              <p>Update <strong>Build Command</strong> to:</p>
              <code>cd frontend && npm install && npm run build</code>
            </div>
            
            <div class="step">
              <h4>Step 2: Trigger Manual Rebuild</h4>
              <p>In Render dashboard, click "Manual Deploy" → "Clear cache and deploy"</p>
              <p>This will rebuild the frontend</p>
            </div>
            
            <div class="step">
              <h4>Step 3: Verify Build Logs</h4>
              <p>Check the build logs for any React build errors</p>
              <p>Look for: <code>Creating an optimized production build...</code></p>
              <p>And: <code>Compiled successfully</code></p>
            </div>
            
            <div class="links">
              <a href="/api/health" class="link">Check API Health</a>
              <a href="/api/products" class="link">Test Products API</a>
              <a href="https://dashboard.render.com" target="_blank" class="link" style="background: #10b981;">Go to Render Dashboard</a>
            </div>
          </div>
          
          <script>
            // Check API health
            fetch('/api/health')
              .then(response => response.json())
              .then(data => {
                const statusDiv = document.getElementById('api-status');
                if (data.status === 'healthy') {
                  statusDiv.className = 'api-status healthy';
                  statusDiv.innerHTML = \`✅ API Healthy • Database: \${data.database} • Environment: \${data.environment}\`;
                } else {
                  statusDiv.className = 'api-status unhealthy';
                  statusDiv.innerHTML = \`❌ API Issue: \${data.error}\`;
                }
              })
              .catch(error => {
                document.getElementById('api-status').className = 'api-status unhealthy';
                document.getElementById('api-status').innerHTML = \`❌ Cannot reach API: \${error.message}\`;
              });
          </script>
        </body>
        </html>
      `);
    });
  }
}

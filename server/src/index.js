import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import eventsRouter from './routes/events.js';
import mapboxRouter from './routes/mapbox.js';
import summarizeRouter from './routes/summarize.js';
import { config, validateConfig } from './config/config.js';

const app = express();

// Validate configuration on startup
console.log('[Server] Validating server configuration...');
const configValid = validateConfig();
if (!configValid) {
  console.error('[Server] Configuration validation failed. Please check your environment variables.');
  process.exit(1);
}

// Trust proxy settings (for rate limiting behind reverse proxies)
if (config.server.security.trustProxy) {
  app.set('trust proxy', 1);
}

// Security middleware
app.disable('x-powered-by'); // Hide Express server info

// Rate limiting with enhanced configuration
const limiter = rateLimit({
  windowMs: config.server.rateLimit.windowMs,
  max: config.server.rateLimit.max,
  standardHeaders: config.server.rateLimit.standardHeaders,
  legacyHeaders: config.server.rateLimit.legacyHeaders,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.server.rateLimit.windowMs / 1000)
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (config.server.cors.origins.includes(origin) || config.server.cors.origins.includes('*')) {
      return callback(null, true);
    }
    
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: config.server.cors.credentials,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

// Request logging in development
if (config.isDevelopment) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: config.server.security.maxRequestSize }));
app.use(express.urlencoded({ extended: true, limit: config.server.security.maxRequestSize }));
app.use(limiter);

// Request validation middleware
app.use('/api', (req, res, next) => {
  // Validate content type for POST requests
  if (req.method === 'POST' && !req.is('application/json')) {
    return res.status(400).json({
      success: false,
      error: 'Content-Type must be application/json'
    });
  }
  next();
});

// Routes
app.use('/api/events', eventsRouter);
app.use('/api/mapbox', mapboxRouter);
app.use('/api/summarize', summarizeRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.environment
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'API is running',
    timestamp: new Date().toISOString(),
    environment: config.environment,
    providers: {
      llm: config.apis.llm.provider,
      mapbox: Boolean(config.apis.mapbox.publicToken)
    }
  });
});

// Catch-all route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err);
  
  // CORS error
  if (err.message && err.message.includes('CORS policy')) {
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation',
      message: 'Origin not allowed'
    });
  }
  
  // JSON parsing error
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    });
  }
  
  // Request too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Request too large',
      message: 'Request body exceeds size limit'
    });
  }
  
  // Default error response
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: config.isDevelopment ? err.message : 'Something went wrong'
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(config.server.port, () => {
  console.log(`[Server] GeoTime API server running on port ${config.server.port}`);
  console.log(`[Server] Environment: ${config.environment}`);
  console.log(`[Server] LLM Provider: ${config.apis.llm.provider}`);
  console.log(`[Server] CORS Origins: ${config.server.cors.origins.join(', ')}`);
  console.log(`[Server] Rate Limit: ${config.server.rateLimit.max} requests per ${config.server.rateLimit.windowMs / 60000} minutes`);
  console.log(`[Server] Health check: http://localhost:${config.server.port}/health`);
  console.log(`[Server] API Status: http://localhost:${config.server.port}/api/status`);
  console.log('[Server] Available API endpoints:');
  console.log(`  - GET    /api/events - Historical events data`);
  console.log(`  - GET    /api/mapbox/config - Mapbox configuration`);
  console.log(`  - GET    /api/mapbox/status - Mapbox service status`);
  console.log(`  - POST   /api/mapbox/geocode - Server-side geocoding`);
  console.log(`  - POST   /api/mapbox/reverse-geocode - Server-side reverse geocoding`);
  console.log(`  - POST   /api/summarize - Generate AI summaries`);
});
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import eventsRouter from './routes/events.js';
import mapboxRouter from './routes/mapbox.js';
import summaryRouter from './routes/summary.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(limiter);

// Validate required environment variables
const requiredEnvVars = ['MAPBOX_ACCESS_TOKEN'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Some features may not work properly. Please check your .env file.');
}

// Routes
app.use('/api', eventsRouter);
app.use('/api', mapboxRouter);
app.use('/api', summaryRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`GeoTime API server running on port ${PORT}`);
  console.log(`Server health check available at http://localhost:${PORT}/health`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
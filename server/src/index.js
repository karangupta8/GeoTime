import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import eventsRouter from './routes/events.js';
import mapboxRouter from './routes/mapbox.js';
import summarizeRouter from './routes/summarize.js';
import { config, validateConfig } from './config/config.js';

const app = express();

// Validate configuration on startup
console.log('Validating server configuration...');
validateConfig();

// Rate limiting with config
const limiter = rateLimit({
  windowMs: config.server.rateLimit.windowMs,
  max: config.server.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(cors({
  origin: config.server.cors.origins,
  credentials: config.server.cors.credentials
}));
app.use(express.json());
app.use(limiter);

// Routes
app.use('/api/events', eventsRouter);
app.use('/api/mapbox', mapboxRouter);
app.use('/api/summarize', summarizeRouter);

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

app.listen(config.server.port, () => {
  console.log(`GeoTime API server running on port ${config.server.port}`);
  console.log(`Environment: ${config.environment}`);
  console.log(`LLM Provider: ${config.apis.llm.provider}`);
  console.log(`Server health check available at http://localhost:${config.server.port}/health`);
  console.log(`API endpoints available at http://localhost:${config.server.port}/api`);
  console.log('Available endpoints:');
  console.log(`  - GET  /api/events - Historical events`);
  console.log(`  - GET  /api/mapbox/config - Mapbox configuration`);
  console.log(`  - POST /api/summarize - Generate AI summaries`);
});
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import scoreRoutes from './routes/scoreRoutes.js';
import initializeDatabase from './db/init.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));
app.use(express.json());

// Initialize database on startup
initializeDatabase().catch(error => {
  console.error('Database initialization failed:', error);
  console.warn('Continuing startup despite database initialization failure');
});

// Apply rate limiting to all requests
const defaultRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests, please try again later.'
  }
});

// Apply stricter rate limiting to API routes
const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many API requests, please try again later.'
  }
});

// Apply rate limiters
app.use(defaultRateLimit);
app.use('/api', apiRateLimit);

// Routes
app.use('/api', scoreRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
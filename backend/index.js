// File: /backend/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import scoreRoutes from './routes/scoreRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001; // Vercel sets PORT automatically

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' })); // Use env variable or allow all if not set
app.use(express.json());

// Apply rate limiting (Keep as is)
const defaultRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      500             // limit each IP to 100 requests per window
});
const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max:      60              // limit to 60 API calls/minute
});

app.use(defaultRateLimit);
app.use('/api', apiRateLimit);

app.use('/api', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Routes
app.use('/api', scoreRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server only for local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

// Export the app for Vercel Serverless Functions
export default app;
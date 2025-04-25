// File: /backend/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import scoreRoutes from './routes/scoreRoutes.js';
// import initializeDatabase from './db/init.js'; // REMOVE OR COMMENT OUT THIS LINE

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001; // Vercel sets PORT automatically

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

// REMOVE OR COMMENT OUT THE DATABASE INITIALIZATION BLOCK
/*
initializeDatabase().catch(error => {
  console.error('Database initialization failed:', error);
  console.warn('Continuing startup despite database initialization failure');
});
*/

// Apply rate limiting (Keep as is)
const defaultRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      100             // limit each IP to 100 requests per window
});
const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max:      20              // limit to 20 API calls/minute
});

app.use(defaultRateLimit);
app.use('/api', apiRateLimit);

// Routes
app.use('/api', scoreRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server (Vercel handles this, but good for local dev)
// For Vercel, it doesn't need to listen; it just exports the 'app'.
// However, keeping app.listen allows local testing via `node backend/index.js`
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

// Export the app for Vercel Serverless Functions
export default app;
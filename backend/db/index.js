// File: /backend/db/index.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use DATABASE_URL from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set!');
  process.exit(1); // Exit if database URL is missing
}

const pool = new Pool({
  connectionString: connectionString,
  // Add SSL configuration required by Neon for pooled connections
  ssl: {
    require: true,
  },
});

// Test the database connection (optional but good practice)
pool.query('SELECT NOW()')
  .then(res => {
    console.log('Database connected at:', res.rows[0].now);
  })
  .catch(err => {
    console.error('Database connection error:', err.stack);
    // Optional: Decide if you want the app to crash if DB fails initially
    // process.exit(1);
  });

export default pool;
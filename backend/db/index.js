// File: /backend/db/index.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use DATABASE_URL from environment variables or individual variables
const dbConfig = {};

if (process.env.DATABASE_URL) {
  dbConfig.connectionString = process.env.DATABASE_URL;
  // Add SSL configuration required by Neon for pooled connections
  // We assume DATABASE_URL implies a remote connection that needs SSL
  dbConfig.ssl = {
    require: true,
  };
} else if (process.env.PG_HOST) {
  // Fallback to individual variables
  dbConfig.host = process.env.PG_HOST;
  dbConfig.port = process.env.PG_PORT || 5432;
  dbConfig.database = process.env.PG_DATABASE;
  dbConfig.user = process.env.PG_USER;
  dbConfig.password = process.env.PG_PASSWORD;
  
  // Disable SSL for localhost development unless explicitly requested
  if (process.env.PG_HOST !== 'localhost' && process.env.PG_HOST !== '127.0.0.1') {
     dbConfig.ssl = { require: true };
  }
} else {
  console.error('DATABASE_URL or PG_HOST environment variable is not set!');
  process.exit(1); // Exit if database configuration is missing
}

const pool = new Pool(dbConfig);

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

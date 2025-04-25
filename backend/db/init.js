import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize database schema
 */
const initializeDatabase = async () => {
  try {
    console.log('Initializing database schema...');
    
    // Read SQL schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the entire schema file at once instead of splitting
    await db.query(schemaSql);
    
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema:', error);
  }
};

// Run as standalone script if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase().then(() => {
    console.log('Database initialization complete');
    process.exit(0);
  }).catch(error => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
}

export default initializeDatabase; 
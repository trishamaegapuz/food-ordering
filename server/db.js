import pg from 'pg';
import 'dotenv/config';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Importante ito para sa cloud databases tulad ng Neon
  }
});

// Database connection check with logging
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ DB Connection Error:', err.stack);
  }
  console.log('✅ DATABASE CONNECTED SUCCESSFULLY TO NEON');
  release();
});
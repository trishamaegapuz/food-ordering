import pg from 'pg';
import 'dotenv/config';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Importante ito para sa cloud databases
  }
});

// Dagdagan natin ito para makita natin ang eksaktong error sa logs
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ DB Connection Error:', err.stack);
  }
  console.log('✅ DATABASE CONNECTED SUCCESSFULLY TO NEON');
  release();
});
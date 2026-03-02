import pg from 'pg';
import 'dotenv/config';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Mandatory ito para sa Neon
  }
});

pool.on('connect', () => {
  console.log('✅ Connected to Neon Database');
});
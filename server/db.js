import pg from 'pg';
import 'dotenv/config';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // This is mandatory for Neon
  },
});

pool.connect((err) => {
  if (err) {
    console.error('❌ DB Connection Error:', err.message);
  } else {
    console.log('✅ Database Connected Successfully to Neon');
  }
});
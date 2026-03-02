import pg from 'pg';

export const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false, // Required for Neon serverless connections
  },
});

pool.connect((err) => {
  if (err) {
    console.error('DB Connection Error:', err.message);
  } else {
    console.log('Database Connected Successfully to Neon');
  }
});
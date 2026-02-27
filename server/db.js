import pg from 'pg';

export const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'food_ordering',
  password: '12345678', // Palitan kung iba ang password mo sa pgAdmin
  port: 5432,
});

pool.connect((err) => {
  if (err) console.error('DB Connection Error:', err.message);
  else console.log('Database Connected Successfully');
});
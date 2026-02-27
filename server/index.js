import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { pool } from './db.js';
import { hashPassword, comparePassword } from './components/hash.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  name: 'foodapp_sid',
  secret: 'dev-secret-key-123',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// REGISTER
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    const result = await pool.query(
      'INSERT INTO user_accounts (username, password, email, role) VALUES ($1, $2, $3, $4) RETURNING id, username, role',
      [username, hashedPassword, email, 'customer'] // Default is customer
    );
    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Registration failed. Check if username exists." });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM user_accounts WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ success: false, message: "User not found" });

    const user = result.rows[0];
    const match = await comparePassword(password, user.password);
    
    if (!match) return res.status(401).json({ success: false, message: "Wrong password" });

    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.json({ success: true, user: { username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT}`));
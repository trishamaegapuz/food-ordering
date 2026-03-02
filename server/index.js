import express from 'express';
import session from 'express-session';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { pool } from './db.js';
import { hashPassword, comparePassword } from './components/hash.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// ==================== MIDDLEWARE ====================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = process.env.PORT || 3000;

// Dynamic CORS: Papayagan nito ang Vercel URL mo
const allowedOrigins = [
  'https://food-ordering-sigma-ten.vercel.app',
  'http://localhost:5173',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// SESSION FIX: Kailangan ito para sa Production (Render)
app.use(session({
  name: 'foodapp_sid',
  secret: process.env.SESSION_SECRET || 'dev-secret-key-123',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: true, // Required for HTTPS
    sameSite: 'none', // Required for cross-site (Vercel to Render)
    httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ADDED: Health Check Route para ma-verify mo kung Live ang server
app.get('/', (req, res) => res.send('✅ Food Ordering Backend is Running!'));

// ==================== AUTHENTICATION MIDDLEWARE ====================
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ success: false, error: 'No token provided' });

  const parts = token.split('-');
  const userId = parts[parts.length - 1];
  
  if (!userId || isNaN(parseInt(userId))) return res.status(403).json({ success: false, error: 'Invalid token' });

  try {
    const userResult = await pool.query('SELECT id, role FROM user_accounts WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(403).json({ success: false, error: 'User not found' });
    req.userId = parseInt(userId);
    req.userRole = userResult.rows[0].role;
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: 'Auth error' });
  }
};

const authenticateAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') return res.status(403).json({ success: false, error: 'Admin access required' });
  next();
};

// ==================== AUTH ROUTES ====================
app.post('/api/register', async (req, res) => {
  const { full_name, password, email, role } = req.body; 
  try {
    const hashedPassword = await hashPassword(password);
    const userRole = role || 'customer';
    const result = await pool.query(
      `INSERT INTO user_accounts (full_name, password, email, role, delivery_address) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, full_name, email, role, delivery_address, latitude, longitude, profile_picture, contact`,
      [full_name, hashedPassword, email, userRole, null]
    );
    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Registration failed." });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM user_accounts WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ success: false, message: "User not found" });

    const user = result.rows[0];
    const match = await comparePassword(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: "Incorrect password" });

    res.json({ 
      success: true, 
      token: "secret-session-token-" + user.id, 
      user: { 
        id: user.id, full_name: user.full_name, email: user.email, role: user.role,
        address: user.delivery_address, latitude: user.latitude, longitude: user.longitude,
        profile_picture: user.profile_picture, contact: user.contact
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== PROFILE MANAGEMENT ====================
app.put('/api/user/profile', authenticateToken, upload.single('profile_picture'), async (req, res) => {
  const { full_name, contact, address } = req.body;
  const userId = req.userId;
  let profilePicture = req.file ? req.file.filename : null;

  try {
    if (profilePicture) {
      const oldPic = await pool.query('SELECT profile_picture FROM user_accounts WHERE id = $1', [userId]);
      if (oldPic.rows[0]?.profile_picture) {
        const oldPath = path.join(uploadDir, oldPic.rows[0].profile_picture);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const fields = []; const values = []; let idx = 1;
    if (full_name) { fields.push(`full_name = $${idx++}`); values.push(full_name); }
    if (contact !== undefined) { fields.push(`contact = $${idx++}`); values.push(contact); }
    if (address) { fields.push(`delivery_address = $${idx++}`); values.push(address); }
    if (profilePicture) { fields.push(`profile_picture = $${idx++}`); values.push(profilePicture); }

    if (fields.length === 0) return res.status(400).json({ success: false, error: 'No fields' });

    values.push(userId);
    const query = `UPDATE user_accounts SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(query, values);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

app.post('/api/user/change-password', authenticateToken, async (req, res) => {
  const { current_password, new_password } = req.body;
  try {
    const user = await pool.query('SELECT password FROM user_accounts WHERE id = $1', [req.userId]);
    const match = await comparePassword(current_password, user.rows[0].password);
    if (!match) return res.status(401).json({ success: false, error: 'Incorrect current password' });
    const hashedNew = await hashPassword(new_password);
    await pool.query('UPDATE user_accounts SET password = $1 WHERE id = $2', [hashedNew, req.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error changing password' });
  }
});

app.delete('/api/user/account', authenticateToken, async (req, res) => {
  const { password } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const user = await client.query('SELECT password FROM user_accounts WHERE id = $1', [req.userId]);
    const match = await comparePassword(password, user.rows[0].password);
    if (!match) return res.status(401).json({ success: false, error: 'Incorrect password' });
    await client.query('DELETE FROM user_accounts WHERE id = $1', [req.userId]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally { client.release(); }
});

// ==================== ADDRESS UPDATE ====================
app.post('/api/user/address', authenticateToken, async (req, res) => {
  const { address, save_to_profile } = req.body;
  try {
    if (save_to_profile) {
      await pool.query('UPDATE user_accounts SET delivery_address = $1 WHERE id = $2', [address, req.userId]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ==================== CUSTOMER ORDER ROUTES ====================
app.get('/api/orders', authenticateToken, async (req, res) => {
  const userId = req.query.user_id || req.userId;
  try {
    const orders = await pool.query(`
      SELECT o.*, ot.latitude, ot.longitude, ot.location_name, ot.location_type, ot.updated_at as location_updated,
      u.latitude as dest_latitude, u.longitude as dest_longitude, u.delivery_address as dest_location_name
      FROM orders o
      LEFT JOIN order_tracking ot ON o.id = ot.order_id AND (ot.location_type = 'current' OR ot.location_type IS NULL)
      LEFT JOIN user_accounts u ON o.user_id = u.id
      WHERE o.user_id = $1 ORDER BY o.created_at DESC`, [userId]);
    res.json(orders.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  const { items, payment_method, delivery_address } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, payment_method, status, delivery_address, created_at) 
       VALUES ($1, $2, $3, 'pending', $4, NOW()) RETURNING id`,
      [req.userId, total, payment_method, delivery_address]
    );
    const orderId = orderResult.rows[0].id;
    for (const item of items) {
      await client.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)', [orderId, item.id, item.quantity, item.price]);
    }
    const user = await client.query('SELECT latitude, longitude, delivery_address FROM user_accounts WHERE id = $1', [req.userId]);
    if (user.rows[0]?.latitude) {
      await client.query(`INSERT INTO order_tracking (order_id, latitude, longitude, location_name, location_type) VALUES ($1, $2, $3, $4, 'destination')`, [orderId, user.rows[0].latitude, user.rows[0].longitude, user.rows[0].delivery_address]);
    }
    await client.query('COMMIT');
    res.json({ success: true, order_id: orderId, total: total.toFixed(2) });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally { client.release(); }
});

// ==================== ADMIN ORDER ROUTES ====================
app.get('/api/admin/orders', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const orders = await pool.query(`
      SELECT o.*, u.full_name, u.email, u.delivery_address AS address, u.latitude AS user_latitude, u.longitude AS user_longitude,
      ot.latitude, ot.longitude, ot.location_name, ot.location_type, ot_dest.latitude AS dest_latitude, ot_dest.longitude AS dest_longitude
      FROM orders o
      LEFT JOIN user_accounts u ON o.user_id = u.id
      LEFT JOIN order_tracking ot ON o.id = ot.order_id AND ot.location_type = 'current'
      LEFT JOIN order_tracking ot_dest ON o.id = ot_dest.order_id AND ot_dest.location_type = 'destination'
      ORDER BY o.created_at DESC`);
    res.json(orders.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/orders/status', authenticateToken, authenticateAdmin, async (req, res) => {
  const { order_id, new_status } = req.body;
  try {
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [new_status, order_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/orders/location', authenticateToken, authenticateAdmin, async (req, res) => {
  const { order_id, latitude, longitude, location_name } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM order_tracking WHERE order_id = $1 AND location_type = $2', [order_id, 'current']);
    if (existing.rows.length > 0) {
      await pool.query(`UPDATE order_tracking SET latitude = $1, longitude = $2, location_name = $3, updated_at = NOW() WHERE order_id = $4 AND location_type = 'current'`, [latitude, longitude, location_name, order_id]);
    } else {
      await pool.query(`INSERT INTO order_tracking (order_id, latitude, longitude, location_name, location_type) VALUES ($1, $2, $3, $4, 'current')`, [order_id, latitude, longitude, location_name]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/orders/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM orders WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ADMIN USER MANAGEMENT ====================
app.get('/api/users', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, full_name, email, role, delivery_address, latitude, longitude FROM user_accounts ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/users/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  const { full_name, email, role, delivery_address, latitude, longitude } = req.body;
  try {
    await pool.query(`UPDATE user_accounts SET full_name = $1, email = $2, role = $3, delivery_address = $4, latitude = $5, longitude = $6 WHERE id = $7`, [full_name, email, role, delivery_address, latitude, longitude, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/users/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM user_accounts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== PRODUCTS ROUTES ====================
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', authenticateToken, authenticateAdmin, async (req, res) => {
  const { name, description, price, category, image_url } = req.body;
  try {
    const result = await pool.query('INSERT INTO products (name, description, price, category, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, description, price, category, image_url]);
    res.status(201).json({ success: true, product: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/products/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  const { name, description, price, category, image_url } = req.body;
  try {
    await pool.query('UPDATE products SET name = $1, description = $2, price = $3, category = $4, image_url = $5 WHERE id = $6', [name, description, price, category, image_url, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== ADMIN STATS & REPORTS ====================
app.get('/api/admin/stats', authenticateToken, authenticateAdmin, async (req, res) => {
  const view = req.query.view || 'weekly';
  try {
    const users = await pool.query('SELECT COUNT(*) FROM user_accounts');
    const products = await pool.query('SELECT COUNT(*) FROM products');
    const orders = await pool.query('SELECT COUNT(*) FROM orders'); 
    const sales = await pool.query('SELECT SUM(total) FROM orders');
    const recentOrders = await pool.query(`SELECT o.id, o.total, o.status, o.created_at, u.full_name FROM orders o JOIN user_accounts u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5`);

    let chartQuery = view === 'weekly' 
      ? await pool.query(`SELECT TO_CHAR(DATE(created_at), 'Dy') as label, SUM(total) as value FROM orders WHERE created_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC`)
      : await pool.query(`SELECT TO_CHAR(DATE(created_at), 'Mon DD') as label, SUM(total) as value FROM orders WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC`);

    res.json({
      total_users: parseInt(users.rows[0].count),
      total_products: parseInt(products.rows[0].count),
      total_orders: parseInt(orders.rows[0].count || 0),
      total_sales: parseFloat(sales.rows[0].sum || 0),
      recentOrders: recentOrders.rows,
      chartData: { labels: chartQuery.rows.map(r => r.label), values: chartQuery.rows.map(r => parseFloat(r.value || 0)) }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/sales-report', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const summaries = await pool.query(`SELECT 
      COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total ELSE 0 END), 0) as daily_sales,
      COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN total ELSE 0 END), 0) as monthly_sales,
      COALESCE(SUM(total), 0) as total_sales FROM orders`);
    const topItems = await pool.query(`SELECT p.name, SUM(oi.quantity) as total_quantity FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.name ORDER BY total_quantity DESC LIMIT 5`);
    res.json({ summary: summaries.rows[0], topItems: topItems.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== START SERVER ====================
app.listen(PORT, () => console.log(`✅ SERVER RUNNING ON PORT ${PORT}`));
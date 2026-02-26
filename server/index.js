const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Para mabasa ang JSON data mula sa frontend

// Database Connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// --- ROUTES ---

// 1. REGISTER ROUTE
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // I-hash ang password (Security first!)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // I-save sa 'users' table na ginawa natin kanina
        const newUser = await pool.query(
            "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *",
            [username, hashedPassword]
        );

        res.json({ message: "User registered successfully!", user: newUser.rows[0].username });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error during registration.");
    }
});

// 2. LOGIN ROUTE
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Hanapin ang user
        const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

        if (user.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // I-compare ang password
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

        if (!validPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Gawa ng Token (JWT)
        const token = jwt.sign({ id: user.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, username: user.rows[0].username });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error during login.");
    }
});

// 3. LOGOUT ROUTE
// Sa JWT, ang logout ay kadalasang ginagawa sa Frontend (dine-delete ang token).
// Pero heto ang route kung gusto mong mag-send ng confirmation.
app.post('/logout', (req, res) => {
    res.json({ message: "Logged out successfully. Please delete your token on the client side." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
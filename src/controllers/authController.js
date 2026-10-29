
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function registerUser(req, res) {
  try {
    const { full_name, email, password, role } = req.body;

    if (
      typeof full_name !== 'string' ||
      !full_name.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 8 and 72 characters',
      });
    }

    const selectedRole = role || 'buyer';

    if (!['buyer', 'supplier'].includes(selectedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be buyer or supplier',
      });
    }

    const [existingUsers] = await pool.query(
      'SELECT user_id FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [full_name.trim(), normalizedEmail, hashedPassword, selectedRole]
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user_id: result.insertId,
        full_name: full_name.trim(),
        email: normalizedEmail,
        role: selectedRole,
      },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    console.error('Registration error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.query(
      `SELECT user_id, full_name, email, password, role
       FROM users
       WHERE email = ?`,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');

      return res.status(500).json({
        success: false,
        message: 'Authentication configuration error',
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
};

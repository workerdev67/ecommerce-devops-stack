import { pool } from '../db/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RedisClient } from '../db/reddis.js'

const register = async (req, res) => {
  try {
    const { name, email, password, gender, mobile, pincode, room_number, city, country } = req.body;

    if (!name || !email || !password || !gender || !mobile || !pincode || !room_number || !city || !country) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required fields."
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long."
      });
    }

    if (mobile && !/^\d{10}$/.test(mobile.trim())) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be a valid 10-digit number."
      });
    }

    const usrid = Math.floor(1003 + Math.random() * 1001000);
    const userid = `USR0-001A-${usrid}`;

    const checkUser = await pool.query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);

    if (checkUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertQuery = `
      INSERT INTO users (uid, name, email, password, gender, mobile, pincode, room_number, city, country)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, uid, name, email, created_at;
    `;

    const values = [
      userid,
      name.trim(),
      email.toLowerCase().trim(),
      hashedPassword,
      gender || null,
      mobile || null,
      pincode || null,
      room_number || null,
      city || null,
      country || null
    ];

    await pool.query(insertQuery, values);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      uid: userid,
      name: name,
      email: email,
      address: `${room_number || ''}, ${city || ''}, ${country || ''}, ${pincode || ''}`
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required fields."
      });
    }

    const userResult = await pool.query(
      `SELECT id, uid, name, email, password FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = userResult.rows[0];

    const isPasswordValid = await bcrypt.hash ? await bcrypt.compare(password, user.password) : false;

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const accessToken = jwt.sign(
      { uid: user.uid, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { uid: user.uid },
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    if (RedisClient && RedisClient.isOpen) {
      await RedisClient.setEx(`session:${user.uid}`, 7 * 24 * 60 * 60, refreshToken);
    }

    return res.status(200).json({
      success: true,
      message: "LoggedIn successfully",
      accessToken,
      refreshToken,
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export { register, login };
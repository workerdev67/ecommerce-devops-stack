import jwt from 'jsonwebtoken';
import { RedisClient } from '../db/reddis.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied. Invalid token format.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (RedisClient && RedisClient.isOpen) {
      const activeSession = await RedisClient.get(`session:${decoded.uid}`);
      if (!activeSession) {
        return res.status(401).json({
          success: false,
          message: 'Session expired or logged out. Please login again.'
        });
      }
    }

    req.user = decoded;

    next();

  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};
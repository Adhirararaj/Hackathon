const jwt = require('jsonwebtoken');
const userModel = require('../models/User');

require('dotenv').config();

const jwt_secret = process.env.JWT_SECRET;

const generateToken = (userId) => {
  return jwt.sign({ userId }, jwt_secret, { expiresIn: '7d' });
};

const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, jwt_secret);
    const user = await userModel.findById(decoded.userId).select('-password');

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    req.user = user; 
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = { generateToken, protectedRoute };
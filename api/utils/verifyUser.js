import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';
import User from '../models/user.model.js';

export const verifyToken = async (req, res, next) => {
  // Removed debug logs for production cleanliness
  const token = req.cookies.access_token;
  if (!token) {
    return next(errorHandler(401, 'Unauthorized'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch user details from DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(errorHandler(401, 'User not found'));
    }
    req.user = {
      id: user._id,
      email: user.email,
      username: user.username
    };
    next();
  } catch (err) {
    return next(errorHandler(403, 'Forbidden'));
  }
};

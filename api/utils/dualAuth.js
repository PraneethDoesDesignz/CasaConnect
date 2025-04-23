import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';

const dualAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    // Try JWT verification
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      req.authType = 'jwt';
      return next();
    } catch (e) {
      // Try Firebase verification
      try {
        const decodedFirebase = await admin.auth().verifyIdToken(token);
        req.user = decodedFirebase;
        req.authType = 'firebase';
        return next();
      } catch (e2) {
        console.error('Firebase token verification error:', e2);
        return res.status(401).json({ message: 'Invalid token', error: e2 });
      }
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};

export default dualAuth;

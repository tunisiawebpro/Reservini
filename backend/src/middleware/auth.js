import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';

export const authenticateUser = async (req, res, next) => {
  try {
    // أولاً: ابحث عن Token في Header
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    // ثانياً: إذا لم يوجد، ابحث في Cookie (للتوافق مع الإنتاج)
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please login.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};
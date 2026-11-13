import { prisma } from '../server.js';

export const requireAdmin = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header ou les cookies
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentification requise.' });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès administrateur requis.' });
    }

    req.admin = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
};
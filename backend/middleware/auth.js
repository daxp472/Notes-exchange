import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const targetUserId = decoded.userId || decoded.id;

    if (!targetUserId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // Fetch user from database to ensure they still exist
    let user = null;
    const { data: fullUser, error: fullError } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (!fullError && fullUser) {
      user = fullUser;
    } else {
      // Safe fallback query if certain columns are missing
      const { data: basicUser, error: basicError } = await supabase
        .from('users')
        .select('id, name, email, college, semester, contribution_score, badges, created_at')
        .eq('id', targetUserId)
        .single();

      if (!basicError && basicUser) {
        user = basicUser;
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'User account not found or deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.warn('Token verification error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const generateToken = (userId) => {
  return jwt.sign(
    { userId, timestamp: Date.now() },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
};
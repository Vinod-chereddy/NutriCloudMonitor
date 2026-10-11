import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    const secret = process.env.JWT_SECRET || 'nutricloud_jwt_secret_key_2026_secure';
    const adminSecret = process.env.ADMIN_JWT_SECRET || 'nutricloud_admin_jwt_secret_2026_secure';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      try {
        decoded = jwt.verify(token, adminSecret);
      } catch (err2) {
        return res.status(401).json({ message: 'Token is invalid or expired' });
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token verification failed' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role) && !req.user?.isAdmin) {
      return res
        .status(403)
        .json({ message: 'Not authorized to access this route' });
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const secret = process.env.JWT_SECRET || 'nutricloud_jwt_secret_key_2026_secure';
        const adminSecret = process.env.ADMIN_JWT_SECRET || 'nutricloud_admin_jwt_secret_2026_secure';
        try {
          req.user = jwt.verify(token, secret);
        } catch (e1) {
          try {
            req.user = jwt.verify(token, adminSecret);
          } catch (e2) {}
        }
      }
    }
  } catch (error) {
    // Silently ignore token errors for optional routes
  }
  next();
};

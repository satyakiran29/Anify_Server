import crypto from 'crypto';

/**
 * Generates the expected admin session token (SHA256 of the password).
 */
export function getAdminToken() {
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Express middleware to restrict write access to the admin.
 */
export const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized access. Authentication token is missing.'
      });
    }

    const token = authHeader.split(' ')[1];
    const expectedToken = getAdminToken();

    if (token !== expectedToken) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized access. Invalid authentication token.'
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

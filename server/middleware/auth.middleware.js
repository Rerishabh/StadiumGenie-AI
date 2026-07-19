import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || req.headers.Authorization || '';
  if (!auth || typeof auth !== 'string') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      errors: [],
      statusCode: 401,
    });
  }

  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      errors: [],
      statusCode: 401,
    });
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('auth.middleware: JWT_SECRET not set');
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [],
      statusCode: 500,
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const { sub, email, role } = decoded || {};
    if (!sub || !email || !role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errors: [],
        statusCode: 401,
      });
    }
    req.user = { id: sub, email, role };
    return next();
  } catch (e) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      errors: [],
      statusCode: 401,
    });
  }
}
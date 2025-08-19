'use strict';
const { verifyAccessToken } = require('../utils/jwt');

/**
 * Express middleware to enforce authentication via Bearer access token.
 * Adds req.user with decoded token payload if valid.
 */

// PUBLIC_INTERFACE
function requireAuth(req, res, next) {
  /** Middleware that validates Authorization Bearer token and proceeds if valid. */
  try {
    const authHeader = req.header('Authorization') || '';
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }
    const token = parts[1];
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// PUBLIC_INTERFACE
function optionalAuth(req, res, next) {
  /** Middleware that attempts to decode token if present but does not enforce. */
  try {
    const authHeader = req.header('Authorization') || '';
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const decoded = verifyAccessToken(parts[1]);
      req.user = decoded;
    }
  } catch (_) {
    // ignore token errors for optional auth
  }
  return next();
}

module.exports = {
  requireAuth,
  optionalAuth,
};

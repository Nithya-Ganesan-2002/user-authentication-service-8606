const { requireAuth, optionalAuth } = require('./auth');

// Export centralized middleware registry for future scalability.
module.exports = {
  requireAuth,
  optionalAuth,
};

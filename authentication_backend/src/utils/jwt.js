'use strict';
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Utility functions for signing and verifying JWT tokens.
 */

// PUBLIC_INTERFACE
function signAccessToken(payload) {
  /** Signs an access token with configured secret and expiry. */
  return jwt.sign(payload, config.jwt.accessTokenSecret, {
    expiresIn: config.jwt.accessTokenExpiresIn,
  });
}

// PUBLIC_INTERFACE
function signRefreshToken(payload) {
  /** Signs a refresh token with configured secret and expiry. */
  return jwt.sign(payload, config.jwt.refreshTokenSecret, {
    expiresIn: config.jwt.refreshTokenExpiresIn,
  });
}

// PUBLIC_INTERFACE
function verifyAccessToken(token) {
  /** Verifies an access token and returns decoded payload if valid. */
  return jwt.verify(token, config.jwt.accessTokenSecret);
}

// PUBLIC_INTERFACE
function verifyRefreshToken(token) {
  /** Verifies a refresh token and returns decoded payload if valid. */
  return jwt.verify(token, config.jwt.refreshTokenSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

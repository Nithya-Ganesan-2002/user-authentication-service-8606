'use strict';
require('dotenv').config();

/**
 * Centralized configuration loader.
 * All secrets and environment-specific values are loaded from process.env.
 * See .env.example for required variables.
 */
const config = {
  env: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.PORT || '3000', 10),

  // JWT settings
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || '',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || '',
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Password hashing settings
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },
};

function validateConfig() {
  const missing = [];
  if (!config.jwt.accessTokenSecret) missing.push('JWT_ACCESS_SECRET');
  if (!config.jwt.refreshTokenSecret) missing.push('JWT_REFRESH_SECRET');
  if (missing.length > 0) {
    // For initial scaffolding we warn instead of throwing to not break dev,
    // but the service will fail on token operations if not set.
    // In a real environment, consider throwing an error here.
    // eslint-disable-next-line no-console
    console.warn(`Missing env vars: ${missing.join(', ')}. Set them in .env`);
  }
}

validateConfig();

module.exports = config;

'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

/**
 * In-memory user store for initial implementation.
 * Replace with a proper database-backed repository for production.
 * Stored fields: id, email (unique), passwordHash, createdAt
 */
class UserStore {
  constructor() {
    this.usersByEmail = new Map();
    this.usersById = new Map();
  }

  /**
   * Create a user with email and plaintext password.
   * Returns created user without passwordHash.
   */
  async createUser(email, password) {
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) {
      throw new Error('Email is required');
    }
    if (!password) {
      throw new Error('Password is required');
    }
    if (this.usersByEmail.has(normalized)) {
      const err = new Error('Email already registered');
      err.code = 'EMAIL_EXISTS';
      throw err;
    }
    const saltRounds = config.security.bcryptSaltRounds;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = {
      id: uuidv4(),
      email: normalized,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    this.usersByEmail.set(normalized, user);
    this.usersById.set(user.id, user);
    return this._publicUser(user);
  }

  /**
   * Verify credentials and return user if valid, else null.
   */
  async verifyCredentials(email, password) {
    const normalized = String(email || '').trim().toLowerCase();
    const user = this.usersByEmail.get(normalized);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return this._publicUser(user);
  }

  /**
   * Get user by id (public representation).
   */
  getUserById(id) {
    const user = this.usersById.get(id);
    return user ? this._publicUser(user) : null;
  }

  _publicUser(user) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

module.exports = new UserStore();

'use strict';
const userStore = require('../services/userStore');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

/**
 * Controller handling auth flows: register, login, token refresh, token validate, me.
 */
class AuthController {
  // PUBLIC_INTERFACE
  async register(req, res) {
    /** Register a new user. Body: { email, password } */
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required' });
      }
      const user = await userStore.createUser(email, password);
      const tokens = this._issueTokens(user);
      return res.status(201).json({
        user,
        ...tokens,
      });
    } catch (err) {
      if (err.code === 'EMAIL_EXISTS') {
        return res.status(409).json({ message: 'Email already registered' });
      }
      return res.status(400).json({ message: err.message || 'Registration failed' });
    }
  }

  // PUBLIC_INTERFACE
  async login(req, res) {
    /** Login a user. Body: { email, password } */
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required' });
      }
      const user = await userStore.verifyCredentials(email, password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const tokens = this._issueTokens(user);
      return res.status(200).json({
        user,
        ...tokens,
      });
    } catch (err) {
      return res.status(400).json({ message: err.message || 'Login failed' });
    }
  }

  // PUBLIC_INTERFACE
  async refresh(req, res) {
    /** Refresh tokens. Body: { refreshToken } */
    try {
      const { refreshToken } = req.body || {};
      if (!refreshToken) {
        return res.status(400).json({ message: 'refreshToken is required' });
      }
      const decoded = verifyRefreshToken(refreshToken);
      const user = userStore.getUserById(decoded.sub);
      if (!user) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }
      const tokens = this._issueTokens(user);
      return res.status(200).json(tokens);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  }

  // PUBLIC_INTERFACE
  async validate(req, res) {
    /** Validate access token using middleware-populated req.user */
    if (!req.user) {
      return res.status(401).json({ valid: false, message: 'Unauthorized' });
    }
    return res.status(200).json({ valid: true, user: req.user });
    // Note: req.user contains token claims, not the full user record.
  }

  // PUBLIC_INTERFACE
  async me(req, res) {
    /** Return current authenticated user's basic info based on token sub */
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = userStore.getUserById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user });
  }

  _issueTokens(user) {
    const subject = user.id;
    const accessToken = signAccessToken({ sub: subject, email: user.email });
    const refreshToken = signRefreshToken({ sub: subject });
    return { accessToken, refreshToken, tokenType: 'Bearer' };
  }
}

module.exports = new AuthController();

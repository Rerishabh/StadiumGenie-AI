import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
 
class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}
 
class AuthError extends Error {
  constructor(message = 'Invalid credentials') {
    super(message);
    this.name = 'AuthError';
    this.statusCode = 401;
  }
}
 
export async function registerUser({ email, password, name, phone }) {
  const normalized = String(email).toLowerCase().trim();
 
  // Check for existing user
  const existing = await User.findOne({ email: normalized }).lean().exec();
  if (existing) {
    throw new ConflictError('Email already registered');
  }
 
  // Create user (Mongoose pre-save hook will hash password)
  const user = new User({
    email: normalized,
    password,
    name,
    phone,
  });
 
  const saved = await user.save();
 
  // Return safe payload
  return {
    id: saved._id.toString(),
    email: saved.email,
    name: saved.name || null,
    role: saved.role,
  };
}
 
/**
 * Authenticate user and return access token + user info (no password).
 */
export async function authenticateUser({ email, password }) {
  const normalized = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: normalized }).exec();
  if (!user || !user.isActive) {
    throw new AuthError();
  }
 
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AuthError();
  }
 
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  };
 
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not set');
  }
  const expiresIn = process.env.ACCESS_TOKEN_TTL || '1d';
  const accessToken = jwt.sign(payload, secret, { expiresIn });
 
  return {
    accessToken,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name || null,
      phone: user.phone || null,
      profileImage: user.profileImage || null,
    },
    expiresIn,
  };
}

import { registerUser, authenticateUser } from '../services/auth.service.js';

/**
 * Controller for registering a new user.
 * Assumes registerValidation middleware ran on the route.
 */
export async function register(req, res) {
  try {
    const { email, password, name, phone } = req.body;

    const user = await registerUser({ email, password, name, phone });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user },
    });
  } catch (err) {
    // Map known errors
    if (err && err.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: err.message || 'Conflict',
        errors: [],
        statusCode: 409,
      });
    }

    // Generic server error
    console.error('Register error:', err && err.message ? err.message : err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [],
      statusCode: 500,
    });
  }
}

/**
 * Controller for login.
 * Assumes loginValidation middleware ran on the route.
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { accessToken, user, expiresIn } = await authenticateUser({ email, password });
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { accessToken, user },
      meta: { expiresIn },
    });
  } catch (err) {
    if (err && err.statusCode === 401) {
      return res.status(401).json({
        success: false,
        message: err.message || 'Invalid credentials',
        errors: [],
        statusCode: 401,
      });
    }
    console.error('Login error:', err && err.message ? err.message : err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [],
      statusCode: 500,
    });
  }
}

/**
 * Protected profile endpoint.
 * Fetches full user details from the database.
 */
export async function me(req, res) {
  try {
    const userId = req.user && req.user.id;
    const User = (await import('../models/user.model.js')).default;
    const user = await User.findById(userId).lean().exec();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: [],
        statusCode: 404,
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Authenticated user retrieved successfully',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name || null,
          phone: user.phone || null,
          profileImage: user.profileImage || null,
        }
      },
    });
  } catch (e) {
    console.error('me controller error:', e.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [],
      statusCode: 500,
    });
  }
}

/**
 * Update authenticated user's profile details.
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user && req.user.id;
    const { name, phone, profileImage } = req.body;

    const User = (await import('../models/user.model.js')).default;
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: [],
        statusCode: 404,
      });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name || null,
          phone: user.phone || null,
          profileImage: user.profileImage || null,
        },
      },
    });
  } catch (err) {
    console.error('Update profile error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [],
      statusCode: 500,
    });
  }
}
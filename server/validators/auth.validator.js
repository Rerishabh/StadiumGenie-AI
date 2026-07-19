import { body, validationResult } from 'express-validator';

/**
 * Validation middleware arrays for auth routes.
 * Exported validators are arrays suitable for use directly on routes, e.g.:
 * router.post('/register', registerValidation);
 */

export const registerValidation = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('name').optional().isString().trim().isLength({ max: 100 }).withMessage('Name too long'),
  body('phone')
    .optional({ values: 'null' })
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid phone number'),
  // result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    const formatted = errors.array().map((e) => ({ field: e.param, message: e.msg }));
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: formatted,
      statusCode: 422,
    });
  },
];

export const loginValidation = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').exists().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    const formatted = errors.array().map((e) => ({ field: e.param, message: e.msg }));
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: formatted,
      statusCode: 422,
    });
  },
];
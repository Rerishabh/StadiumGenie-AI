import express from 'express';
import { createBookingValidation, cancelBookingValidation } from '../validators/booking.validator.js';
import * as controller from '../controllers/booking.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes protected
router.post('/', authMiddleware, createBookingValidation, controller.create);
router.get('/', authMiddleware, controller.list);
router.get('/:id', authMiddleware, cancelBookingValidation, controller.getById);
router.delete('/:id', authMiddleware, cancelBookingValidation, controller.remove);

export default router;
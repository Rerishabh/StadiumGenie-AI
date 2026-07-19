import express from 'express';
import * as controller from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router = express.Router();

router.get('/dashboard', authMiddleware, adminMiddleware, controller.dashboard);
router.get('/recent-bookings', authMiddleware, adminMiddleware, controller.recentBookings);
router.get('/recent-payments', authMiddleware, adminMiddleware, controller.recentPayments);
router.get('/recent-tickets', authMiddleware, adminMiddleware, controller.recentTickets);
router.get('/events', authMiddleware, adminMiddleware, controller.eventsStats);
router.get('/stadiums', authMiddleware, adminMiddleware, controller.stadiumsStats);
router.get('/bookings', authMiddleware, adminMiddleware, controller.listBookings);
router.get('/users', authMiddleware, adminMiddleware, controller.listUsers);

export default router;
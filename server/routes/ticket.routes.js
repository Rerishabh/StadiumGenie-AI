import express from 'express';
import * as controller from '../controllers/ticket.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getTicketValidation } from '../validators/ticket.validator.js';

const router = express.Router();

router.get('/', authMiddleware, controller.listTickets);
router.get('/public/verify/:ticketNumber', controller.verifyPublic);
router.post('/public/admit/:ticketNumber', controller.admitPublic);
router.get('/:id', authMiddleware, getTicketValidation, controller.getTicketById);

export default router;
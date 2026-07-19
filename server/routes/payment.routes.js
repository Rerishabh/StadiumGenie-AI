import express from 'express';
import { createPaymentValidation, getPaymentValidation } from '../validators/payment.validator.js';
import * as controller from '../controllers/payment.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, createPaymentValidation, controller.create);
router.post('/confirm', authMiddleware, controller.confirm);
router.post('/webhook', controller.handleWebhook);
router.get('/', authMiddleware, controller.list);
router.get('/:id', authMiddleware, getPaymentValidation, controller.getById);

export default router;
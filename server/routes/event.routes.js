import express from 'express';
import { getAllValidation, createEventValidation, updateEventValidation } from '../validators/event.validator.js';
import * as controller from '../controllers/event.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
 
const router = express.Router();
 
// Public
router.get('/', getAllValidation, controller.list);
router.get('/:id', controller.getById);
 
// Protected
router.post('/', authMiddleware, adminMiddleware, createEventValidation, controller.create);
router.put('/:id', authMiddleware, adminMiddleware, updateEventValidation, controller.update);
router.delete('/:id', authMiddleware, adminMiddleware, controller.remove);
 
export default router;

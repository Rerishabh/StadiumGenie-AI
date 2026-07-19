import express from 'express';
import { getAllValidation, createStadiumValidation, updateStadiumValidation } from '../validators/stadium.validator.js';
import * as controller from '../controllers/stadium.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
 
const router = express.Router();
 
// Public
router.get('/', getAllValidation, controller.list);
router.get('/:id', controller.getById);
 
// Protected
router.post('/', authMiddleware, adminMiddleware, createStadiumValidation, controller.create);
router.put('/:id', authMiddleware, adminMiddleware, updateStadiumValidation, controller.update);
router.delete('/:id', authMiddleware, adminMiddleware, controller.remove);
 
export default router;

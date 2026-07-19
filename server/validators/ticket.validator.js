import { param } from 'express-validator';
import mongoose from 'mongoose';

// No public create validation — tickets are created internally by service
export const getTicketValidation = [
  param('id').custom((v) => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid ticket id'),
];
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import stadiumRoutes from './routes/stadium.routes.js';
import eventRoutes from './routes/event.routes.js';
 
dotenv.config();
 
const app = express();
 
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl && req.originalUrl.includes('/webhook')) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
 
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
 
// Mount auth routes
app.use('/api/v1/auth', authRoutes);
 
 // Mount stadium routes
app.use('/api/v1/stadiums', stadiumRoutes);
 
 // Mount event routes
app.use('/api/v1/events', eventRoutes);
 
 // Mount booking routes
import bookingRoutes from './routes/booking.routes.js';
app.use('/api/v1/bookings', bookingRoutes);
 
 // Mount payment routes
import paymentRoutes from './routes/payment.routes.js';
app.use('/api/v1/payments', paymentRoutes);
 
 // Mount ticket routes
import ticketRoutes from './routes/ticket.routes.js';
app.use('/api/v1/tickets', ticketRoutes);
 
 // Mount admin routes
import adminRoutes from './routes/admin.routes.js';
app.use('/api/v1/admin', adminRoutes);

 // Mount AI routes (GenAI Stadium Assistant)
import aiRoutes from './routes/ai.routes.js';
app.use('/api/v1/ai', aiRoutes);
 
 // Setup Swagger UI if available
import { setupSwagger } from './swagger.js';
try {
  setupSwagger(app);
} catch (e) {
  // if swagger deps are not installed or fail, continue silently
  // server operation should not be blocked by docs
  // eslint-disable-next-line no-console
  console.warn('Swagger UI not available:', e && e.message ? e.message : e);
}
 
// Seeds (developer): run via node server/seeds/seed.js when needed
// Note: seed script will be committed but not executed automatically.
 
export default app;

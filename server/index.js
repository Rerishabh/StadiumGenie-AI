import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import mongoose from 'mongoose';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    console.log('✅ MongoDB Connected');

    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    const graceful = async () => {
      console.log('Shutting down...');
      server.close(() => {
        console.log('HTTP server closed');
      });
      try {
        await mongoose.connection.close(false);
        console.log('MongoDB connection closed');
      } catch (e) {
        // ignore
      }
      process.exit(0);
    };

    process.on('SIGINT', graceful);
    process.on('SIGTERM', graceful);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

start();

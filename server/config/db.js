import mongoose from 'mongoose';

/**
 * Exports a connectDB function that connects to MongoDB.
 * The function reads the connection URI from process.env.MONGODB_URI.
 * Do NOT call this function automatically — the app should call it when ready.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MongoDB connection URI is required in MONGODB_URI');
  }

  // Connection event handlers for observability (no secrets logged)
  mongoose.connection.on('connected', () => {
    // connection established
    // keep message minimal; the index.js will print final confirmation
    console.debug('Mongoose: connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err && err.message ? err.message : err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose: disconnected');
  });

  // Use a conservative serverSelectionTimeoutMS; avoid deprecated options.
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });

  // Safe migration: Drop old standard unique indexes if they don't have partialFilterExpression
  try {
    const db = conn.connection.db;
    const stadiaColl = db.collection('stadia');
    const indexes = await stadiaColl.indexes();
    for (const idx of indexes) {
      if ((idx.name === 'name_1' || idx.name === 'slug_1') && !idx.partialFilterExpression) {
        console.log(`Dropping old legacy unique index: ${idx.name}`);
        await stadiaColl.dropIndex(idx.name);
      }
    }

    const ticketsColl = db.collection('tickets');
    const ticketIdxs = await ticketsColl.indexes();
    for (const idx of ticketIdxs) {
      if ((idx.name === 'bookingId_1' || idx.name === 'paymentId_1') && idx.unique) {
        console.log(`Dropping old unique ticket index: ${idx.name}`);
        await ticketsColl.dropIndex(idx.name);
      }
    }
  } catch (err) {
    console.debug('Legacy index cleanup skipped or failed:', err.message);
  }

  return conn;
}

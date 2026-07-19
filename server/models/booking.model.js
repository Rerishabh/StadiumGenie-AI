import mongoose from 'mongoose';

const { Schema } = mongoose;

const BookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    bookingNumber: { type: String, required: true, unique: true, trim: true },
    quantity: { type: Number, required: true, min: 1, validate: { validator: Number.isInteger, message: 'quantity must be integer' } },
    totalAmount: { type: Number, required: true, min: 0 },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'expired'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'bookedAt', updatedAt: 'updatedAt' } }
);

// indexes
BookingSchema.index({ bookingNumber: 1 }, { unique: true });
BookingSchema.index({ userId: 1 });
BookingSchema.index({ eventId: 1 });

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

export default Booking;
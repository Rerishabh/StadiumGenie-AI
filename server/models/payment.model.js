import mongoose from 'mongoose';

const { Schema } = mongoose;

const PaymentSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    paymentReference: { type: String, required: true, unique: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'cash'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    transactionDate: { type: Date, default: Date.now },
    gateway: { type: String, default: 'Development Simulator' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PaymentSchema.index({ paymentReference: 1 }, { unique: true });
PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ userId: 1 });

const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

export default Payment;
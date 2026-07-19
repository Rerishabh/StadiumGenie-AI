import mongoose from 'mongoose';

const { Schema } = mongoose;

const TicketSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stadiumId: { type: Schema.Types.ObjectId, ref: 'Stadium', required: true },
    ticketNumber: { type: String, required: true, unique: true, trim: true },
    qrCode: { type: String, required: true },
    ticketStatus: { type: String, enum: ['active', 'used', 'cancelled'], default: 'active', index: true },
    issuedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TicketSchema.index({ ticketNumber: 1 }, { unique: true });
TicketSchema.index({ bookingId: 1 });
TicketSchema.index({ paymentId: 1 });

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);

export default Ticket;
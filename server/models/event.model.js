import mongoose from 'mongoose';

const { Schema } = mongoose;

function slugify(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
  },
  { _id: false }
);

const EventSchema = new Schema(
  {
    stadiumId: { type: Schema.Types.ObjectId, ref: 'Stadium', required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    sport: { type: String, trim: true, index: true },
    organizer: { type: String, trim: true },
    bannerImage: { type: ImageSchema, default: null },
    startDateTime: { type: Date, required: true, index: true },
    endDateTime: { type: Date, required: true },
    ticketBookingStart: { type: Date },
    ticketBookingEnd: { type: Date },
    totalSeats: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'totalSeats must be an integer',
      },
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'availableSeats must be an integer',
      },
    },
    price: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Generate slug only on creation
EventSchema.pre('validate', async function () {
  if (!this.slug && this.isNew) {
    let base = slugify(this.title || 'event');
    let candidate = base;
    let counter = 1;
    const Model = mongoose.models.Event || mongoose.model('Event', EventSchema);
    // eslint-disable-next-line no-await-in-loop
    while (await Model.findOne({ slug: candidate }).lean().exec()) {
      counter += 1;
      candidate = `${base}-${counter}`;
    }
    this.slug = candidate;
  }
});

EventSchema.index({ title: 'text', description: 'text' });

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

export default Event;
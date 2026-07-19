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

const GeoPointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  { _id: false }
);

const StadiumSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    state: { type: String, trim: true, index: true },
    country: { type: String, trim: true, index: true },
    address: { type: String, trim: true },
    description: { type: String, trim: true },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Capacity must be a positive integer',
      },
    },
    // Flat convenience fields (used by Stadium Management UI)
    imageUrl: { type: String, trim: true },
    facilities: [{ type: String, trim: true }],
    latitude: { type: Number },
    longitude: { type: Number },
    // Rich nested fields retained for full feature support
    sportsSupported: [{ type: String, trim: true, index: true }],
    amenities: [{ type: String, trim: true }],
    images: [ImageSchema],
    location: { type: GeoPointSchema, default: () => ({}) },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

 // Generate slug only on creation
StadiumSchema.pre('validate', async function () {
  if (!this.slug && this.isNew) {
    let base = slugify(this.name || 'stadium');
    let candidate = base;
    let counter = 1;
    // ensure uniqueness
    // eslint-disable-next-line no-underscore-dangle
    const Model = mongoose.models.Stadium || mongoose.model('Stadium', StadiumSchema);
    // loop until unique
    // Use findOne directly to check existence
    // (small race condition acceptable for this phase)
    // eslint-disable-next-line no-await-in-loop
    while (await Model.findOne({ slug: candidate }).lean().exec()) {
      counter += 1;
      candidate = `${base}-${counter}`;
    }
    this.slug = candidate;
  }
});

// Indexes
StadiumSchema.index({ name: 'text', description: 'text' });
StadiumSchema.index({ location: '2dsphere' });
StadiumSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { isActive: true } });
StadiumSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

const Stadium = mongoose.models.Stadium || mongoose.model('Stadium', StadiumSchema);

export default Stadium;
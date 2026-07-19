import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const roles = ['attendee', 'staff', 'admin'];

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: { type: String },
    phone: { type: String },
    profileImage: { type: String },
    role: { type: String, enum: roles, default: 'attendee' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

 // Pre-save hook: hash password when modified (async/Promise style)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
  const hash = await bcrypt.hash(this.password, saltRounds);
  this.password = hash;
});

// Instance method to compare password (helper for future use)
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
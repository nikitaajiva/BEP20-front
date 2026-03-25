import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    match: [/.+\\@.+\\..+/, 'Please fill a valid email address']
  },
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    unique: true,
    trim: true,
    minlength: 3
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: 6,
    select: false // Do not return password by default
  },
  country: {
    type: String,
    // required: [true, 'Please provide your country.']
  },
  countryCode: {
    type: String,
    // required: [true, 'Please provide your country code.']
  },
  whatsappContact: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: String,
  otpExpiry: Date,
  googleId: String, // for Google sign-in users (if you implement it)
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export the model, ensuring it's not re-defined if already compiled
export default mongoose.models.User || mongoose.model('User', UserSchema);

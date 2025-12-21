const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user','seller','admin'], default: 'user' },
  isSellerApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }, // Account active status
  sellerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile' }, // Reference to seller profile
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  // OTP fields for email login
  otpCode: String,
  otpExpires: Date,
  otpAttempts: { type: Number, default: 0, max: 5 },
}, {
  timestamps: true
});

userSchema.pre('save', async function(next){
  // Hash password if it's provided and modified
  if (this.password && this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate OTP for email login
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.otpCode = otp;
  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
  this.otpAttempts = 0;
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(enteredOTP) {
  if (this.otpAttempts >= 5) {
    return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }

  if (Date.now() > this.otpExpires) {
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (this.otpCode === enteredOTP) {
    // Clear OTP after successful verification
    this.otpCode = undefined;
    this.otpExpires = undefined;
    this.otpAttempts = 0;
    return { valid: true, message: 'OTP verified successfully' };
  } else {
    this.otpAttempts += 1;
    return { valid: false, message: 'Invalid OTP code' };
  }
};

// Check if OTP is still valid
userSchema.methods.isOTPValid = function() {
  return this.otpCode && this.otpExpires && Date.now() < this.otpExpires && this.otpAttempts < 5;
};

module.exports = mongoose.model('User', userSchema);

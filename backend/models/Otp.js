const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    required: true
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    index: { expires: '10m' } // OTP expires in 10 minutes
  }
}, {
  timestamps: true
});

// Method to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to create and save OTP
otpSchema.statics.createOTP = async function(email, type) {
  // Delete any existing OTP for this email and type
  await this.deleteMany({ email, type });
  
  // Create new OTP
  const otp = generateOTP();
  const otpDoc = new this({
    email,
    otp,
    type
  });
  
  await otpDoc.save();
  return otp;
};

// Verify OTP
otpSchema.statics.verifyOTP = async function(email, otp, type) {
  const otpDoc = await this.findOneAndDelete({
    email,
    otp,
    type,
    expiresAt: { $gt: new Date() }
  });
  
  return !!otpDoc;
};

module.exports = mongoose.model('OTP', otpSchema);

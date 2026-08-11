const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['citizen', 'staff', 'admin', 'moderator'],
    default: 'citizen'
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'India' }
  },
  permanentAddress: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: false }, // [longitude, latitude]
    formattedAddress: String,
    wardNumber: String,
    pincode: String
  },
  feedRadiusKm: { type: Number, default: 3 },
  profileImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  // For staff members
  department: {
    type: String,
    enum: ['public_works', 'sanitation', 'electrical', 'water', 'traffic', 'general'],
    required: function() { return this.role === 'staff'; }
  },
  staffId: {
    type: String,
    unique: true,
    sparse: true // Only unique if not null
  },
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  // Staff hierarchy for SLA escalation
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  staffTier: {
    type: Number,
    enum: [1, 2], // 1: Field Staff (STAFF_TIER_1), 2: Supervisor/Ward Officer (STAFF_TIER_2)
    default: 1
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ "permanentAddress.coordinates": "2dsphere" });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate staff ID
userSchema.pre('save', function(next) {
  if (this.role === 'staff' && !this.staffId) {
    this.staffId = `STAFF${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

// Virtuals for name formatting
userSchema.virtual('displayName').get(function() {
  return this.name;
});

// Transform output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  userObject.id = userObject._id.toString();
  userObject.userType = userObject.role;
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.__v;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
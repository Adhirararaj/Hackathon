const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: false
  },
  
  // Account Information (from activate page)
  account: {
    accountNo: {
      type: String,
      required: false,
      unique: true,
      sparse: true
    },
    ifscCode: {
      type: String,
      required: false,
      uppercase: true
    },
    branch: {
      type: String,
      required: false,
      trim: true
    },
    isLinked: {
      type: Boolean,
      default: false
    }
  },
  
  // User Preferences
  language: {
    type: String,
    enum: ['en', 'hi', 'te', 'ta', 'bn', 'mr', 'gu'],
    default: 'en'
  },
  
  // Authentication
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Statistics
  totalQuestions: {
    type: Number,
    default: 0
  },
  totalDocuments: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
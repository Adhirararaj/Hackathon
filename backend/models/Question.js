const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Question Data
  text: {
    type: String,
    required: true,
    trim: true
  },
  
  // Input Method (from tabs in home page)
  inputType: {
    type: String,
    enum: ['voice', 'text', 'doc'],
    required: true
  },
  
  // Language
  language: {
    type: String,
    enum: ['en', 'hi', 'te', 'ta', 'bn', 'mr', 'gu'],
    default: 'en'
  },
  
  // Response Data
  answer: {
    type: String,
    required: false
  },
  
  // Related Documents
  relevantDocs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  
  // Processing Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Voice Data (if voice input)
  voiceData: {
    transcript: String,
    confidence: Number,
    duration: Number
  },
  
  // Feedback
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Question', questionSchema);
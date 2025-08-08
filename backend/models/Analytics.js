const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  
  // Daily metrics
  metrics: {
    totalUsers: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    totalDocuments: { type: Number, default: 0 },
    
    // Fix: Properly define the array structure
    languageDistribution: [{
      language: {
        type: String,
        enum: ['en', 'hi', 'te', 'ta', 'bn', 'mr', 'gu']
      },
      count: {
        type: Number,
        default: 0
      }
    }],
    
    // Fix: Properly define the array structure  
    inputTypeDistribution: [{
      type: {
        type: String,
        enum: ['text', 'voice', 'doc']
      },
      count: {
        type: Number,
        default: 0
      }
    }],
    
    // Response times
    avgResponseTime: { type: Number, default: 0 },
    
    // Success rates
    successRate: { type: Number, default: 0, min: 0, max: 1 }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
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
    
    // By language
    languageDistribution: [{
      language: String,
      count: Number
    }],
    
    // By input type
    inputTypeDistribution: [{
      type: String,
      count: Number
    }],
    
    // Response times
    avgResponseTime: { type: Number, default: 0 },
    
    // Success rates
    successRate: { type: Number, default: 0 }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
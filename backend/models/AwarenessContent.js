const mongoose = require('mongoose');

const awarenessContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  content: {
    type: String,
    required: true
  },
  
  // Multilingual support
  translations: [{
    language: {
      type: String,
      enum: ['en', 'hi', 'te', 'ta', 'bn', 'mr', 'gu']
    },
    title: String,
    content: String
  }],
  
  category: {
    type: String,
    enum: ['banking', 'government', 'healthcare', 'education', 'legal', 'general'],
    required: true
  },
  
  tags: [String],
  
  // SEO
  slug: {
    type: String,
    unique: true,
    required: true
  },
  
  // Status
  isPublished: {
    type: Boolean,
    default: false
  },
  
  // Statistics
  views: {
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

module.exports = mongoose.model('AwarenessContent', awarenessContentSchema);
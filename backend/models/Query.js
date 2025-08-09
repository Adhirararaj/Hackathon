const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  voiceData: {
    type: String,
  },

  text: {
    type: String,
  },
  
  language: {
    type: String,
    enum: ['en', 'hi', 'mr', 'ta', 'bn', 'te', 'gu'],
    default: 'en',
    required: true
  },
  
  shortAnswer: {
    type: String,
  },

  longAnswer: {
    type: String,
  },
  
  providedDoc: {
    type: String,
  },

});

module.exports = mongoose.model('query', questionSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  language: {
    type: String,
    enum: ['en', 'hi', 'mr', 'ta', 'bn', 'te', 'gu'],
    default: 'en',
    required: true
  },
  
  phoneNo: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },

  fullname: {
    type: String,
  },
  accountNo: {
    type: String,
    required: false,
  },
  ifscCode: {
    type: String,
    required: false,
  },
  branch: {
    type: String,
    required: false,
  },

  isLinked: {
    type: Boolean,
    default: false
  },
  
  queries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "query"
  }],

});

module.exports = mongoose.model('user', userSchema);
const mongoose = require('mongoose');

const shortUrlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true
  },
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5 * 24 * 60 * 60 // 5 days expiry
  }
});

module.exports = mongoose.model('ShortUrl', shortUrlSchema);
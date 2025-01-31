const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  questionType: {
    type: String,
    required: true,
    enum: ['multiple-choice', 'text', 'rating', 'checkbox'],
  },
  options: [{
    type: String,
    trim: true
  }],
  required: {
    type: Boolean,
    default: false
  }
});

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  isPublic: {
    type: Boolean,
    default: true
  },
  shareableLink: {
    type: String,
    unique: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  responses: [{
    respondent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answers: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      answer: mongoose.Schema.Types.Mixed
    }],
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Generate shareable link before saving
surveySchema.pre('save', function(next) {
  if (!this.shareableLink) {
    this.shareableLink = `${this._id}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;
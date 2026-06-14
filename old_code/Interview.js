const mongoose = require('mongoose');

const questionResponseSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: String,
  rating: { type: Number, min: 1, max: 10 },
  feedback: String,
  timeTaken: Number
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['tech', 'commerce', 'hr', 'custom'],
    default: 'tech'
  },
  questionsAsked: [questionResponseSchema],
  overallRating: {
    type: Number,
    min: 0,
    max: 10
  },
  strengths: [String],
  improvements: [String],
  duration: Number,
  attemptNumber: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

interviewSchema.index({ studentId: 1, createdAt: -1 });
interviewSchema.index({ collegeId: 1, createdAt: -1 });
interviewSchema.index({ studentId: 1, category: 1 });

module.exports = mongoose.model('Interview', interviewSchema);

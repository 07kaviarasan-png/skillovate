const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  correct: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 }
}, { _id: false });

const answerSchema = new mongoose.Schema({
  questionIndex: Number,
  selected: Number,
  correct: Number,
  isCorrect: Boolean,
  timeTaken: Number
}, { _id: false });

const testAttemptSchema = new mongoose.Schema({
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
  testType: {
    type: String,
    enum: ['aptitude', 'mnc_simulation', 'scheduled'],
    required: true
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: false
  },
  testName: {
    type: String,
    required: true
  },
  companyName: String,
  score: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  timeTaken: Number,
  sections: [sectionSchema],
  answers: [answerSchema],
  weakAreas: [String],
  passed: Boolean,
  department: {
    type: String,
    trim: true
  },
  attemptNumber: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

testAttemptSchema.index({ studentId: 1, createdAt: -1 });
testAttemptSchema.index({ collegeId: 1, createdAt: -1 });
testAttemptSchema.index({ studentId: 1, testType: 1 });
testAttemptSchema.index({ collegeId: 1, testType: 1, percentage: -1 });

module.exports = mongoose.model('TestAttempt', testAttemptSchema);

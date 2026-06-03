const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
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
  jobTitle: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  salaryRange: String,
  jobType: {
    type: String,
    enum: ['full_time', 'internship', 'contract', 'part_time'],
    default: 'full_time'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  responseData: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

applicationSchema.index({ studentId: 1, status: 1 });
applicationSchema.index({ collegeId: 1, companyName: 1 });
applicationSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);

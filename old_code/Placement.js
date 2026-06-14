const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
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
  companyName: {
    type: String,
    required: [true, 'Company name is required']
  },
  role: {
    type: String,
    required: [true, 'Job role is required']
  },
  salaryLPA: {
    type: Number,
    required: [true, 'Salary is required']
  },
  workType: {
    type: String,
    enum: ['onsite', 'remote', 'hybrid'],
    default: 'onsite'
  },
  mode: {
    type: String,
    enum: ['campus', 'off_campus'],
    default: 'campus'
  },
  location: String,
  offerDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['applying', 'placed', 'rejected'],
    default: 'placed'
  },
  proofUrl: String,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

placementSchema.index({ studentId: 1 });
placementSchema.index({ collegeId: 1, status: 1 });
placementSchema.index({ collegeId: 1, companyName: 1 });
placementSchema.index({ collegeId: 1, salaryLPA: -1 });

module.exports = mongoose.model('Placement', placementSchema);

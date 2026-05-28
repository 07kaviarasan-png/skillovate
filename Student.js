const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  college_id: {
    type: String, // Can be Name or ID as per user spec
    required: [true, 'College name or ID is required'],
    trim: true
  },
  roll_no: {
    type: String,
    required: [true, 'Roll number is required'],
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  records: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  resumeData: {
    type: mongoose.Schema.Types.Mixed, // Stores name, summary, education, experience etc
    default: {}
  },
  jobApplications: [{
    jobId: String,
    title: String,
    company: String,
    status: { type: String, default: 'pending' },
    appliedAt: { type: Date, default: Date.now }
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Track session creation and updates for deduplication
});

// 🛡️ COMPOUND UNIQUE CONSTRAINT
// Enforce that roll_no must be unique within a specific college
studentSchema.index({ college_id: 1, roll_no: 1 }, { unique: true });

// Optimize queries for fast lookup
studentSchema.index({ roll_no: 1 });
studentSchema.index({ college_id: 1 });

module.exports = mongoose.model('Student', studentSchema);

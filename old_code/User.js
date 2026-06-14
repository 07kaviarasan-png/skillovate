const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  studentId: {
    type: String,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'college_admin', 'super_admin', 'recruiter'],
    default: 'student'
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: function() { 
      // Not required for super_admin or recruiters (who use 'company' instead)
      return this.role !== 'super_admin' && this.role !== 'recruiter'; 
    }
  },
  company: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  year: Number,
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  skills: [String],
  resumeUrl: String,
  // ════════ IDENTITY & SESSION ════════
  lastSession: {
    selectedCollege: String,
    rollNo: String,
    lastActivePage: { type: String, default: 'dash' },
    lastVisitedModule: String
  },
  preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
  savedData: { type: mongoose.Schema.Types.Mixed, default: {} },

  // ════════ PROGRESS TRACKING ════════
  progress: {
    mockTests: [{
      testId: String,
      score: Number,
      completedAt: { type: Date, default: Date.now }
    }],
    interviews: [{
      company: String,
      status: String,
      date: { type: Date, default: Date.now }
    }],
    placement: {
      status: { type: String, default: 'unplaced' },
      company: String,
      lpa: Number,
      mode: String
    },
    // Preserve existing Skillovate-specific fields
    resumeData: { type: mongoose.Schema.Types.Mixed, default: {} },
    trackProgress: { type: Map, of: Number, default: {} }, // 🛰️ Persistent question tracking (Subject -> Index)
    jobApplications: [{
      jobId: String,
      title: String,
      company: String,
      status: { type: String, default: 'pending' },
      appliedAt: { type: Date, default: Date.now }
    }]
  },

  // ════════ ACHIEVEMENTS & METRICS ════════
  achievements: [{
    title: String,
    date: { type: Date, default: Date.now }
  }],
  
  stats: {
    testsCompleted: { type: Number, default: 0 },
    avgAccuracy: { type: Number, default: 0 },
    interviewsCompleted: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    nationalRank: Number
  },

  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
}, {
  timestamps: true
});

// Compound index: studentId unique within a college (only for documents where studentId exists)
userSchema.index(
  { collegeId: 1, studentId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { studentId: { $exists: true, $gt: "" } } 
  }
);
userSchema.index({ role: 1, collegeId: 1 });
userSchema.index({ collegeId: 1, department: 1, year: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  actor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be null for login attempts
  },
  action_type: {
    type: String,
    enum: ['STUDENT_QUERY', 'DATA_SYNC', 'AUTH_ATTEMPT', 'BATCH_RECOVERY'],
    required: true
  },
  target_id: String, // e.g., Roll No
  college_id: String,
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'DENIED'],
    default: 'SUCCESS'
  },
  metadata: {
    type: mongoose.Schema.Types.Map,
    of: mongoose.Schema.Types.Mixed
  },
  ip_address: String,
  user_agent: String
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Indexes for fast auditing
activityLogSchema.index({ college_id: 1, createdAt: -1 });
activityLogSchema.index({ action_type: 1, createdAt: -1 });
activityLogSchema.index({ target_id: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);

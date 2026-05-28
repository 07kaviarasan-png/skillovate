const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'College name is required'],
    unique: true,
    trim: true
  },
  shortCode: {
    type: String,
    required: [true, 'Short code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  location: {
    type: String,
    default: 'Coimbatore'
  },
  departments: {
    type: [String],
    default: ['CSE', 'ECE', 'Mechanical', 'Civil', 'EEE']
  },
  contactEmail: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

collegeSchema.index({ isActive: 1 });

module.exports = mongoose.model('College', collegeSchema);

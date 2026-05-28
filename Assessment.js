// Assessment model for College Admin created assessments

const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['quantitative', 'verbal', 'logical', 'di', 'mixed'], required: true },
  questionCount: { type: Number, required: true },
  duration: { type: Number, required: true }, // minutes
  departments: [{ type: String, required: true }], // e.g., ['CSE', 'IT'] or ['All']
  dueDate: { type: Date },
  status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  negativeMarking: { type: Boolean, default: false },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Assessment', assessmentSchema);

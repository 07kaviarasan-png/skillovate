const Interview = require('./Interview');
const User = require('./User');
const { paginate } = require('./pagination');
const { evaluateAfterInterview } = require('./achievementEngine');

// GET /api/students/:id/interviews
exports.getInterviewHistory = async (req, res) => {
  try {
    const filter = { studentId: req.params.id };
    if (req.query.category) filter.category = req.query.category;
    if (req.collegeScope) filter.collegeId = req.collegeScope;

    const result = await paginate(Interview, filter, req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/students/:id/interviews
exports.submitInterview = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (req.user.role === 'student' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Cannot submit for another student' });
    }

    const prevAttempts = await Interview.countDocuments({
      studentId: req.params.id,
      role: req.body.role
    });

    const interview = await Interview.create({
      ...req.body,
      studentId: req.params.id,
      collegeId: student.collegeId,
      attemptNumber: prevAttempts + 1
    });

    // Update stats
    const total = await Interview.countDocuments({ studentId: req.params.id });
    await User.findByIdAndUpdate(req.params.id, {
      'stats.interviewsCompleted': total
    });

    // Trigger achievement evaluation
    const achievements = await evaluateAfterInterview(req.params.id, student.collegeId, interview);

    res.status(201).json({ success: true, data: interview, achievementsAwarded: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

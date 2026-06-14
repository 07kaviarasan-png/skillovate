const Placement = require('./Placement');
const User = require('./User');
const { paginate } = require('./pagination');
const { evaluateAfterPlacement } = require('./achievementEngine');

// GET /api/students/:id/placements
exports.getStudentPlacements = async (req, res) => {
  try {
    const filter = { studentId: req.params.id };
    if (req.collegeScope) filter.collegeId = req.collegeScope;

    const result = await paginate(Placement, filter, req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/placements — All placements (admin)
exports.listPlacements = async (req, res) => {
  try {
    const filter = {};
    if (req.collegeScope) filter.collegeId = req.collegeScope;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.company) filter.companyName = { $regex: req.query.company, $options: 'i' };
    if (req.query.verification) filter.verificationStatus = req.query.verification;

    const result = await paginate(Placement, filter, req.query, 'studentId');
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/placements
exports.createPlacement = async (req, res) => {
  try {
    const student = await User.findById(req.body.studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const placement = await Placement.create({
      ...req.body,
      collegeId: student.collegeId
    });

    // Trigger achievement evaluation
    const achievements = await evaluateAfterPlacement(req.body.studentId, student.collegeId, placement);

    res.status(201).json({ success: true, data: placement, achievementsAwarded: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/placements/:id/verify
exports.verifyPlacement = async (req, res) => {
  try {
    const { verificationStatus } = req.body;
    if (!['verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: 'Status must be verified or rejected' });
    }

    const placement = await Placement.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus,
        verifiedBy: req.user._id
      },
      { new: true }
    ).populate('studentId', 'name studentId');

    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement not found' });
    }

    // College scope check
    if (req.collegeScope && !placement.collegeId.equals(req.collegeScope)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: placement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

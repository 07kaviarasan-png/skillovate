const Achievement = require('./Achievement');
const User = require('./User');
const { paginate } = require('./pagination');
const { evaluateEngagement } = require('./achievementEngine');

// GET /api/students/:id/achievements
exports.getStudentAchievements = async (req, res) => {
  try {
    const filter = { studentId: req.params.id };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.sourceModule) filter.sourceModule = req.query.sourceModule;
    if (req.collegeScope) filter.collegeId = req.collegeScope;

    const result = await paginate(Achievement, filter, {
      ...req.query,
      sort: req.query.sort || 'achievedAt',
      order: req.query.order || 'desc'
    });

    // Also return summary counts
    const summary = await Achievement.aggregate([
      { $match: { studentId: require('mongoose').Types.ObjectId.createFromHexString(req.params.id) } },
      { $group: { _id: '$sourceModule', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      ...result,
      summary: summary.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {})
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leaderboard — Achievement-based leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const matchFilter = {};
    if (req.collegeScope) matchFilter.collegeId = req.collegeScope;
    if (req.query.college) matchFilter.collegeId = require('mongoose').Types.ObjectId.createFromHexString(req.query.college);

    const leaderboard = await Achievement.aggregate([
      { $match: matchFilter },
      { $group: {
        _id: '$studentId',
        totalAchievements: { $sum: 1 },
        latestAchievement: { $max: '$achievedAt' },
        types: { $addToSet: '$type' }
      }},
      { $sort: { totalAchievements: -1 } },
      { $limit: parseInt(req.query.limit) || 50 },
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        pipeline: [{ $project: { name: 1, studentId: 1, department: 1, collegeId: 1, stats: 1 } }],
        as: 'student'
      }},
      { $unwind: '$student' },
      { $lookup: {
        from: 'colleges',
        localField: 'student.collegeId',
        foreignField: '_id',
        pipeline: [{ $project: { name: 1, shortCode: 1 } }],
        as: 'college'
      }},
      { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
      { $project: {
        student: 1,
        college: 1,
        totalAchievements: 1,
        latestAchievement: 1,
        badgeCount: { $size: '$types' }
      }}
    ]);

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/students/:id/achievements/evaluate — Trigger engagement evaluation
exports.triggerEvaluation = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const awarded = await evaluateEngagement(user._id, user.collegeId);
    res.json({ success: true, awarded });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

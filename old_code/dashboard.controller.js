const User = require('./User');
const TestAttempt = require('./TestAttempt');
const Interview = require('./Interview');
const Placement = require('./Placement');
const College = require('./College');

// GET /api/dashboard/student/:id
exports.studentDashboard = async (req, res) => {
  try {
    const studentId = req.params.id;

    const [student, recentTests, recentInterviews, placements] = await Promise.all([
      User.findById(studentId).populate('collegeId', 'name shortCode').lean(),
      TestAttempt.find({ studentId }).sort({ createdAt: -1 }).limit(5).lean(),
      Interview.find({ studentId }).sort({ createdAt: -1 }).limit(3).lean(),
      Placement.find({ studentId }).lean()
    ]);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({
      success: true,
      data: {
        profile: student,
        stats: student.stats,
        recentTests,
        recentInterviews,
        placements,
        upcomingTests: [] // placeholder for scheduled tests
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/admin
exports.adminDashboard = async (req, res) => {
  try {
    const collegeFilter = req.collegeScope ? { collegeId: req.collegeScope } : {};
    const userFilter = { ...collegeFilter, role: 'student' };

      const [
        totalStudents,
        totalFaculty,
        totalApplying,
        totalRejected,
        placedStudents,
        onCampusCount,
        offCampusCount,
        salaryStats,
        topPerformers,
        recentPlacements,
        departmentBreakdown
      ] = await Promise.all([
        User.countDocuments(userFilter),
        User.countDocuments({ ...collegeFilter, role: 'faculty' }),
        Placement.countDocuments({ ...collegeFilter, status: 'applying' }),
        Placement.countDocuments({ ...collegeFilter, status: 'rejected' }),
        Placement.distinct('studentId', { ...collegeFilter, status: 'placed' }),
        Placement.countDocuments({ ...collegeFilter, status: 'placed', mode: 'campus' }),
        Placement.countDocuments({ ...collegeFilter, status: 'placed', mode: 'off_campus' }),
        Placement.aggregate([
          { $match: { ...collegeFilter, status: 'placed' } },
          { $group: { _id: null, avg: { $avg: '$salaryLPA' }, max: { $max: '$salaryLPA' }, min: { $min: '$salaryLPA' } } }
        ]),
        User.find(userFilter)
          .sort({ 'stats.avgAccuracy': -1 })
          .limit(10)
          .select('name studentId department stats')
          .lean(),
        Placement.find(collegeFilter)
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('studentId', 'name studentId department')
          .lean(),
        User.aggregate([
          { $match: userFilter },
          { $group: { _id: '$department', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);

      const placedCount = placedStudents.length;

      res.json({
        success: true,
        data: {
          overview: {
            totalStudents,
            totalFaculty,
            totalApplying,
            totalRejected,
            totalPlaced: placedCount,
            uniquePlacedStudents: placedCount,
            onCampusCount,
            offCampusCount,
            notPlacedCount: totalStudents - placedCount,
            placementRate: totalStudents > 0
              ? Math.round((placedCount / totalStudents) * 100)
              : 0,
            avgSalary: salaryStats[0]?.avg?.toFixed(1) || 0,
            maxSalary: salaryStats[0]?.max || 0,
            minSalary: salaryStats[0]?.min || 0
          },
        topPerformers,
        recentPlacements,
        departmentBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/super
exports.superDashboard = async (req, res) => {
  try {
    const [
      colleges,
      totalStudents,
      totalPlacements,
      collegeStats
    ] = await Promise.all([
      College.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'student' }),
      Placement.countDocuments({ status: 'placed' }),
      College.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'collegeId',
            pipeline: [{ $match: { role: 'student' } }],
            as: 'students'
          }
        },
        {
          $lookup: {
            from: 'placements',
            localField: '_id',
            foreignField: 'collegeId',
            pipeline: [{ $match: { status: 'placed' } }],
            as: 'placements'
          }
        },
        {
          $project: {
            name: 1,
            shortCode: 1,
            studentCount: { $size: '$students' },
            placementCount: { $size: '$placements' }
          }
        },
        { $sort: { placementCount: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalColleges: colleges,
          totalStudents,
          totalPlacements
        },
        collegeStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

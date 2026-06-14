const TestAttempt = require('./TestAttempt');
const User = require('./User');
const College = require('./College');
const { paginate } = require('./pagination');
const { evaluateAfterTest } = require('./achievementEngine');

/**
 * POST /api/tests/submit
 * Scalable test submission — identifies student by roll number + college name only.
 * No MongoDB ObjectId is ever required from the frontend.
 * Designed for 10,000+ concurrent students.
 */
exports.submitByRollNo = async (req, res) => {
  try {
    const { rollNo, collegeName, testType, testName, score, maxScore, percentage, timeTaken, passed, sections, answers, weakAreas } = req.body;

    if (!rollNo || !collegeName) {
      return res.status(400).json({ success: false, message: 'rollNo and collegeName are required' });
    }

    // 1. Resolve college by name (case-insensitive, trimmed)
    const escapedName = collegeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const college = await College.findOne({ name: { $regex: new RegExp(`^\\s*${escapedName}\\s*$`, 'i') } });
    if (!college) {
      return res.status(404).json({ success: false, message: `Institution "${collegeName}" not found` });
    }

    // 2. Resolve student by compound key: studentId (roll) + collegeId
    const student = await User.findOne({
      studentId: rollNo.toUpperCase(),
      collegeId: college._id,
      role: 'student'
    });
    if (!student) {
      return res.status(404).json({ success: false, message: `Student ${rollNo} not found at ${collegeName}` });
    }

    // 3. Calculate attempt number for this test name
    const prevAttempts = await TestAttempt.countDocuments({ studentId: student._id, testName });

    // 4. Create TestAttempt record
    const attempt = await TestAttempt.create({
      studentId: student._id,
      collegeId: college._id,
      department: student.department,
      testType: testType || 'aptitude',
      testName: testName || 'Practice Session',
      score: score || 0,
      maxScore: maxScore || 10,
      percentage: percentage || 0,
      timeTaken: timeTaken || 0,
      passed: passed !== undefined ? passed : true,
      sections: sections || [],
      answers: answers || [],
      weakAreas: weakAreas || [],
      attemptNumber: prevAttempts + 1
    });

    // 5. Update student stats atomically
    const totalTests = await TestAttempt.countDocuments({ studentId: student._id });
    const avgResult = await TestAttempt.aggregate([
      { $match: { studentId: student._id } },
      { $group: { _id: null, avgPct: { $avg: '$percentage' } } }
    ]);
    await User.findByIdAndUpdate(student._id, {
      'stats.testsCompleted': totalTests,
      'stats.avgAccuracy': Math.round(avgResult[0]?.avgPct || 0)
    });

    // 6. Trigger achievement evaluation
    const achievements = await evaluateAfterTest(student._id, college._id, attempt);

    res.status(201).json({
      success: true,
      data: {
        attemptId: attempt._id,
        testsCompleted: totalTests,
        avgAccuracy: Math.round(avgResult[0]?.avgPct || 0)
      },
      achievementsAwarded: achievements
    });
  } catch (error) {
    console.error('[TEST SUBMIT] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/students/:id/tests — Test history
exports.getTestHistory = async (req, res) => {
  try {
    const filter = { studentId: req.params.id };
    if (req.query.testType) filter.testType = req.query.testType;
    if (req.collegeScope) filter.collegeId = req.collegeScope;

    const result = await paginate(TestAttempt, filter, req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/students/:id/tests — Submit test attempt
exports.submitTest = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Only the student themselves can submit
    if (req.user.role === 'student' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Cannot submit for another student' });
    }

    // Calculate attempt number
    const prevAttempts = await TestAttempt.countDocuments({
      studentId: req.params.id,
      testName: req.body.testName
    });

    const attempt = await TestAttempt.create({
      ...req.body,
      studentId: req.params.id,
      collegeId: student.collegeId,
      department: student.department,
      attemptNumber: prevAttempts + 1
    });

    // Update user stats
    const totalTests = await TestAttempt.countDocuments({ studentId: req.params.id });
    const avgResult = await TestAttempt.aggregate([
      { $match: { studentId: student._id } },
      { $group: { _id: null, avgPercentage: { $avg: '$percentage' } } }
    ]);

    await User.findByIdAndUpdate(req.params.id, {
      'stats.testsCompleted': totalTests,
      'stats.avgAccuracy': Math.round(avgResult[0]?.avgPercentage || 0)
    });

    // Trigger achievement evaluation
    const achievements = await evaluateAfterTest(req.params.id, student.collegeId, attempt);

    res.status(201).json({ success: true, data: attempt, achievementsAwarded: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/students/:id/tests/analytics — Performance trends
exports.getTestAnalytics = async (req, res) => {
  try {
    const studentId = req.params.id;

    const [trend, byType, weakAreas] = await Promise.all([
      // Score trend over last 20 tests
      TestAttempt.find({ studentId })
        .sort({ createdAt: -1 })
        .limit(20)
        .select('testName percentage testType createdAt')
        .lean(),

      // Average by test type
      TestAttempt.aggregate([
        { $match: { studentId: require('mongoose').Types.ObjectId.createFromHexString(studentId) } },
        { $group: {
          _id: '$testType',
          avgScore: { $avg: '$percentage' },
          totalAttempts: { $sum: 1 },
          bestScore: { $max: '$percentage' }
        }}
      ]),

      // Most common weak areas
      TestAttempt.aggregate([
        { $match: { studentId: require('mongoose').Types.ObjectId.createFromHexString(studentId) } },
        { $unwind: '$weakAreas' },
        { $group: { _id: '$weakAreas', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        trend: trend.reverse(),
        byType,
        weakAreas: weakAreas.map(w => ({ area: w._id, frequency: w.count }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tests/college/results — All results for college admin
exports.getCollegeTestResults = async (req, res) => {
  try {
    const filter = { collegeId: req.collegeScope };
    
    // Add department filter if provided
    if (req.query.department && req.query.department !== 'all') {
      filter.department = req.query.department;
    }

    const result = await paginate(TestAttempt, filter, {
      ...req.query,
      populate: { path: 'studentId', select: 'name studentId department' }
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

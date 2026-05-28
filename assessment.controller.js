// assessment.controller.js

const Assessment = require('./Assessment');
const TestAttempt = require('./TestAttempt');

// CREATE a new assessment (college admin only)
exports.createAssessment = async (req, res) => {
  try {
    const { title, type, questionCount, duration, departments, dueDate, difficulty, negativeMarking } = req.body;
    const assessment = await Assessment.create({
      title,
      type,
      questionCount,
      duration,
      departments,
      dueDate,
      difficulty,
      negativeMarking,
      collegeId: req.collegeScope,
      createdBy: req.user ? req.user._id : null,
      status: 'active'
    });
    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all assessments (admin sees all for college; student sees active for their dept)
exports.getAssessments = async (req, res) => {
  try {
    const filter = { collegeId: req.collegeScope };
    // If student role, filter active assessments for department
    if (req.user && req.user.role === 'student') {
      filter.status = 'active';
      const dept = req.user.department;
      filter.$or = [{ departments: 'All' }, { departments: dept }];
    }
    const assessments = await Assessment.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET a single assessment by ID
exports.getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({ _id: req.params.id, collegeId: req.collegeScope });
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    res.json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE an assessment (admin only)
exports.updateAssessment = async (req, res) => {
  try {
    const updates = req.body;
    const assessment = await Assessment.findOneAndUpdate(
      { _id: req.params.id, collegeId: req.collegeScope },
      updates,
      { new: true, runValidators: true }
    );
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    res.json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE an assessment (admin only)
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOneAndDelete({ _id: req.params.id, collegeId: req.collegeScope });
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    res.json({ success: true, message: 'Assessment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET results for a specific assessment (admin only)
exports.getAssessmentResults = async (req, res) => {
  try {
    const { id } = req.params; // assessment ID
    const filter = { assessmentId: id, collegeId: req.collegeScope };
    const results = await TestAttempt.find(filter).populate('studentId', 'name email department studentId');
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET overview stats for all assessments
exports.getAssessmentOverview = async (req, res) => {
  try {
    const filter = { collegeId: req.collegeScope };
    
    // Optional date filter passed via query
    if (req.query.days && req.query.days !== 'all') {
      const days = parseInt(req.query.days);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filter.createdAt = { $gte: cutoff };
    }

    const assessments = await Assessment.find(filter);
    const assessmentIds = assessments.map(a => a._id);

    // Get attempts matching those assessments
    const attempts = await TestAttempt.find({ assessmentId: { $in: assessmentIds } }).populate('studentId', 'department');
    
    // Filter by department if provided
    let filteredAttempts = attempts;
    if (req.query.dept && req.query.dept !== 'all') {
      const deptTarget = req.query.dept.toLowerCase();
      filteredAttempts = attempts.filter(a => a.studentId && (a.studentId.department || '').toLowerCase() === deptTarget);
    }

    let totalAttempts = filteredAttempts.length;
    let categoryCounts = { quantitative: 0, verbal: 0, logical: 0, di: 0, mixed: 0 };
    let categoryScoreSum = { quantitative: 0, verbal: 0, logical: 0, di: 0, mixed: 0 };
    let categoryAttemptCount = { quantitative: 0, verbal: 0, logical: 0, di: 0, mixed: 0 };

    let totalScoreSum = 0;

    filteredAttempts.forEach(attempt => {
      totalScoreSum += attempt.percentage || 0;
      
      const assmnt = assessments.find(a => a._id.toString() === attempt.assessmentId.toString());
      const type = assmnt && assmnt.type ? assmnt.type : 'mixed';
      
      if (categoryScoreSum[type] !== undefined) {
        categoryScoreSum[type] += attempt.percentage || 0;
        categoryAttemptCount[type]++;
      }
    });

    assessments.forEach(a => {
      const type = a.type || 'mixed';
      if(categoryCounts[type] !== undefined) categoryCounts[type]++;
    });

    const categoryAvgScores = {
      quantitative: categoryAttemptCount.quantitative ? (categoryScoreSum.quantitative / categoryAttemptCount.quantitative) : 0,
      verbal: categoryAttemptCount.verbal ? (categoryScoreSum.verbal / categoryAttemptCount.verbal) : 0,
      logical: categoryAttemptCount.logical ? (categoryScoreSum.logical / categoryAttemptCount.logical) : 0,
      di: categoryAttemptCount.di ? (categoryScoreSum.di / categoryAttemptCount.di) : 0,
      mixed: categoryAttemptCount.mixed ? (categoryScoreSum.mixed / categoryAttemptCount.mixed) : 0
    };

    const avgOverallScore = totalAttempts ? (totalScoreSum / totalAttempts) : 0;

    res.json({
      success: true,
      data: {
        totalAssessments: assessments.length,
        totalAttempts,
        avgOverallScore: Math.round(avgOverallScore),
        categoryCounts,
        categoryAvgScores: {
          quantitative: Math.round(categoryAvgScores.quantitative),
          verbal: Math.round(categoryAvgScores.verbal),
          logical: Math.round(categoryAvgScores.logical),
          di: Math.round(categoryAvgScores.di),
          mixed: Math.round(categoryAvgScores.mixed),
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

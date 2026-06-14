const User = require('./User');
const Student = require('./Student');
const TestAttempt = require('./TestAttempt');
const Interview = require('./Interview');
const ActivityLog = require('./ActivityLog');
const { paginate } = require('./pagination');

// GET /api/students — List students (paginated, college-scoped)
exports.listStudents = async (req, res) => {
  console.log('>>> [API] GET /api/students called by:', req.user.email);
  try {
    const filter = { role: 'student' };

    // College scoping
    console.log('[STUDENT LIST] req.user.collegeId:', req.user.collegeId);
    console.log('[STUDENT LIST] req.collegeScope:', req.collegeScope);

    if (req.collegeScope) {
      filter.collegeId = req.collegeScope;
    } else if (req.query.college) {
      filter.collegeId = req.query.college;
    }
    
    console.log('[STUDENT LIST] Final Filter:', JSON.stringify(filter));

    // Optional filters
    if (req.query.department) filter.department = req.query.department;
    if (req.query.year) filter.year = parseInt(req.query.year);
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { studentId: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const result = await paginate(User, filter, req.query, 'collegeId facultyId');

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/students/:id — Get student profile
exports.getStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).populate('collegeId', 'name shortCode');

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // College scope check
    if (req.collegeScope && !student.collegeId._id.equals(req.collegeScope)) {
      return res.status(403).json({ success: false, message: 'Access denied — different college' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/students/:id — Update student profile
exports.updateStudent = async (req, res) => {
  try {
    const allowedFields = ['name', 'department', 'year', 'skills', 'resumeUrl', 'profile'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    // Students can only update themselves
    if (req.user.role === 'student' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Cannot update another student' });
    }

    const student = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('collegeId', 'name shortCode');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// POST /api/students/batch — Bulk onboard students (Faculty/Admin only)
exports.createBatchStudents = async (req, res) => {
  try {
    const { students, department, year } = req.body;
    const collegeId = req.collegeScope;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ success: false, message: 'Invalid students data' });
    }

    if (!collegeId) {
      return res.status(403).json({ success: false, message: 'Institutional context missing' });
    }

    const createdStudents = [];
    const errors = [];

    // Process each student
    for (const s of students) {
      try {
        // Simple hash/pass for demo - in production use a formal invite system
        const studentData = {
          name: s.name,
          studentId: s.roll || s.studentId,
          email: s.email,
          role: 'student',
          collegeId: collegeId,
          department: department || s.department,
          year: year || s.year,
          passwordHash: 'welcome123' // Default password
        };

        const newUser = await User.create(studentData);
        createdStudents.push(newUser);
      } catch (err) {
        errors.push({ student: s.name, error: err.message });
      }
    }

    res.json({
      success: true,
      count: createdStudents.length,
      errors: errors.length ? errors : undefined,
      message: `Successfully onboarded ${createdStudents.length} students.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// POST /api/students/identify — Strict compound identification and data hydration
exports.getStudentFullProfile = async (req, res) => {
  const { college_id, roll_no } = req.body;

  // 1. Validation
  if (!college_id || !roll_no) {
    return res.status(400).json({ 
      success: false, 
      message: 'Both college_id and roll_no are required for identification' 
    });
  }

  try {
    const startTime = Date.now();

    // 2. Strict College Lookup: Get the unique Institutional ID
    // Escape special characters and use case-insensitive trim match
    const escapedName = college_id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const college = await require('./College').findOne({ 
      name: { $regex: new RegExp(`^\\s*${escapedName}\\s*$`, 'i') } 
    });

    if (!college) {
      return res.status(404).json({ 
        success: false, 
        message: 'Institution not recognized. Please check your college selection.' 
      });
    }

    const collegeDbId = college._id;
    
    // 3. Strict Student Lookup & Deduplication: Keep the latest record
    const allStudentRecords = await Student.find({ 
      college_id: collegeDbId, 
      roll_no: roll_no.toUpperCase() 
    }).sort({ updatedAt: -1 });

    let studentInfo = null;
    if (allStudentRecords.length > 0) {
      studentInfo = allStudentRecords[0];
      
      // If duplicates exist, prune them automatically to ensure Zero-Clash persistence
      if (allStudentRecords.length > 1) {
        const duplicateIds = allStudentRecords.slice(1).map(s => s._id);
        await Student.deleteMany({ _id: { $in: duplicateIds } });
        console.log(`[DEDUPE] Pruned ${duplicateIds.length} ghost records for ${roll_no} at ${college.name}`);
      }
    }

    const userAccount = await User.findOne({ 
      collegeId: collegeDbId,
      studentId: roll_no.toUpperCase() 
    }).populate('collegeId', 'name');

    if (!studentInfo && !userAccount) {
      // Log Failure
      await ActivityLog.create({
        action_type: 'STUDENT_QUERY',
        college_id: collegeDbId,
        target_id: roll_no,
        status: 'FAILURE',
        metadata: { error: 'No student found for this college and roll number', ip: req.ip }
      });

      return res.status(404).json({ 
        success: false, 
        message: `No student with Roll No ${roll_no} found at ${college.name}` 
      });
    }

    const userId = userAccount ? userAccount._id : (studentInfo ? studentInfo._id : null);
    
    // 🧱 Master Data Initialization: Ensure the User record exists for persistent state storage
    let masterUser = userAccount;
    if (!masterUser && studentInfo) {
      console.log(`[PERSISTENCE] Initializing Master User record for ${roll_no}`);
      masterUser = await require('./User').create({
        name: studentInfo.name,
        email: `${roll_no.toLowerCase()}@${college.shortCode || 'skillovate.edu'}`,
        studentId: roll_no.toUpperCase(),
        collegeId: collegeDbId,
        passwordHash: 'institutional_placeholder', // Social/RollNo login uses tokens
        lastSession: {
          selectedCollege: college.name,
          rollNo: roll_no.toUpperCase(),
          lastActivePage: 'dash'
        }
      });
    }

    // 4. Data Hydraulics: Aggregate all related records scoped to this college
    let assessments = [];
    let interviews = [];

    if (userId) {
      [assessments, interviews] = await Promise.all([
        TestAttempt.find({ studentId: userId, collegeId: collegeDbId }).sort({ createdAt: -1 }),
        Interview.find({ studentId: userId, collegeId: collegeDbId }).sort({ createdAt: -1 })
      ]);
    }

    // 5. Log Success
    await ActivityLog.create({
      actor_id: userId,
      action_type: 'DATA_SYNC',
      college_id: collegeDbId,
      target_id: roll_no,
      status: 'SUCCESS',
      metadata: { 
        assessments_found: assessments.length, 
        interviews_found: interviews.length,
        duration_ms: Date.now() - startTime 
      }
    });

    // 6. Structure Final Output
    const result = {
      success: true,
      student: {
        internal_id: userId,
        id: roll_no,
        name: studentInfo?.name || userAccount?.name,
        college: college.name,
        college_id: collegeDbId, // The verified ID
        department: studentInfo?.department || userAccount?.department,
        year: userAccount?.year,
        profile_data: userAccount?.profile || {},
        stats: userAccount?.stats || {},
        resumeData: studentInfo?.resumeData || {},
        jobApplications: studentInfo?.jobApplications || [],
        trackProgress: userAccount?.progress?.trackProgress || {}
      },
      history: {
        tests: assessments,
        interviews: interviews,
        total_attempts: assessments.length + interviews.length
      },
      sync_metadata: {
        timestamp: new Date(),
        version: 'v3.clash-proof'
      }
    };

    res.json(result);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🖋️ PERSIST RESUME: Saves student resume fields to Cloud Profile
 * POST /api/students/:id/resume
 */
exports.updateResumeData = async (req, res) => {
  const { id } = req.params; // Roll Number
  const { resumeData, college_id } = req.body;

  try {
    const student = await Student.findOneAndUpdate(
      { roll_no: id.toUpperCase(), college_id: college_id },
      { $set: { resumeData: resumeData } },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Resume synchronized successfully', data: student.resumeData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 💼 TRACK APPLICATION: Logs a job application to the student's persistent history
 * POST /api/students/:id/apply
 */
exports.logJobApplication = async (req, res) => {
  const { id } = req.params; // Roll Number
  const { jobId, title, company, college_id } = req.body;

  try {
    const student = await Student.findOneAndUpdate(
      { roll_no: id.toUpperCase(), college_id: college_id },
      { $push: { jobApplications: { jobId, title, company, appliedAt: new Date() } } },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Job application tracked successfully', data: student.jobApplications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🎯 TRACK PROGRESS: Persists question indices for sequential delivery
 * POST /api/students/:id/track
 */
exports.updateTrackingIndex = async (req, res) => {
  const { id } = req.params; // Roll Number
  const { subject, index, college_id } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { studentId: id.toUpperCase(), collegeId: college_id },
      { $set: { [`progress.trackProgress.${subject}`]: index } },
      { new: true }
    );

    res.json({ success: true, index: user?.progress?.trackProgress?.get(subject) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 📝 LOG TEST ATTEMPT: Records an assessment or practice result to the database
 * POST /api/students/:id/tests
 */
exports.logTestAttempt = async (req, res) => {
  const { id } = req.params; // Roll Number
  const { assessmentId, testType, testName, score, maxScore, percentage, timeTaken, passed, college_id } = req.body;

  try {
    // 1. Resolve student context
    const user = await User.findOne({ studentId: id.toUpperCase(), collegeId: college_id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student record not found for this institution' });
    }

    // 2. Create standardized attempt record
    const attempt = await TestAttempt.create({
      studentId: user._id,
      collegeId: college_id,
      assessmentId: assessmentId || null,
      testType: testType === 'assessment' ? 'scheduled' : (testType || 'aptitude'),
      testName: testName || 'Standard Assessment',
      score: score || 0,
      maxScore: maxScore || 10,
      percentage: percentage || 0,
      timeTaken: timeTaken || 0,
      passed: passed || false
    });

    // 3. Optional: Push to user's local history for quick lookups
    await User.findByIdAndUpdate(user._id, {
      $push: {
        'progress.testHistory': {
          assessmentId: assessmentId || null,
          testName,
          percentage,
          timestamp: new Date()
        }
      }
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    console.error('[DATABASE] Test Log Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

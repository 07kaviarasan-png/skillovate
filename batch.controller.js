const mongoose = require('mongoose');
const FacultyBatch = require('./FacultyBatch');
const User = require('./User');
const Student = require('./Student');
const College = require('./College');
const bcrypt = require('bcryptjs');

// POST /api/batches
exports.submitBatch = async (req, res) => {
  try {
    const { batchId, name, college, department, year, students } = req.body;
    
    const batch = await FacultyBatch.create({
      batchId,
      name,
      college,
      department,
      year,
      collegeId: req.user.collegeId, // Definitive link to institution
      facultyId: req.user._id,
      facultyName: req.user.name,
      facultyEmail: req.user.email,
      students,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    console.error('Error submitting batch:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/batches/pending
exports.getPendingBatches = async (req, res) => {
  try {
    // STRICT ACCESS: Only Platform/Panel Admins (super_admin) can see these
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Pannel Admin only' });
    }

    // 🚑 SELF-HEALING QUERY: Show batches that are pending, 
    // OR batches that were "approved" but failed to provision students (e.g. due to missing emails)
    const query = {
      $or: [
        { status: 'pending' },
        { status: 'approved', 'students.status': 'pending' }
      ]
    };

    const batches = await FacultyBatch.find(query).sort({ submittedAt: -1 });
    res.json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/batches/:id/status
exports.processBatch = async (req, res) => {
  try {
    // STRICT ACCESS: Only Platform/Panel Admins (super_admin) can resolve batches
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Pannel Admin only' });
    }

    const status = req.body.status?.toLowerCase(); // 'approved' or 'rejected'
    const batch = await FacultyBatch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    batch.status = status;
    
    if (status === 'approved') {
      const college = await College.findById(batch.collegeId);
      const collegeShortCode = college?.shortCode || 'SK';
      const faculty = await User.findById(batch.facultyId);
      
      const collegeIdToUse = batch.collegeId || (faculty ? faculty.collegeId : null);

      if (!collegeIdToUse) {
        return res.status(400).json({ success: false, message: 'Source institution not found. Please fix faculty profile.' });
      }

      // PERMANENT REPAIR: Save the resolved ID back to the batch record to pass Mongoose validation
      batch.collegeId = collegeIdToUse;

      // 2. Provision student accounts
      const creationResults = { total: batch.students.length, created: 0, skipped: 0 };
      
      for (const s of batch.students) {
        try {
          // 🔑 CRITICAL FIX: findOneAndUpdate does NOT trigger pre('save') hooks.
          // We must hash the password manually before the upsert.
          // Password for students defaults to their roll number in lowercase
          const passwordToHash = s.roll.toLowerCase();
          const salt = await bcrypt.genSalt(12);
          const hashedPassword = await bcrypt.hash(passwordToHash, salt);

          // 📧 FALLBACK EMAIL: If email is missing, generate one from roll number
          const studentEmail = (s.email && s.email.trim() !== '') 
            ? s.email.toLowerCase() 
            : `${s.roll.toLowerCase()}@skillovate-edu.com`;

          // AUTHORITATIVE PROVISIONING (Upsert): 
          // Uses a single definitive sync that bypasses unique index clashes
          const user = await User.findOneAndUpdate(
            { 
              $or: [
                { studentId: s.roll.toUpperCase() },
                { email: studentEmail }
              ] 
            },
            {
              name: s.name || 'Skillovate Learner',
              email: studentEmail,
              role: 'student',
              status: 'approved', // Explicitly mark as approved
              collegeId: batch.collegeId,
              studentId: s.roll.toUpperCase(),
              department: batch.department,
              year: parseInt(batch.year) || undefined,
              facultyId: new mongoose.Types.ObjectId(batch.facultyId),
              passwordHash: hashedPassword
            },
            { 
              upsert: true, 
              new: true, 
              runValidators: true,
              setDefaultsOnInsert: true 
            }
          );
          
          // 🏛️ ECO-SYSTEM SYNC: Also ensure the record exists in the legacy 'Student' collection
          // which is used by some real-time tracking modules
          await Student.findOneAndUpdate(
            { college_id: batch.collegeId.toString(), roll_no: s.roll.toUpperCase() },
            {
              name: s.name || user.name,
              department: batch.department || user.department,
              college_id: batch.collegeId.toString()
            },
            { upsert: true, new: true }
          );

          creationResults.created++;
          s.status = 'approved';
        } catch (err) {
          console.error(`Failed to create user ${s.roll}:`, err.message);
          s.status = 'pending'; // Keep pending if failed
        }
      }
      
      // 💾 SYNC STATE: Mark students as approved in the Batch record so they don't show up in repair list
      batch.markModified('students');
      
      console.log(`[PROVISIONING] Batch ${batch.batchId}: ${creationResults.created} created, ${creationResults.skipped} skipped.`);
    }

    batch.processedAt = new Date();
    await batch.save();
    res.json({ success: true, message: `Batch ${status} successfully`, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/batches/history
exports.getFacultyHistory = async (req, res) => {
  try {
    const batches = await FacultyBatch.find({ facultyId: req.user._id }).sort({ submittedAt: -1 });
    res.json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/batches/students
exports.getFacultyStudents = async (req, res) => {
  try {
    const facultyId = req.user._id;
    console.log(`[FACULTY TRACKER] Fetching students for faculty: ${facultyId}`);

    // 🕵️ ROBUST QUERY: Handle both ObjectId and legacy String storage
    const students = await User.find({ 
      $or: [
        { facultyId: facultyId },
        { facultyId: facultyId.toString() }
      ],
      role: 'student'
    }).select('name studentId email department year progress stats lastSession updatedAt facultyId');
    
    console.log(`[FACULTY TRACKER] Found ${students.length} students`);

    // 🛠️ SELF-HEALING: If any students have a String facultyId, convert them to ObjectId for the future
    const legacyStudents = students.filter(s => typeof s.facultyId === 'string');
    if (legacyStudents.length > 0) {
      console.log(`[SELF-HEAL] Repairing ${legacyStudents.length} legacy string-links for faculty ${facultyId}`);
      await User.updateMany(
        { _id: { $in: legacyStudents.map(s => s._id) } },
        { $set: { facultyId: facultyId } }
      );
    }

    res.json({ success: true, data: students });
  } catch (error) {
    console.error('[FACULTY TRACKER ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

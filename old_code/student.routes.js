const router = require('express').Router();
const { listStudents, getStudent, updateStudent, createBatchStudents, getStudentFullProfile } = require('./student.controller');
const auth = require('./auth');
const { authorize, collegeScope } = require('./rbac');

router.get('/', auth, authorize('college_admin', 'super_admin', 'faculty'), collegeScope, listStudents);
router.post('/batch', auth, authorize('college_admin', 'faculty'), collegeScope, createBatchStudents);
router.post('/identify', getStudentFullProfile); // Targeted hydration
router.get('/:id', auth, collegeScope, getStudent);
router.put('/:id', auth, collegeScope, updateStudent);

// --- 🌊 DYNAMIC PERSISTENCE LAYER ---
router.post('/:id/resume', require('./student.controller').updateResumeData);
router.post('/:id/apply', require('./student.controller').logJobApplication);
router.post('/:id/track', require('./student.controller').updateTrackingIndex);
router.post('/:id/tests', require('./student.controller').logTestAttempt);

module.exports = router;

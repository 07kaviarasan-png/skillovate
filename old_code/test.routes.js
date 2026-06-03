const router = require('express').Router();
const { getTestHistory, submitTest, getTestAnalytics, getCollegeTestResults, submitByRollNo } = require('./test.controller');
const auth = require('./auth');
const { collegeScope } = require('./rbac');

// ── Roll+College submission (scalable, no internal IDs) ──
router.post('/submit', auth, submitByRollNo);

// ── Legacy student-scoped routes ──
router.get('/:id/tests', auth, collegeScope, getTestHistory);
router.post('/:id/tests', auth, submitTest);
router.get('/:id/tests/analytics', auth, collegeScope, getTestAnalytics);
router.get('/college/results', auth, collegeScope, getCollegeTestResults);

module.exports = router;

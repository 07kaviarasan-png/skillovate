const router = require('express').Router();
const { studentDashboard, adminDashboard, superDashboard } = require('./dashboard.controller');
const auth = require('./auth');
const { authorize, collegeScope } = require('./rbac');

router.get('/student/:id', auth, studentDashboard);
router.get('/admin', auth, authorize('college_admin', 'faculty'), collegeScope, adminDashboard);
router.get('/super', auth, authorize('super_admin'), superDashboard);

module.exports = router;

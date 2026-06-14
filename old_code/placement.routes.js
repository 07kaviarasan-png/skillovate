const router = require('express').Router();
const {
  getStudentPlacements, listPlacements, createPlacement, verifyPlacement
} = require('./placement.controller');
const auth = require('./auth');
const { authorize, collegeScope } = require('./rbac');

// Student-scoped
router.get('/student/:id', auth, collegeScope, getStudentPlacements);

// Admin endpoints
router.get('/', auth, authorize('college_admin', 'super_admin'), collegeScope, listPlacements);
router.post('/', auth, authorize('student', 'college_admin', 'super_admin'), createPlacement);
router.put('/:id/verify', auth, authorize('college_admin', 'super_admin'), collegeScope, verifyPlacement);

module.exports = router;

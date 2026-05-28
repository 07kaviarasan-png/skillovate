const express = require('express');
const router = express.Router();
const { createAssessment, getAssessments, getAssessment, updateAssessment, deleteAssessment, getAssessmentResults, getAssessmentOverview } = require('./assessment.controller');
const auth = require('./auth');
const { collegeScope, authorize } = require('./rbac');

// All routes are protected by auth and collegeScope
router.use(auth);
router.use(collegeScope);

// Admin/Faculty can manage assessments
router.get('/overview/stats', authorize('college_admin', 'faculty'), getAssessmentOverview);
router.post('/', authorize('college_admin', 'faculty'), createAssessment);
router.get('/', authorize('college_admin', 'faculty', 'student'), getAssessments);
router.get('/:id', authorize('college_admin', 'faculty', 'student'), getAssessment);
router.put('/:id', authorize('college_admin', 'faculty'), updateAssessment);
router.delete('/:id', authorize('college_admin', 'faculty'), deleteAssessment);
router.get('/:id/results', authorize('college_admin', 'faculty'), getAssessmentResults);


module.exports = router;

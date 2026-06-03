const router = require('express').Router();
const { getInterviewHistory, submitInterview } = require('./interview.controller');
const auth = require('./auth');
const { collegeScope } = require('./rbac');

router.get('/:id/interviews', auth, collegeScope, getInterviewHistory);
router.post('/:id/interviews', auth, submitInterview);

module.exports = router;

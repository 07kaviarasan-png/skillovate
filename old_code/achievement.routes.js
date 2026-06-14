const router = require('express').Router();
const {
  getStudentAchievements, getLeaderboard, triggerEvaluation
} = require('./achievement.controller');
const auth = require('./auth');
const { authorize, collegeScope } = require('./rbac');

// Student achievements
router.get('/students/:id/achievements', auth, collegeScope, getStudentAchievements);

// Trigger evaluation for a student (admin or self)
router.post('/students/:id/achievements/evaluate', auth, triggerEvaluation);

// Leaderboard (public within auth)
router.get('/leaderboard', auth, collegeScope, getLeaderboard);

module.exports = router;

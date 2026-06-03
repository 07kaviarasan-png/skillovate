const router = require('express').Router();
const { register, login, getMe, googleLogin, forgotPassword, logout } = require('./auth.controller');
const auth = require('./auth');
const { authLimiter } = require('./rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google-login', authLimiter, googleLogin);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);

router.get('/debug', async (req, res) => {
  const User = require('./User');
  const FacultyBatch = require('./FacultyBatch');
  const students = await User.find({ role: 'student' });
  const batches = await FacultyBatch.find();
  res.json({ students, batches });
});

module.exports = router;

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./db');
const { apiLimiter } = require('./rateLimiter');

const app = express();

// ════════ MIDDLEWARE ════════
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for local development to ensure Google GSI isn't blocked
}));
app.use(cors({
  origin: true, // Reflect origin to allow all local/dev origins
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/api', apiLimiter);
app.use('/question_bank', express.static(path.join(__dirname, '../frontend'))); 

// 📁 ROOT STATIC SERVING: Serves all HTML, JS, CSS, and Assets from the project root
app.use(express.static(path.join(__dirname, '../frontend')));

// ════════ ROUTES ════════
app.use('/api/auth', require('./auth.routes'));
app.use('/api/students', require('./student.routes'));
app.use('/api/students', require('./test.routes'));       // /api/students/:id/tests (legacy)
app.use('/api/tests',    require('./test.routes'));       // /api/tests/submit (roll+college, scalable)
app.use('/api/students', require('./interview.routes'));  // /api/students/:id/interviews
app.use('/api/placements', require('./placement.routes'));
app.use('/api/dashboard', require('./dashboard.routes'));
app.use('/api/userdata', require('./persistence.routes')); // 🔄 Persistence/UserData Engine
app.use('/api/batches', require('./batch.routes'));       // 🎓 Faculty/Admin Batch Engine
app.use('/api/colleges', require('./college.routes'));     // 🏛️ Global Identity Engine
app.use('/api', require('./achievement.routes'));         // /api/students/:id/achievements + /api/leaderboard
app.use('/api/assessments', require('./assessment.routes')); // Assessment CRUD

// ════════ HEALTH CHECK ════════
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Skillovate API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ════════ 404 HANDLER ════════
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ════════ ERROR HANDLER ════════
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// ════════ START ════════
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Skillovate API Server running on port ${PORT} (0.0.0.0)`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV}\n`);
  });
};

start();

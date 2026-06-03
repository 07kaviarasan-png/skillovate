const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { apiLimiter } = require('./rateLimiter');

const app = express();

// ════════ MIDDLEWARE ════════
app.use(helmet({
  contentSecurityPolicy: false, 
}));
app.use(cors({
  origin: true, 
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/api', apiLimiter);
app.use('/question_bank', express.static(path.join(__dirname, 'frontend'))); 

// 📁 ROOT STATIC SERVING
app.use(express.static(path.join(__dirname, 'frontend')));

// ════════ ROUTES ════════
// Note: These routes might currently depend on Mongoose models. 
// They will need to be updated to use PostgreSQL/Sequelize.
app.use('/api/auth', require('./auth.routes'));
app.use('/api/students', require('./student.routes'));
app.use('/api/students', require('./test.routes'));
app.use('/api/tests',    require('./test.routes'));
app.use('/api/students', require('./interview.routes'));
app.use('/api/placements', require('./placement.routes'));
app.use('/api/dashboard', require('./dashboard.routes'));
app.use('/api/userdata', require('./persistence.routes'));
app.use('/api/batches', require('./batch.routes'));
app.use('/api/colleges', require('./college.routes'));
app.use('/api', require('./achievement.routes'));
app.use('/api/assessments', require('./assessment.routes'));

// ════════ HEALTH CHECK ════════
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Skillovate API is running (PostgreSQL Migration Pending)',
    timestamp: new Date().toISOString()
  });
});

// ════════ START ════════
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Skillovate API Server running on port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`⚠️  Warning: MongoDB removed. PostgreSQL migration required for API routes.\n`);
});

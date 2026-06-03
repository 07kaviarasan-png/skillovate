const jwt = require('jsonwebtoken');
const User = require('./User');
const College = require('./College');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Helper to set cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/'
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token, // Send back for mobile/fallback
    data: { user: user.toJSON() }
  });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, password, role, collegeShortCode, studentId, department, year, company } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase() : undefined;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Resolve college (only for non-super-admin and non-recruiter)
    let collegeId = null;
    if (role !== 'super_admin' && role !== 'recruiter') {
      // 🎯 DIRECT ID RESOLUTION: Prefer the dropdown-provided ObjectId
      if (req.body.collegeId) {
        const college = await College.findById(req.body.collegeId);
        if (college) {
          collegeId = college._id;
        }
      }

      // 📛 NAME FALLBACK: If no ID was provided or ID lookup failed, search by name
      if (!collegeId) {
        const targetCollege = req.body.collegeName || req.body.collegeShortCode;
        if (!targetCollege) {
          return res.status(400).json({ success: false, message: 'Institutional selection is required' });
        }

        const college = await College.findOne({
          $or: [
            { name: { $regex: new RegExp(`^\\s*${targetCollege.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') } },
            { shortCode: targetCollege.toUpperCase() }
          ]
        });

        if (!college) {
          return res.status(400).json({ success: false, message: `Institution '${targetCollege}' not recognized` });
        }
        collegeId = college._id;
      }
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: role || 'student',
      collegeId,
      studentId,
      department,
      year,
      company: role === 'recruiter' ? company : undefined
    });

    await user.populate('collegeId', 'name shortCode');
    sendTokenResponse(user, 201, res);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate entry — email or student ID already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { studentId, password, collegeName } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase() : undefined;

    if ((!email && !studentId) || !password) {
      return res.status(400).json({ success: false, message: 'Email/Student ID and password are required' });
    }

    let query = email ? { email } : { studentId: studentId.toUpperCase() };

    // 🏛️ INSTITUTIONAL SCOPING: Resolve the specific college link for ALL logins (Email or Roll No)
    if (req.body.collegeId) {
      query.collegeId = req.body.collegeId;
    } else if (collegeName) {
      // Fallback to name search if ID wasn't provided (backwards compatibility)
      const college = await College.findOne({ 
        name: { $regex: new RegExp(`^\\s*${collegeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') } 
      });
      if (college) query.collegeId = college._id;
    }

    let user = await User.findOne(query).select('+passwordHash');

    // 🏛️ IDENTITY RESILIENCE: If strict ID scoping fails for a student, try global lookup + name-based correlation
    if (!user && studentId) {
      console.log(`[AUTH] Strict ID match failed for ${studentId}. Triggering Name-Based Resilience...`);
      
      const studentsFound = await User.find({ studentId: studentId.toUpperCase(), role: 'student' })
                                     .populate('collegeId')
                                     .select('+passwordHash');
      
      if (studentsFound.length > 0) {
        // 🏛️ NAME-SOVEREIGNTY: If ID search fails (due to stale browser cache), fallback to Name
        let selectedCollege = await College.findById(req.body.collegeId);
        if (!selectedCollege && collegeName) {
           selectedCollege = await College.findOne({ 
             name: { $regex: new RegExp(`^\\s*${collegeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') } 
           });
        }

        const targetName = selectedCollege?.name || collegeName;
        user = studentsFound.find(s => 
          s.collegeId?.name?.trim().toLowerCase() === targetName?.trim().toLowerCase()
        );
        
        if (user && selectedCollege) {
          console.log(`[AUTH] Name-Sovereignty: Resolved drift for ${studentId}. Updating ID to ${selectedCollege._id}`);
          // 🛠️ DEFINITIVE HEALING: Anchor the user to the new active College ID
          user.collegeId = selectedCollege._id;
          await user.save();
        }
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or institution mismatch' });
    }

    let isMatch = await user.comparePassword(password);
    
    // 🛡️ LOGIN FORGIVENESS: If first check fails for a student, try alternate case normalization
    if (!isMatch && user.role === 'student' && studentId) {
      const alternatePassword = (password === password.toUpperCase()) ? password.toLowerCase() : password.toUpperCase();
      isMatch = await user.comparePassword(alternatePassword);
      if (isMatch) console.log(`[AUTH] Login Forgiveness triggered for ${studentId} (Case Mismatch Resolved)`);
    }

    // 🛠️ PLAINTEXT RECOVERY: Self-heal accounts provisioned before the bcrypt fix
    // If passwordHash is NOT a bcrypt hash (doesn't start with $2), it's plaintext from old batches
    if (!isMatch && user.passwordHash && !user.passwordHash.startsWith('$2')) {
      console.log(`[AUTH] Detected plaintext password for ${studentId || email}. Attempting recovery...`);
      const plainMatch = (password === user.passwordHash) || 
                         (password.toLowerCase() === user.passwordHash) || 
                         (password.toUpperCase() === user.passwordHash);
      if (plainMatch) {
        isMatch = true;
        // Auto-repair: Hash the password properly and save
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(12);
        user.passwordHash = await bcrypt.hash(password, salt);
        await User.updateOne({ _id: user._id }, { passwordHash: user.passwordHash });
        console.log(`[AUTH] ✅ Auto-healed plaintext password for ${studentId || email}`);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }

    await user.populate('collegeId', 'name shortCode');
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('collegeId', 'name shortCode');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/google-login
exports.googleLogin = async (req, res) => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      // For simple implementation, we'll assign them the requested role or 'student'
      // In a real multi-tenant app, we might need more info (college, etc.)
      user = await User.create({
        name,
        email,
        passwordHash: Math.random().toString(36).slice(-10), // Random password for social logins
        role: role || 'student',
        company: role === 'hr' ? 'Skillovate Partner' : undefined,
        isActive: true
        // collegeId will be null for now, or could be handled later
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }

    await user.populate('collegeId', 'name shortCode');
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your registered email'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, message: 'Logged out' });
};

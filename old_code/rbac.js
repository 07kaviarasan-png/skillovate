/**
 * Role-Based Access Control middleware.
 * Usage: authorize('college_admin', 'super_admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`
      });
    }
    next();
  };
};

/**
 * Ensures college admins can only access their own college's data.
 * Attaches `req.collegeScope` for use in controllers.
 */
const collegeScope = (req, res, next) => {
  if (!req.user) {
    return next(); // Or return error if strict, but let authorize handle 401
  }
  if (req.user.role === 'super_admin') {
    // Super admin sees everything — no scope restriction
    req.collegeScope = null;
  } else if (req.user.role === 'college_admin' || req.user.role === 'faculty') {
    // College staff can only see their college
    req.collegeScope = req.user.collegeId._id || req.user.collegeId;
  } else if (req.user.role === 'student') {
    // Students can only see their own college
    req.collegeScope = req.user.collegeId._id || req.user.collegeId;
  } else {
    req.collegeScope = req.user.collegeId._id || req.user.collegeId;
  }
  next();
};

module.exports = { authorize, collegeScope };

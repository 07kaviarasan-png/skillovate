const User = require('./User');

/**
 * 🛰️ HEARTBEAT SYNC: Real-time state preservation
 * Implements the atomic updateOne + upsert pattern
 */
exports.saveInstitutionalState = async (req, res) => {
  const { college, rollNo, lastSession, progress, preferences, savedData } = req.body;
  const userId = req.user._id;

  try {
    // Atomic Update with Upsert
    const result = await User.updateOne(
      { _id: userId },
      {
        $set: {
          lastSession,
          progress,
          preferences,
          savedData,
          studentId: rollNo,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'State synchronized successfully',
      operation: result.upsertedCount > 0 ? 'created' : 'updated'
    });
  } catch (error) {
    console.error('[SYNC_ERROR]', error);
    res.status(500).json({ success: false, message: 'Failed to synchronize state' });
  }
};

/**
 * 📥 STATE RECONSTRUCTION: Load everything for session recovery
 */
exports.loadInstitutionalState = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User state not found' });
    }

    res.json({
      success: true,
      data: {
        college: user.lastSession?.selectedCollege,
        rollNo: user.lastSession?.rollNo,
        lastSession: user.lastSession,
        progress: user.progress,
        preferences: user.preferences || {},
        savedData: user.savedData || {},
        profile: {
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('[LOAD_ERROR]', error);
    res.status(500).json({ success: false, message: 'Failed to load user state' });
  }
};

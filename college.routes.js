const express = require('express');
const router = express.Router();
const College = require('./College');

// @route   GET api/colleges
// @desc    Get all registered colleges (Public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const colleges = await College.find({}).select('name shortCode').sort('name');
    res.json({ success: true, data: colleges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

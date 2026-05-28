const express = require('express');
const router = express.Router();
const persistenceController = require('./persistence.controller');
const auth = require('./auth');

/**
 * 🛰️ Institutional Persistence Routes
 * Registered at /api/userdata
 */

// Save / Sync state
router.post('/', auth, persistenceController.saveInstitutionalState);

// Load state for currently logged-in user
router.get('/', auth, persistenceController.loadInstitutionalState);

module.exports = router;

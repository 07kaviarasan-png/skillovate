const express = require('express');
const router = express.Router();
const batchController = require('./batch.controller');
const auth = require('./auth');

// All routes require authentication
router.use(auth);

router.post('/', batchController.submitBatch);
router.get('/pending', batchController.getPendingBatches);
router.get('/history', batchController.getFacultyHistory);
router.get('/students', batchController.getFacultyStudents);
router.patch('/:id/status', batchController.processBatch);

module.exports = router;

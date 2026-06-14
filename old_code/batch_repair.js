const mongoose = require('mongoose');
const FacultyBatch = require('./FacultyBatch');
const User = require('./User');

async function fixBatches() {
  console.log('--- STARTING BATCH REPAIR ---');
  try {
    // 1. Connect (assuming local connection if running via node)
    // In this environment, I'll use the existing index.js logic or just define the script to be run manually
    
    const batches = await FacultyBatch.find({ college: 'Selected Institution', status: 'pending' });
    console.log(`Found ${batches.length} legacy batches.`);

    for (const b of batches) {
      // Find the faculty who submitted this
      const faculty = await User.findOne({ name: b.facultyName, role: 'faculty' });
      if (faculty && faculty.collegeId) {
        b.collegeId = faculty.collegeId;
        // Also update the name if possible
        // b.college = "PSG College of Technology"; // Example
        await b.save();
        console.log(`Fixed Batch: ${b.name}`);
      } else {
        console.log(`Skipped Batch: ${b.name} - Faculty institutional link not found.`);
      }
    }
    console.log('--- REPAIR COMPLETE ---');
  } catch (err) {
    console.error('Repair failed:', err.message);
  }
}

// Note: This script is intended to be triggered via the main server context
module.exports = fixBatches;

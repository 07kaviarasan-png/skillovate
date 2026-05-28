const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./User');
const FacultyBatch = require('./FacultyBatch');

async function fixData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Fix FacultyBatch facultyId and collegeId (ensure they are ObjectIds)
    const batches = await FacultyBatch.find({});
    console.log(`Checking ${batches.length} batches...`);
    for (const batch of batches) {
      let changed = false;
      if (typeof batch.facultyId === 'string') {
        batch.facultyId = new mongoose.Types.ObjectId(batch.facultyId);
        changed = true;
      }
      if (typeof batch.collegeId === 'string') {
        batch.collegeId = new mongoose.Types.ObjectId(batch.collegeId);
        changed = true;
      }
      if (changed) {
        await batch.save();
        console.log(`Fixed Batch IDs for ${batch.batchId}`);
      }
    }

    // 2. Fix User facultyId and collegeId
    const users = await User.find({ role: 'student' });
    console.log(`Checking ${users.length} students...`);
    for (const user of users) {
      let changed = false;
      if (user.facultyId && typeof user.facultyId === 'string') {
        user.facultyId = new mongoose.Types.ObjectId(user.facultyId);
        changed = true;
      }
      if (user.collegeId && typeof user.collegeId === 'string') {
        user.collegeId = new mongoose.Types.ObjectId(user.collegeId);
        changed = true;
      }
      if (changed) {
        await User.updateOne({ _id: user._id }, { facultyId: user.facultyId, collegeId: user.collegeId });
        console.log(`Fixed User IDs for ${user.name} (${user.studentId})`);
      }
    }

    console.log('Data fix complete.');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

fixData();

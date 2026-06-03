const mongoose = require('mongoose');
const FacultyBatch = require('./FacultyBatch');
const User = require('./User');
require('dotenv').config();

async function check() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');
    
    const batchId = '1777183479975';
    const batch = await FacultyBatch.findOne({ batchId: batchId });
    if (!batch) {
      console.log('Batch not found:', batchId);
      process.exit(1);
    }
    console.log('Batch found:', batch.batchId, 'Status:', batch.status, 'FacultyId:', batch.facultyId);
    
    const studentsInBatch = batch.students.map(s => s.roll.toUpperCase());
    console.log('Roll numbers in batch:', studentsInBatch);
    
    const users = await User.find({ studentId: { $in: studentsInBatch } });
    console.log('Users found in DB for this batch:', users.length);
    users.forEach(u => {
      console.log('Student:', u.studentId, 'FacultyId in User:', u.facultyId, 'Role:', u.role);
    });

    const faculty = await User.findById(batch.facultyId);
    console.log('Faculty in DB:', faculty ? faculty.name : 'NOT FOUND', 'ID:', faculty?._id);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();

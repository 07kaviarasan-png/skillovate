const mongoose = require('mongoose');
const User = require('./User');
const FacultyBatch = require('./FacultyBatch');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const students = await User.find({ role: 'student' });
  console.log(`Total students in DB: ${students.length}`);

  const batches = await FacultyBatch.find({ status: 'approved' });
  console.log(`Total approved batches: ${batches.length}`);

  for (const batch of batches) {
    console.log(`Batch ${batch.batchId} (Faculty: ${batch.facultyName}): ${batch.students.length} students`);
    const linkedStudents = await User.find({ facultyId: batch.facultyId, role: 'student' });
    console.log(`  -> Students linked to this faculty in DB: ${linkedStudents.length}`);
    
    if (linkedStudents.length === 0 && batch.students.length > 0) {
        console.log('  [!] ALERT: Batch approved but students NOT linked in User collection!');
        // Check if students exist but have wrong facultyId
        const sampleRoll = batch.students[0].roll;
        const student = await User.findOne({ studentId: sampleRoll.toUpperCase() });
        if (student) {
            console.log(`  [?] Found student ${sampleRoll} but facultyId is: ${student.facultyId}`);
            console.log(`      Batch facultyId is: ${batch.facultyId}`);
        } else {
            console.log(`  [?] Student ${sampleRoll} NOT FOUND in User collection.`);
        }
    }
  }

  process.exit();
}

check();

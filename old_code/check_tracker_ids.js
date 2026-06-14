const mongoose = require('mongoose');
const User = require('./User');
require('dotenv').config({ path: './.env' });

async function checkStudents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const students = await User.find({ role: 'student' });
    
    let stringIdCount = 0;
    let objectIdCount = 0;
    let nullIdCount = 0;
    
    students.forEach(s => {
      if (!s.facultyId) nullIdCount++;
      else if (typeof s.facultyId === 'string') stringIdCount++;
      else objectIdCount++;
    });
    
    console.log('---STUDENT_STATS---');
    console.log(`Total Students: ${students.length}`);
    console.log(`ObjectId facultyId: ${objectIdCount}`);
    console.log(`String facultyId: ${stringIdCount}`);
    console.log(`Null facultyId: ${nullIdCount}`);
    console.log('---END_STATS---');
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

checkStudents();

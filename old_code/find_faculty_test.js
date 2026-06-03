const mongoose = require('mongoose');
const User = require('./User');
require('dotenv').config({ path: './.env' });

async function findFaculty() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const faculty = await User.findOne({ role: 'faculty' }).populate('collegeId');
    if (faculty) {
      console.log('---FACULTY_DATA---');
      console.log(JSON.stringify(faculty, null, 2));
      console.log('---END_FACULTY_DATA---');
    } else {
      console.log('No faculty found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

findFaculty();

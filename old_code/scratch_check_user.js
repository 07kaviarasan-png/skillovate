const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./User');
const College = require('./College');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const admin = await User.findOne({ email: /[EMAIL_ADDRESS]/i });
  console.log('ADMIN:', JSON.stringify(admin, null, 2));

  if (admin && admin.collegeId) {
    const students = await User.find({ collegeId: admin.collegeId, role: 'student' });
    console.log(`FOUND ${students.length} STUDENTS FOR COLLEGE ${admin.collegeId}`);
    if (students.length > 0) {
      console.log('SAMPLE STUDENT:', JSON.stringify(students[0], null, 2));
    }
  } else {
    console.log('ADMIN HAS NO COLLEGE ID!');
  }

  process.exit();
}

check();

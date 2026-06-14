const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./User');
const Student = require('./Student');
const College = require('./College');

async function checkKCW() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'KAVI123' });
    console.log('✅ Connected to DB');

    const kcw = await College.findOne({ name: /KCW/i });
    if (!kcw) {
      console.log('❌ KCW College not found');
      return;
    }
    console.log(`📌 KCW ID: ${kcw._id} (${kcw.name})`);

    const userStudents = await User.find({ role: 'student', collegeId: kcw._id });
    console.log(`📊 Users (role student) in KCW: ${userStudents.length}`);

    const legacyStudents = await Student.find({ college_id: kcw._id.toString() });
    console.log(`📊 Legacy Student records in KCW: ${legacyStudents.length}`);

    // If 0, let's look for ANY students that might have a similar name or different ID format
    if (userStudents.length === 0) {
      const allStudents = await User.find({ role: 'student' }).limit(5);
      console.log('Sample students from other colleges for ID comparison:');
      allStudents.forEach(s => console.log(`- ${s.name} | CollegeID: ${s.collegeId}`));
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkKCW();

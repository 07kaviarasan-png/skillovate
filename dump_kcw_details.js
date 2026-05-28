const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./User');

async function dumpKCWStudents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'KAVI123' });
    
    // Find the KCW Admin
    const admin = await User.findOne({ email: /kaviarasan/i, role: 'college_admin' });
    if (!admin) {
      console.log('Admin not found');
      return;
    }

    const students = await User.find({ role: 'student', collegeId: admin.collegeId });
    console.log(`--- KCW Student Database Summary (Admin: ${admin.email}) ---`);
    console.log(`Total Count: ${students.length}`);
    
    if (students.length > 0) {
      console.log('\nTop 5 Students:');
      students.slice(0, 5).forEach(s => {
        console.log(`- ${s.name} (${s.studentId}) | Status: ${s.status} | Dept: ${s.department}`);
      });
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

dumpKCWStudents();

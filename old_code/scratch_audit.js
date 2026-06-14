const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./User');

async function audit() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'KAVI123' });
    console.log('Connected');

    const students = await User.find({ role: 'student' });
    console.log(`TOTAL STUDENTS: ${students.length}`);

    const colleges = {};
    students.forEach(s => {
      const cid = s.collegeId ? s.collegeId.toString() : 'NULL';
      colleges[cid] = (colleges[cid] || 0) + 1;
    });

    console.log('COLLEGE DISTRIBUTION:', JSON.stringify(colleges, null, 2));

    const admins = await User.find({ role: 'college_admin' });
    admins.forEach(a => {
      console.log(`ADMIN: ${a.email} | COLLEGE: ${a.collegeId || 'NULL'}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

audit();

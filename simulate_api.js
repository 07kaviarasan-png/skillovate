const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./User');

async function simulateAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'KAVI123' });
    
    const admin = await User.findOne({ email: /kaviarasan/i, role: 'college_admin' });
    const filter = { role: 'student', collegeId: admin.collegeId };
    
    // Simulate the populate logic in controller
    const students = await User.find(filter).populate('collegeId facultyId').limit(10);
    
    console.log('--- Simulated API Response Structure ---');
    console.log(JSON.stringify(students[0], null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

simulateAPI();

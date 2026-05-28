const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const User = require(path.join(process.cwd(), 'server', 'src', 'models', 'User'));
const College = require(path.join(process.cwd(), 'server', 'src', 'models', 'College'));
require('dotenv').config({ path: path.join(process.cwd(), 'server', '.env') });

const testRegister = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'KAVI123' });
    
    const testEmail = "testadmin_" + Date.now() + "@skillovate.com";
    const college = await College.findOne({ name: "Karpagam Academy of Higher Education" });
    
    if (!college) {
      console.error('College not found');
      process.exit(1);
    }

    const payload = {
      name: "Test Admin",
      email: testEmail,
      collegeName: college.name,
      collegeId: college._id.toString(),
      password: "password123",
      role: "college_admin"
    };

    console.log('Attempting registration with:', testEmail);
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    console.log('Registration Response Status:', response.status);
    console.log('Registration Response Body:', data);
    
    if (response.ok) {
       console.log('SUCCESS: Registration works');
    } else {
       console.log('FAILED: Registration failed');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Registration Failed:', err.message);
    process.exit(1);
  }
};

testRegister();

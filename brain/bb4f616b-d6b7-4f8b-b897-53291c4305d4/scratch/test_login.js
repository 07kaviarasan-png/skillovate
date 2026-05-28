const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const User = require(path.join(process.cwd(), 'server', 'src', 'models', 'User'));
require('dotenv').config({ path: path.join(process.cwd(), 'server', '.env') });

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'KAVI123' });
    
    const email = "kavi@gmail.com";
    const password = "kavi"; // Inferred from screenshot where they typed dots
    
    const payload = { email, password, role: 'college_admin' };

    console.log('Attempting login for:', email);
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    console.log('Login Response Status:', response.status);
    console.log('Login Response Body:', data);
    
    if (response.ok) {
       console.log('SUCCESS: Login works');
    } else {
       console.log('FAILED: Login failed');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Login Failed:', err.message);
    process.exit(1);
  }
};

testLogin();

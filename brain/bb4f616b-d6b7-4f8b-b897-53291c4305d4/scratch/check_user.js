const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const User = require(path.join(process.cwd(), 'server', 'src', 'models', 'User'));
require('dotenv').config({ path: path.join(process.cwd(), 'server', '.env') });

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'KAVI123' });
    const email = "kavi@gmail.com";
    const user = await User.findOne({ email });
    console.log('User found:', user);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUser();

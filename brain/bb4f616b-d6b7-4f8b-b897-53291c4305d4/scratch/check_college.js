const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const College = require(path.join(process.cwd(), 'server', 'src', 'models', 'College'));
require('dotenv').config({ path: path.join(process.cwd(), 'server', '.env') });

const checkCollege = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'KAVI123' });
    const target = "Karpagam Academy of Higher Education";
    const college = await College.findOne({
      $or: [
        { name: { $regex: new RegExp(`^\\s*${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') } },
        { shortCode: target.toUpperCase() }
      ]
    });
    console.log('College found:', college);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkCollege();

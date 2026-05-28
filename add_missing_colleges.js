require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const College = require('./College');

async function addColleges() {
  await connectDB();
  
  const newColleges = [
    { 
      name: 'PSGR Krishnammal College for Women', 
      shortCode: 'PSGR', 
      location: 'Coimbatore', 
      departments: ['CSE', 'BCA', 'Commerce', 'Mathematics', 'English'] 
    },
    { 
      name: 'PSG College of Technology', 
      shortCode: 'PSGTECH', 
      location: 'Coimbatore', 
      departments: ['CSE', 'ECE', 'Mechanical', 'Civil', 'EEE', 'IT', 'Production'] 
    }
  ];

  for (const col of newColleges) {
    const exists = await College.findOne({ name: col.name });
    if (!exists) {
      await College.create(col);
      console.log(`✅ Added: ${col.name}`);
    } else {
      console.log(`ℹ️ Already exists: ${col.name}`);
    }
  }

  console.log('\nMigration complete.');
  process.exit(0);
}

addColleges().catch(err => {
  console.error(err);
  process.exit(1);
});

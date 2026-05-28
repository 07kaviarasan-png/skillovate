
require('dotenv').config({ path: '../server/.env' });
const mongoose = require('mongoose');
const FacultyBatch = require('../server/src/models/FacultyBatch');
const User = require('../server/src/models/User');
const bcrypt = require('bcryptjs');

const BATCH_ID = '69ec7278c4d31b5b940f2359';

async function repair() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const batch = await FacultyBatch.findById(BATCH_ID);
    if (!batch) {
      console.log('Batch not found');
      process.exit(1);
    }

    console.log(`Processing batch: ${batch.name} (${batch.batchId})`);
    
    const faculty = await User.findById(batch.facultyId);
    let collegeIdToUse = faculty?.collegeId || batch.collegeId;

    if (!collegeIdToUse) {
       console.log('College ID not found');
       process.exit(1);
    }

    let created = 0;
    for (const s of batch.students) {
      try {
        const passwordToHash = s.roll.toLowerCase();
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(passwordToHash, salt);

        const studentEmail = (s.email && s.email.trim() !== '') 
          ? s.email.toLowerCase() 
          : `${s.roll.toLowerCase()}@skillovate-edu.com`;

        await User.findOneAndUpdate(
          { 
            $or: [
              { studentId: s.roll.toUpperCase(), collegeId: collegeIdToUse },
              { email: studentEmail }
            ] 
          },
          {
            name: s.name || 'Skillovate Learner',
            email: studentEmail,
            role: 'student',
            collegeId: collegeIdToUse,
            studentId: s.roll.toUpperCase(),
            department: batch.department,
            year: parseInt(batch.year) || undefined,
            facultyId: batch.facultyId,
            passwordHash: hashedPassword
          },
          { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );
        created++;
      } catch (err) {
        console.error(`Failed ${s.roll}:`, err.message);
      }
    }

    console.log(`Successfully provisioned ${created} students`);
    
    batch.status = 'approved';
    await batch.save();
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

repair();

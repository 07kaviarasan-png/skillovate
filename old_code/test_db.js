const mongoose = require('mongoose');
const User = require('./User');
const FacultyBatch = require('./FacultyBatch');

async function checkDb() {
  try {
    await mongoose.connect('mongodb+srv://07kaviarasan:Kavin123@ac-uudxrgg.wdl8tpt.mongodb.net/test?retryWrites=true&w=majority');
    
    // Process the pending batch "69ec7278c4d31b5b940f2359" manually
    const batch = await FacultyBatch.findById("69ec7278c4d31b5b940f2359");
    if (!batch) {
      console.log("Batch not found");
      return;
    }
    
    console.log(`Processing Batch: ${batch.batchId}, status: ${batch.status}, processedAt: ${batch.processedAt}`);
    
    const creationResults = { total: batch.students.length, created: 0, skipped: 0 };
    for (const s of batch.students) {
      try {
        const studentEmail = (s.email && s.email.trim() !== '') 
          ? s.email.toLowerCase() 
          : `${s.roll.toLowerCase()}@skillovate-edu.com`;

        const user = await User.findOneAndUpdate(
          { 
            $or: [
              { studentId: s.roll.toUpperCase(), collegeId: batch.collegeId },
              { email: studentEmail }
            ] 
          },
          {
            name: s.name || 'Skillovate Learner',
            email: studentEmail,
            role: 'student',
            collegeId: batch.collegeId,
            studentId: s.roll.toUpperCase(),
            department: batch.department,
            year: parseInt(batch.year) || undefined,
            facultyId: batch.facultyId,
            passwordHash: 'dummyhash'
          },
          { 
            upsert: true, 
            new: true, 
            runValidators: true,
            setDefaultsOnInsert: true 
          }
        );
        console.log(`Success: ${s.roll} -> FacultyID: ${user.facultyId}`);
        creationResults.created++;
      } catch (err) {
        console.error(`Error for ${s.roll}:`, err.message);
      }
    }
    console.log("Creation results:", creationResults);
    
    mongoose.disconnect();
  } catch (err) {
    console.error("DB Error:", err);
  }
}

checkDb();

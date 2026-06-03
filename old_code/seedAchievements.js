require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./User');
const Achievement = require('./Achievement');
const College = require('./College');

async function seedAchievements() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'KAVI123' });
    console.log('✅ Connected to seed achievements');

    const students = await User.find({ role: 'student' }).limit(50);
    const colleges = await College.find();
    
    const achievementsPool = [
      { type: 'top_scorer', title: 'Top Scorer', description: 'Scored above 90% in Aptitude Mock', sourceModule: 'test' },
      { type: 'excellent_communicator', title: 'Excellent Communicator', description: 'Exceptional performance in Mock Interview', sourceModule: 'interview' },
      { type: 'placed_candidate', title: 'Placed Candidate', description: 'Successfully placed at a top MNC', sourceModule: 'placement' },
      { type: 'consistent_learner', title: 'Consistent Learner', description: 'Active for 7+ consecutive days', sourceModule: 'system' },
      { type: 'dream_offer', title: 'Dream Offer Achiever', description: 'Received an offer above 10 LPA', sourceModule: 'placement' }
    ];

    const newAchievements = [];
    for (const student of students) {
      // Give each student 1-3 random achievements
      const count = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...achievementsPool].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < count; i++) {
        newAchievements.push({
          studentId: student._id,
          collegeId: student.collegeId,
          ...shuffled[i],
          metricValue: Math.floor(Math.random() * 100) + 1,
          achievedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000)
        });
      }
    }

    await Achievement.insertMany(newAchievements);
    console.log(`✅ Seeded ${newAchievements.length} achievements for ${students.length} students`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed achievements:', err);
    process.exit(1);
  }
}

seedAchievements();

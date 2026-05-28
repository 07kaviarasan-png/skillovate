/**
 * Cleanup Script — Removes all sample/seed data while preserving the system structure.
 * 
 * Preserves:
 * - Super Admin account
 * - College entries (the 10 colleges you provided)
 * 
 * Removes:
 * - All Students and Faculty
 * - All Test Attempts
 * - All Mock Interviews
 * - All Placement Records
 * - All Achievements
 */
require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'KAVI123' });
    console.log('✅ Connected to KAVI123 for cleanup');

    // 1. Delete all activity data
    console.log('🧹 Clearing activity data...');
    await Promise.all([
      mongoose.connection.db.collection('testattempts').deleteMany({}),
      mongoose.connection.db.collection('interviews').deleteMany({}),
      mongoose.connection.db.collection('placements').deleteMany({}),
      mongoose.connection.db.collection('achievements').deleteMany({}),
      mongoose.connection.db.collection('applications').deleteMany({})
    ]);
    console.log('   ✅ All activity data removed');

    // 2. Delete all Users EXCEPT Super Admin
    console.log('👤 Clearing sample users (Students/Faculty)...');
    const result = await mongoose.connection.db.collection('users').deleteMany({
      role: { $ne: 'super_admin' }
    });
    console.log(`   ✅ Removed ${result.deletedCount} sample users`);

    // Note: Colleges are preserved as they represent your real setup.
    const collegeCount = await mongoose.connection.db.collection('colleges').countDocuments();
    console.log(`🏰 Preserved ${collegeCount} colleges for your real setup`);

    const admin = await mongoose.connection.db.collection('users').findOne({ role: 'super_admin' });
    if (admin) {
      console.log(`🔑 Super Admin preserved: ${admin.email}`);
    } else {
      console.log('⚠️ No Super Admin found. You may need to run seed again to restore the admin account.');
    }

    await mongoose.connection.close();
    console.log('\n🚀 Database cleaned! Ready for real-time data registration.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
  }
}

cleanup();

require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

async function fix() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'KAVI123'
    });
    console.log('✅ Connected to MongoDB');

    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`🔍 Found ${collections.length} collections`);

    for (const col of collections) {
      console.log(`\n🧹 Dropping indexes for: ${col.name}...`);
      try {
        await conn.connection.db.collection(col.name).dropIndexes();
        console.log(`   ✅ Dropped all indexes for ${col.name}`);
      } catch (e) {
        console.log(`   ℹ️  Note: ${e.message}`);
      }
    }

    await mongoose.connection.close();
    console.log('\n🚀 All indexes dropped. Ready for fresh seed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fix();

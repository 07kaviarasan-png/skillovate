require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS to bypass potential ISP blocks on SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

console.log('🔍 Testing MongoDB connection with custom DNS (8.8.8.8)...');

async function test() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'KAVI123',
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });
    console.log('✅ SUCCESS! Connected to:', conn.connection.host);
    console.log('📦 Database:', conn.connection.name);
    
    // Send sample data
    const db = conn.connection.db;
    const result = await db.collection('test_ping').insertOne({
      ping: true,
      message: 'Skillovate connection verified with custom DNS!',
      timestamp: new Date()
    });
    console.log('✅ Sample data inserted! ID:', result.insertedId.toString());
    
    await mongoose.connection.close();
    console.log('✅ Connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Connection FAILED');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    if (err.reason) {
      console.error('Reason:', JSON.stringify(err.reason, null, 2));
    }
    process.exit(1);
  }
}

test();

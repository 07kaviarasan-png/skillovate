const mongoose = require('mongoose');
require('dotenv').config();
const FacultyBatch = require('./FacultyBatch');
const User = require('./User');
const Student = require('./Student');
const College = require('./College');

async function sealIdentities() {
    try {
        console.log('🚀 INITIALIZING MASTER IDENTITY SEAL...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find the definitive Karpagam ID
        const karpagam = await College.findOne({ name: /Karpagam Academy/i });
        if (!karpagam) throw new Error('Karpagam College record missing!');
        const definitiveId = karpagam._id;
        console.log(`📌 Definitive Institutional ID: ${definitiveId} (${karpagam.name})`);

        // 2. Find all PENDING and mistakenly PENDING batches
        const pendingBatches = await FacultyBatch.find({ 
            $or: [{ status: 'pending' }, { status: { $exists: false } }] 
        });
        console.log(`📂 Found ${pendingBatches.length} batches requiring seal.`);

        for (const batch of pendingBatches) {
            console.log(`🛠️ Sealing Batch: ${batch.batchId} (${batch.name})...`);
            
            // Repair batch links
            batch.collegeId = definitiveId;
            batch.status = 'approved';
            batch.processedAt = Date.now();

            for (const s of batch.students) {
                console.log(`   ⚓ Anchoring Student: ${s.roll}`);
                
                // AUTHORITATIVE SYNC: Bypasses email clashes and repairs drift
                await User.findOneAndUpdate(
                    { 
                      $or: [
                        { studentId: s.roll.toUpperCase() },
                        { email: s.email.toLowerCase() }
                      ] 
                    },
                    {
                      name: s.name,
                      email: s.email.toLowerCase(),
                      role: 'student',
                      collegeId: definitiveId,
                      studentId: s.roll.toUpperCase(),
                      // Set password to roll number (lowercase). Model hook handles hashing.
                      passwordHash: s.roll.toLowerCase()
                    },
                    { 
                      upsert: true, 
                      runValidators: true,
                      setDefaultsOnInsert: true 
                    }
                );

                s.status = 'approved';
            }
            await batch.save();
            console.log(`   ✅ Batch ${batch.batchId} Anchored & Sealed.`);
        }

        console.log('\n✨ UNIVERSAL SEAL COMPLETE. All students are now active.');
        process.exit(0);
    } catch (error) {
        console.error('❌ SEAL FAILED:', error.message);
        process.exit(1);
    }
}

sealIdentities();

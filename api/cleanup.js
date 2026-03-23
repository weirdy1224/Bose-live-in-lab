// server/server/cleanup.js
// Run this after seed.js to clean orphaned data

const mongoose = require('mongoose');
const EnrollmentModel = require('./models/Enrollment');
const StudyGroupModel = require('./models/StudyGroup');
const GroupMessageModel = require('./models/GroupMessage');

mongoose.connect('mongodb://localhost:27017/live-in')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const cleanupOrphanedData = async () => {
  try {
    console.log('🧹 Starting cleanup of orphaned data...\n');
    
    // 1. Delete all enrollments (since courses were reset)
    const enrollResult = await EnrollmentModel.deleteMany({});
    console.log(`✅ Deleted ${enrollResult.deletedCount} orphaned enrollments`);
    
    // 2. Find and delete groups with null courseId
    const orphanedGroups = await StudyGroupModel.find({ courseId: null });
    console.log(`⚠️  Found ${orphanedGroups.length} groups with null courseId`);
    
    if (orphanedGroups.length > 0) {
      // Delete messages from orphaned groups
      const groupIds = orphanedGroups.map(g => g._id);
      const messageResult = await GroupMessageModel.deleteMany({ groupId: { $in: groupIds } });
      console.log(`✅ Deleted ${messageResult.deletedCount} messages from orphaned groups`);
      
      // Delete the orphaned groups
      const groupResult = await StudyGroupModel.deleteMany({ courseId: null });
      console.log(`✅ Deleted ${groupResult.deletedCount} orphaned groups`);
    }
    
    console.log('\n✨ Database cleaned successfully!');
    console.log('📝 Summary:');
    console.log(`   - Enrollments cleaned: ${enrollResult.deletedCount}`);
    console.log(`   - Groups cleaned: ${orphanedGroups.length}`);
    console.log(`   - Messages cleaned: ${orphanedGroups.length > 0 ? 'Yes' : 'No'}`);
    console.log('\n🎯 Users can now:');
    console.log('   ✓ Enroll in courses fresh');
    console.log('   ✓ Create new study groups');
    console.log('   ✓ Browse without errors\n');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
    process.exit(1);
  }
};

cleanupOrphanedData();

// ============================================
// HOW TO USE:
// ============================================
// 1. After running seed.js, run: node cleanup.js
// 2. This removes ALL orphaned data:
//    - Enrollments with deleted courses
//    - Study groups with deleted courses
//    - Messages from deleted groups
// 3. Users can now use the platform fresh
// ============================================

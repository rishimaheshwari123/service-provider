const mongoose = require('mongoose');
const Property = require('../models/propertyModel');
const Category = require('../models/categoryModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const cleanupInvalidProperties = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('📦 Connected to MongoDB for cleanup');

    // Get all properties with "undefined" category
    const invalidProperties = await Property.find({
      category: "undefined"
    });

    console.log(`🔍 Found ${invalidProperties.length} properties with invalid category "undefined"`);

    if (invalidProperties.length === 0) {
      console.log('✅ No invalid properties found');
      process.exit(0);
    }

    // Option 1: Delete all invalid properties
    console.log('\n⚠️  These properties have invalid category data and cannot be migrated.');
    console.log('Options:');
    console.log('1. Delete all invalid properties');
    console.log('2. Assign them to a default category');
    
    // For now, let's delete them since they have no valid category data
    const deleteResult = await Property.deleteMany({
      category: "undefined"
    });

    console.log(`\n🗑️  Deleted ${deleteResult.deletedCount} invalid properties`);

    // Verify cleanup
    const remainingInvalid = await Property.countDocuments({
      category: "undefined"
    });

    const totalProperties = await Property.countDocuments();
    
    console.log('\n📊 Cleanup Summary:');
    console.log(`✅ Deleted: ${deleteResult.deletedCount} invalid properties`);
    console.log(`📋 Remaining properties: ${totalProperties}`);
    console.log(`❌ Remaining invalid: ${remainingInvalid}`);

    if (remainingInvalid === 0) {
      console.log('🎉 Cleanup completed successfully!');
    }

    process.exit(0);

  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  }
};

// Run cleanup if called directly
if (require.main === module) {
  cleanupInvalidProperties();
}

module.exports = cleanupInvalidProperties;
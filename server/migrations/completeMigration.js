const mongoose = require('mongoose');
const Property = require('../models/propertyModel');
const Category = require('../models/categoryModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const completeMigration = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('📦 Connected to MongoDB for final migration');

    // Category mappings for the failed properties
    const categoryMappings = {
      "Gas Chulha, Mixer Grinder, Cooker Store": "695a323b5e579b71d26fd571",
      "Online Services (M.P. ONLINE)": "695a34f25e579b71d26fd60e",
      "Doctor": "695a30d95e579b71d26fd4ff",
      "Nurse Staff (Male)": "6971c42897cc3b0052844d3d",
      "Car Dealer (Old)": "695a2e535e579b71d26fd44a",
      "Numerologist (Ank Shastri)": "695a35e45e579b71d26fd681",
      "Nursery (Gardening)": "695a31eb5e579b71d26fd55e",
      "Nurse Staff ( female)": "695a35ed5e579b71d26fd686",
      "Chartered Accountant (CA)": "695a2ec55e579b71d26fd477",
      "Vegetable (Sabji) wala": "69c10e55ca1f05b90e60189d",
      "Net Service (Wifi, Sim)": "695a35aa5e579b71d26fd668"
    };

    console.log('\n🔄 Completing migration for remaining properties...\n');

    let totalMigrated = 0;
    let totalFailed = 0;

    for (let [categoryName, categoryId] of Object.entries(categoryMappings)) {
      try {
        // Find properties with this category name
        const properties = await Property.find({ category: categoryName });
        
        if (properties.length > 0) {
          console.log(`📋 Found ${properties.length} properties with category: "${categoryName}"`);
          
          // Update all properties with this category
          const updateResult = await Property.updateMany(
            { category: categoryName },
            { $set: { category: new mongoose.Types.ObjectId(categoryId) } }
          );

          console.log(`✅ Updated ${updateResult.modifiedCount} properties to use ObjectId: ${categoryId}`);
          totalMigrated += updateResult.modifiedCount;
          
          // List the updated properties
          properties.forEach(prop => {
            console.log(`   - Property ${prop._id}: "${prop.title}"`);
          });
          console.log('');
        } else {
          console.log(`⚠️  No properties found with category: "${categoryName}"`);
        }
      } catch (error) {
        console.error(`❌ Error migrating category "${categoryName}":`, error.message);
        totalFailed++;
      }
    }

    // Final verification
    console.log('\n🔍 Final verification...');
    
    const stringCategories = await Property.countDocuments({
      $or: [
        { category: { $type: "string" } },
        { category: { $exists: false } },
        { category: null }
      ]
    });
    
    const objectIdCategories = await Property.countDocuments({ 
      category: { $type: "objectId" } 
    });
    
    const totalProperties = await Property.countDocuments();

    console.log('\n📊 FINAL MIGRATION SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Properties migrated in this run: ${totalMigrated}`);
    console.log(`❌ Categories failed to migrate: ${totalFailed}`);
    console.log(`📋 Total properties: ${totalProperties}`);
    console.log(`🎯 ObjectId categories: ${objectIdCategories}`);
    console.log(`⚠️  String/Invalid categories: ${stringCategories}`);
    console.log(`📈 Migration success rate: ${((objectIdCategories / totalProperties) * 100).toFixed(1)}%`);

    if (stringCategories === 0) {
      console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('All properties now have proper ObjectId category references.');
    } else {
      console.log(`\n⚠️  ${stringCategories} properties still have invalid categories.`);
      
      // Show remaining invalid properties
      const invalidProperties = await Property.find({
        $or: [
          { category: { $type: "string" } },
          { category: { $exists: false } },
          { category: null }
        ]
      }).limit(10);

      console.log('\nRemaining invalid properties:');
      invalidProperties.forEach(prop => {
        console.log(`  - ${prop._id}: "${prop.title}" (category: ${prop.category})`);
      });
    }

    process.exit(0);

  } catch (error) {
    console.error('💥 Final migration failed:', error);
    process.exit(1);
  }
};

completeMigration();
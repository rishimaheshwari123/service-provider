const mongoose = require('mongoose');
const Property = require('../models/propertyModel');
const Category = require('../models/categoryModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const migrateCategoryNames = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('📦 Connected to MongoDB for migration');

    // Get all properties where category is string (name)
    const properties = await Property.find({
      $and: [
        { category: { $type: "string" } },
        { category: { $ne: null } },
        { category: { $ne: "" } },
        { category: { $exists: true } }
      ]
    });

    console.log(`🔍 Found ${properties.length} properties with category names to migrate`);

    if (properties.length === 0) {
      console.log('✅ No properties need migration - all categories are already ObjectIds');
      process.exit(0);
    }

    let migrated = 0;
    let failed = [];

    for (let property of properties) {
      try {
        // Skip if category is null, undefined, or empty
        if (!property.category || property.category.trim() === '') {
          console.log(`⚠️ Skipping property ${property._id}: empty category`);
          continue;
        }

        // Find category by name (case insensitive)
        const category = await Category.findOne({ 
          name: { $regex: new RegExp(`^${property.category.trim()}$`, 'i') }
        });

        if (category) {
          // Update property with category ObjectId
          await Property.findByIdAndUpdate(property._id, {
            category: category._id
          });
          
          console.log(`✅ Migrated property ${property._id}: "${property.category}" -> ${category._id}`);
          migrated++;
        } else {
          console.log(`❌ Category not found for: "${property.category}" in property ${property._id}`);
          failed.push({
            propertyId: property._id,
            categoryName: property.category,
            propertyTitle: property.title
          });
        }
      } catch (error) {
        console.error(`❌ Error migrating property ${property._id}:`, error.message);
        failed.push({
          propertyId: property._id,
          categoryName: property.category,
          error: error.message
        });
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migrated} properties`);
    console.log(`❌ Failed migrations: ${failed.length} properties`);

    if (failed.length > 0) {
      console.log('\n❌ Failed Properties:');
      failed.forEach(f => {
        console.log(`  - Property ID: ${f.propertyId}`);
        console.log(`    Category Name: "${f.categoryName}"`);
        console.log(`    Property Title: "${f.propertyTitle || 'N/A'}"`);
        if (f.error) console.log(`    Error: ${f.error}`);
        console.log('');
      });
    }

    console.log('🎉 Migration completed!');
    process.exit(0);

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateCategoryNames();
}

module.exports = migrateCategoryNames;
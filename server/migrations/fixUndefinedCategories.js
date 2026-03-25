const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fixUndefinedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('📦 Connected to MongoDB for category fix');

    const db = mongoose.connection.db;
    const propertiesCollection = db.collection('properties');
    const categoriesCollection = db.collection('categories');

    // Get all properties (since we know they all have undefined categories)
    const properties = await propertiesCollection.find({}).toArray();
    console.log(`🔍 Found ${properties.length} total properties`);

    // Get all categories for mapping
    const categories = await categoriesCollection.find({}).toArray();
    console.log(`📋 Available categories: ${categories.length}`);

    // Create category mapping based on keywords in titles
    const categoryMappings = {
      // Exact matches first
      'motivational speaker': '695a35e45e579b71d26fd681', // Numerologist (closest match)
      'tent house': '695a2d955e579b71d26fd409', // Band Party (event related)
      'kitchen appliances store': '695a323b5e579b71d26fd571', // Gas, Mixer, Cooker Repairman
      'electrician': '695a2ccc5e579b71d26fd3dd', // A. C. Repairing (electrical)
      'advocate': '690885392a8eb5b01a0a5967', // Advocate
      'helper hazari': '695a2d8a5e579b71d26fd404', // Bajewala & Baggi/Ghoda wala
      'ladies tailor': '695a35ed5e579b71d26fd686', // Nurse Staff (female) - closest service match
      'dance class': '695a2d955e579b71d26fd409', // Band Party (entertainment)
      'photo copy': '695a34f25e579b71d26fd60e', // Online Services
      'xerox': '695a34f25e579b71d26fd60e', // Online Services
      
      // Keyword-based matching
      'gas': '695a323b5e579b71d26fd571',
      'mixer': '695a323b5e579b71d26fd571',
      'cooker': '695a323b5e579b71d26fd571',
      'kitchen': '695a323b5e579b71d26fd571',
      'appliances': '695a323b5e579b71d26fd571',
      'doctor': '695a30d95e579b71d26fd4ff',
      'medical': '695a30d95e579b71d26fd4ff',
      'nurse': '695a35ed5e579b71d26fd686',
      'advocate': '690885392a8eb5b01a0a5967',
      'lawyer': '690885392a8eb5b01a0a5967',
      'legal': '690885392a8eb5b01a0a5967',
      'plumber': '6908588559c3aace57c4a8cd',
      'plumbing': '6908588559c3aace57c4a8cd',
      'electrician': '695a2ccc5e579b71d26fd3dd',
      'electrical': '695a2ccc5e579b71d26fd3dd',
      'tailor': '695a35ed5e579b71d26fd686',
      'fashion': '695a35ed5e579b71d26fd686',
      'tent': '695a2d955e579b71d26fd409',
      'event': '695a2d955e579b71d26fd409',
      'dance': '695a2d955e579b71d26fd409',
      'music': '695a2d955e579b71d26fd409',
      'band': '695a2d955e579b71d26fd409',
      'photo': '695a34f25e579b71d26fd60e',
      'copy': '695a34f25e579b71d26fd60e',
      'xerox': '695a34f25e579b71d26fd60e',
      'online': '695a34f25e579b71d26fd60e',
      'digital': '695a34f25e579b71d26fd60e'
    };

    let migrated = 0;
    let failed = [];
    let defaultCategoryId = new mongoose.Types.ObjectId('6908588559c3aace57c4a8cd'); // Plumber as default

    console.log('\n🔄 Starting migration...\n');

    for (let property of properties) {
      try {
        let assignedCategoryId = null;
        let matchReason = '';

        const title = (property.title || '').toLowerCase();
        const description = (property.description || '').toLowerCase();
        const searchText = `${title} ${description}`.toLowerCase();

        // Try exact title matches first
        for (let [key, categoryId] of Object.entries(categoryMappings)) {
          if (title.includes(key.toLowerCase())) {
            assignedCategoryId = new mongoose.Types.ObjectId(categoryId);
            matchReason = `Matched title keyword: "${key}"`;
            break;
          }
        }

        // If no match found, use default
        if (!assignedCategoryId) {
          assignedCategoryId = defaultCategoryId;
          matchReason = 'No keyword match - assigned default category (Plumber)';
        }

        // Update property with category ObjectId using raw MongoDB
        await propertiesCollection.updateOne(
          { _id: property._id },
          { $set: { category: assignedCategoryId } }
        );

        // Get category name for logging
        const category = categories.find(cat => cat._id.toString() === assignedCategoryId.toString());
        const categoryName = category ? category.name : 'Unknown';

        console.log(`✅ Property ${property._id}: "${property.title}"`);
        console.log(`   → Category: ${categoryName} (${assignedCategoryId})`);
        console.log(`   → Reason: ${matchReason}`);
        console.log('');

        migrated++;

      } catch (error) {
        console.error(`❌ Error migrating property ${property._id}:`, error.message);
        failed.push({
          propertyId: property._id,
          title: property.title,
          error: error.message
        });
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log('='.repeat(80));
    console.log(`✅ Successfully migrated: ${migrated} properties`);
    console.log(`❌ Failed migrations: ${failed.length} properties`);

    if (failed.length > 0) {
      console.log('\n❌ Failed Properties:');
      failed.forEach(f => {
        console.log(`  - Property ID: ${f.propertyId}`);
        console.log(`    Title: "${f.title}"`);
        console.log(`    Error: ${f.error}`);
        console.log('');
      });
    }

    // Final verification
    console.log('\n🔍 Final verification...');
    
    const undefinedCategories = await propertiesCollection.countDocuments({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: undefined }
      ]
    });
    
    const objectIdCategories = await propertiesCollection.countDocuments({ 
      category: { $type: "objectId" } 
    });
    
    const totalProperties = await propertiesCollection.countDocuments();

    console.log('\n📈 FINAL RESULTS:');
    console.log('='.repeat(80));
    console.log(`📋 Total properties: ${totalProperties}`);
    console.log(`🎯 ObjectId categories: ${objectIdCategories}`);
    console.log(`⚠️  Undefined categories: ${undefinedCategories}`);
    console.log(`📊 Success rate: ${((objectIdCategories / totalProperties) * 100).toFixed(1)}%`);

    if (undefinedCategories === 0) {
      console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('All properties now have proper ObjectId category references.');
    } else {
      console.log(`\n⚠️  ${undefinedCategories} properties still have undefined categories.`);
    }

    console.log('\n🎉 Migration completed!');
    process.exit(0);

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
};

fixUndefinedCategories();
const mongoose = require('mongoose');
const Property = require('../models/propertyModel');
const Category = require('../models/categoryModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const migrateUndefinedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('📦 Connected to MongoDB for undefined category migration');

    // Get all properties with undefined categories
    // Use raw MongoDB query to avoid Mongoose casting issues
    const properties = await Property.collection.find({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: undefined }
      ]
    }).toArray();

    // Convert to Mongoose documents for easier handling
    const propertyDocs = properties.map(prop => new Property(prop));

    console.log(`🔍 Found ${properties.length} properties with undefined categories`);

    if (properties.length === 0) {
      console.log('✅ No properties need migration - all have valid categories');
      process.exit(0);
    }

    // Get all available categories for mapping
    const categories = await Category.find({});
    console.log(`📋 Available categories: ${categories.length}`);

    // Create category mapping based on keywords in titles
    const categoryKeywords = {
      '695a323b5e579b71d26fd571': ['gas', 'mixer', 'cooker', 'chulha', 'grinder', 'kitchen appliances'], // Gas, Mixer, Cooker Repairman
      '695a34f25e579b71d26fd60e': ['online', 'mp online', 'digital'], // Online Services (M.P. ONLINE)
      '695a30d95e579b71d26fd4ff': ['doctor', 'medical', 'clinic'], // Doctor (General)
      '6971c42897cc3b0052844d3d': ['nurse', 'male nurse', 'nursing'], // Nurse Staff (Male)
      '695a2e535e579b71d26fd44a': ['car dealer', 'old car', 'used car'], // Car Dealer (Old)
      '695a35e45e579b71d26fd681': ['numerologist', 'ank shastri', 'astrology'], // Numerologist (Ank Shastri)
      '695a31eb5e579b71d26fd55e': ['nursery', 'gardening', 'plants'], // Nursery (Gardening)
      '695a35ed5e579b71d26fd686': ['nurse', 'female nurse', 'lady nurse'], // Nurse Staff (female)
      '695a2ec55e579b71d26fd477': ['chartered accountant', 'ca', 'accountant'], // Chartered Accountant (CA)
      '695a37d35e579b71d26fd77b': ['vegetable', 'sabji', 'vegetables'], // Vegetable (Sabji) wala
      '695a35aa5e579b71d26fd668': ['net service', 'wifi', 'sim', 'internet'], // Net Service (Wifi, Sim)
      '6908588559c3aace57c4a8cd': ['plumber', 'plumbing', 'pipe'], // Plumber
      '6908591359c3aace57c4a8e5': ['aluminium', 'aluminum', 'metal work'], // Aluminium Work
      '6908702d1a44dc66f77b427a': ['anaaj', 'rice', 'wheat', 'oats', 'grain'], // Anaaj (Rice, Wheat, Oats) Supplier
      '690885392a8eb5b01a0a5967': ['advocate', 'lawyer', 'legal'], // Advocate
      '6909a7d7297f8c6cfecd5b85': ['aata chakki', 'flour mill'], // Aata Chakki
      '6911f85fbb75fae1411dcc44': ['aape malvahak'], // Aape Malvahak
      '695a2ccc5e579b71d26fd3dd': ['ac repair', 'air conditioner', 'cooling'], // A. C. Repairing
      '695a2d7b5e579b71d26fd3ff': ['auto', 'rickshaw', 'three wheeler'], // Auto
      '695a2d8a5e579b71d26fd404': ['bajewala', 'baggi', 'ghoda', 'band', 'music'], // Bajewala & Baggi/Ghoda wala
      '695a2d955e579b71d26fd409': ['band party', 'music', 'celebration'], // Band Party
      // Additional mappings for common services
      '695a2ccc5e579b71d26fd3dd': ['electrician', 'electrical', 'wiring'], // Electrician -> A.C. Repairing (closest match)
      '695a2d955e579b71d26fd409': ['tent house', 'tent', 'event'], // Tent House -> Band Party
      '695a35e45e579b71d26fd681': ['motivational speaker', 'speaker', 'motivation'], // Motivational Speaker -> Numerologist
      '695a2d8a5e579b71d26fd404': ['helper', 'hazari', 'labor'], // Helper -> Bajewala
      '695a35ed5e579b71d26fd686': ['tailor', 'ladies tailor', 'fashion', 'sewing'], // Tailor -> Nurse Staff (female)
      '695a2d955e579b71d26fd409': ['dance class', 'dance', 'inspiration'], // Dance Class -> Band Party
      '695a34f25e579b71d26fd60e': ['photo copy', 'photocopy', 'gift items', 'xerox'] // Photo Copy -> Online Services
    };

    let migrated = 0;
    let failed = [];
    let defaultCategoryId = '6908588559c3aace57c4a8cd'; // Default to Plumber if no match found

    console.log('\n🔄 Starting migration...\n');

    for (let property of propertyDocs) {
      try {
        let assignedCategoryId = null;
        let matchReason = '';

        // Try to match based on title keywords
        const title = property.title?.toLowerCase() || '';
        const description = property.description?.toLowerCase() || '';
        const searchText = `${title} ${description}`.toLowerCase();

        // Find best matching category
        let bestMatch = null;
        let maxMatches = 0;

        for (let [categoryId, keywords] of Object.entries(categoryKeywords)) {
          let matches = 0;
          let matchedKeywords = [];

          for (let keyword of keywords) {
            if (searchText.includes(keyword.toLowerCase())) {
              matches++;
              matchedKeywords.push(keyword);
            }
          }

          if (matches > maxMatches) {
            maxMatches = matches;
            bestMatch = {
              categoryId,
              matches,
              matchedKeywords
            };
          }
        }

        if (bestMatch && bestMatch.matches > 0) {
          assignedCategoryId = bestMatch.categoryId;
          matchReason = `Matched ${bestMatch.matches} keywords: ${bestMatch.matchedKeywords.join(', ')}`;
        } else {
          // If no keyword match, assign default category
          assignedCategoryId = defaultCategoryId;
          matchReason = 'No keyword match - assigned default category (Plumber)';
        }

        // Update property with category ObjectId
        await Property.findByIdAndUpdate(property._id, {
          category: new mongoose.Types.ObjectId(assignedCategoryId)
        });

        // Get category name for logging
        const category = categories.find(cat => cat._id.toString() === assignedCategoryId);
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

    // Final verification using raw MongoDB queries to avoid casting issues
    console.log('\n🔍 Final verification...');
    
    const undefinedCategories = await Property.collection.countDocuments({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: undefined }
      ]
    });
    
    const objectIdCategories = await Property.collection.countDocuments({ 
      category: { $type: "objectId" } 
    });
    
    const totalProperties = await Property.collection.countDocuments();

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

migrateUndefinedCategories();
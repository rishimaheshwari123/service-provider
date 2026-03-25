const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const findMissingCategoryIds = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('📦 Connected to MongoDB');

    const missingCategoryNames = [
      "Gas Chulha, Mixer Grinder, Cooker Store",
      "Online Services (M.P. ONLINE)",
      "Doctor",
      "Nurse Staff (Male)",
      "Car Dealer (Old)",
      "Numerologist (Ank Shastri)",
      "Nursery (Gardening)",
      "Nurse Staff ( female)",
      "Chartered Accountant (CA)",
      "Vegetable (Sabji) wala",
      "Net Service (Wifi, Sim)"
    ];

    console.log('\n🔍 Searching for existing categories...\n');

    const foundCategories = [];
    const notFoundCategories = [];

    for (let categoryName of missingCategoryNames) {
      try {
        // Try exact match first
        let category = await Category.findOne({ 
          name: { $regex: new RegExp(`^${categoryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        // If not found, try similar matches
        if (!category) {
          const similarSearches = [
            categoryName.replace(/\s*\([^)]*\)/g, '').trim(), // Remove parentheses
            categoryName.replace(/\s+/g, ' ').trim(), // Normalize spaces
            categoryName.replace(/\s*\(\s*/g, ' (').replace(/\s*\)/g, ')'), // Normalize parentheses spacing
          ];

          for (let searchTerm of similarSearches) {
            if (searchTerm !== categoryName) {
              category = await Category.findOne({ 
                name: { $regex: new RegExp(`^${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
              });
              if (category) break;
            }
          }
        }

        // Try partial matches for some specific cases
        if (!category) {
          if (categoryName.includes('Gas Chulha')) {
            category = await Category.findOne({ 
              name: { $regex: /gas.*mixer.*cooker/i }
            });
          } else if (categoryName.includes('Doctor')) {
            category = await Category.findOne({ 
              name: { $regex: /doctor/i }
            });
          } else if (categoryName.includes('Nurse Staff')) {
            category = await Category.findOne({ 
              name: { $regex: /nurse.*staff/i }
            });
          } else if (categoryName.includes('Chartered Accountant')) {
            category = await Category.findOne({ 
              name: { $regex: /chartered.*accountant|CA/i }
            });
          } else if (categoryName.includes('Vegetable')) {
            category = await Category.findOne({ 
              name: { $regex: /vegetable|sabji/i }
            });
          }
        }

        if (category) {
          foundCategories.push({
            originalName: categoryName,
            foundName: category.name,
            _id: category._id
          });
          console.log(`✅ FOUND: "${categoryName}"`);
          console.log(`    → Matches: "${category.name}"`);
          console.log(`    → ID: ${category._id}\n`);
        } else {
          notFoundCategories.push(categoryName);
          console.log(`❌ NOT FOUND: "${categoryName}"\n`);
        }
      } catch (error) {
        console.error(`❌ Error searching for "${categoryName}":`, error.message);
        notFoundCategories.push(categoryName);
      }
    }

    console.log('\n📋 SUMMARY:');
    console.log('='.repeat(80));
    console.log(`✅ Found: ${foundCategories.length} categories`);
    console.log(`❌ Not Found: ${notFoundCategories.length} categories`);

    if (foundCategories.length > 0) {
      console.log('\n📝 FOUND CATEGORIES WITH IDs:');
      console.log('='.repeat(80));
      foundCategories.forEach((cat, index) => {
        console.log(`${index + 1}. "${cat.originalName}"`);
        console.log(`   → "${cat.foundName}"`);
        console.log(`   → ID: ${cat._id}`);
        console.log('');
      });
    }

    if (notFoundCategories.length > 0) {
      console.log('\n❌ CATEGORIES STILL MISSING:');
      console.log('='.repeat(80));
      notFoundCategories.forEach((name, index) => {
        console.log(`${index + 1}. "${name}"`);
      });
    }

    process.exit(0);

  } catch (error) {
    console.error('💥 Search failed:', error);
    process.exit(1);
  }
};

findMissingCategoryIds();
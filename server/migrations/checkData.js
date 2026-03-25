const mongoose = require('mongoose');
const Property = require('../models/propertyModel');
const Category = require('../models/categoryModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('📦 Connected to MongoDB');

    // Check categories
    const categories = await Category.find({}).limit(10);
    console.log('\n📋 Available Categories:');
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat._id})`);
    });

    // Check properties with different category types
    const stringCategories = await Property.find({
      $or: [
        { category: { $type: "string" } },
        { category: { $exists: false } },
        { category: null }
      ]
    }).limit(5);
    
    const objectIdCategories = await Property.find({
      category: { $type: "objectId" }
    }).limit(5);

    const nullCategories = await Property.find({
      category: null
    }).limit(5);

    console.log('\n📊 Property Category Analysis:');
    console.log(`String/Invalid categories: ${stringCategories.length} (showing first 5)`);
    stringCategories.forEach(prop => {
      console.log(`  - Property ${prop._id}: category = "${prop.category}" (${typeof prop.category})`);
    });

    console.log(`\nObjectId categories: ${objectIdCategories.length} (showing first 5)`);
    objectIdCategories.forEach(prop => {
      console.log(`  - Property ${prop._id}: category = ${prop.category}`);
    });

    console.log(`\nNull categories: ${nullCategories.length} (showing first 5)`);
    nullCategories.forEach(prop => {
      console.log(`  - Property ${prop._id}: category = ${prop.category}`);
    });

    // Get total counts
    const totalProperties = await Property.countDocuments();
    const stringCategoryCount = await Property.countDocuments({
      $or: [
        { category: { $type: "string" } },
        { category: { $exists: false } },
        { category: null }
      ]
    });
    const objectIdCategoryCount = await Property.countDocuments({ category: { $type: "objectId" } });
    const nullCategoryCount = await Property.countDocuments({ category: null });

    console.log('\n📈 Summary:');
    console.log(`Total properties: ${totalProperties}`);
    console.log(`String categories: ${stringCategoryCount}`);
    console.log(`ObjectId categories: ${objectIdCategoryCount}`);
    console.log(`Null categories: ${nullCategoryCount}`);

    process.exit(0);

  } catch (error) {
    console.error('💥 Check failed:', error);
    process.exit(1);
  }
};

checkData();
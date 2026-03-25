const mongoose = require('mongoose');
const Property = require('../models/propertyModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkActualData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('📦 Connected to MongoDB');

    const props = await Property.find({}).limit(10);
    
    console.log('\n🔍 Checking actual property data:\n');
    
    props.forEach((p, index) => {
      console.log(`${index + 1}. Property: ${p._id}`);
      console.log(`   Title: "${p.title}"`);
      console.log(`   Category: ${p.category}`);
      console.log(`   Category type: ${typeof p.category}`);
      console.log(`   Category === undefined: ${p.category === undefined}`);
      console.log(`   Category === "undefined": ${p.category === "undefined"}`);
      console.log(`   Category === null: ${p.category === null}`);
      console.log('   ---');
    });

    // Check different category conditions
    const stringUndefined = await Property.countDocuments({ category: "undefined" });
    const actualUndefined = await Property.countDocuments({ category: undefined });
    const nullCategory = await Property.countDocuments({ category: null });
    const existsFalse = await Property.countDocuments({ category: { $exists: false } });
    const objectIdCategory = await Property.countDocuments({ category: { $type: "objectId" } });
    const stringCategory = await Property.countDocuments({ category: { $type: "string" } });

    console.log('\n📊 Category Analysis:');
    console.log(`String "undefined": ${stringUndefined}`);
    console.log(`Actual undefined: ${actualUndefined}`);
    console.log(`Null: ${nullCategory}`);
    console.log(`Does not exist: ${existsFalse}`);
    console.log(`ObjectId type: ${objectIdCategory}`);
    console.log(`String type: ${stringCategory}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkActualData();
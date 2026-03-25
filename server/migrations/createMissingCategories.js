const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const createMissingCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('📦 Connected to MongoDB');

    const missingCategories = [
      {
        name: "Gas, Mixer, Cooker Repairman",
        autoFilled: "Kitchen appliance repair services",
        price: 500,
        premiumPrice: 800,
        premiumPlusPrice: 1200,
        active: true
      },
      {
        name: "Online Services (M.P. ONLINE)",
        autoFilled: "Government online services and documentation",
        price: 100,
        premiumPrice: 200,
        premiumPlusPrice: 300,
        active: true
      },
      {
        name: "Doctor (General)",
        autoFilled: "General medical consultation and treatment",
        price: 1000,
        premiumPrice: 1500,
        premiumPlusPrice: 2000,
        active: true
      },
      {
        name: "Nurse Staff (Male)",
        autoFilled: "Male nursing staff for home care",
        price: 800,
        premiumPrice: 1200,
        premiumPlusPrice: 1600,
        active: true
      },
      {
        name: "Car Dealer (Old)",
        autoFilled: "Used car sales and purchase",
        price: 2000,
        premiumPrice: 3000,
        premiumPlusPrice: 5000,
        active: true
      },
      {
        name: "Numerologist (Ank Shastri)",
        autoFilled: "Numerology consultation and predictions",
        price: 500,
        premiumPrice: 1000,
        premiumPlusPrice: 1500,
        active: true
      },
      {
        name: "Nursery (Gardening)",
        autoFilled: "Plant nursery and gardening supplies",
        price: 300,
        premiumPrice: 500,
        premiumPlusPrice: 800,
        active: true
      },
      {
        name: "Nurse Staff (Female)",
        autoFilled: "Female nursing staff for home care",
        price: 800,
        premiumPrice: 1200,
        premiumPlusPrice: 1600,
        active: true
      },
      {
        name: "Chartered Accountant (CA)",
        autoFilled: "Professional accounting and tax services",
        price: 1500,
        premiumPrice: 2500,
        premiumPlusPrice: 4000,
        active: true
      },
      {
        name: "Vegetable (Sabji) Wala",
        autoFilled: "Fresh vegetable vendor and supplier",
        price: 200,
        premiumPrice: 300,
        premiumPlusPrice: 500,
        active: true
      },
      {
        name: "Net Service (Wifi, Sim)",
        autoFilled: "Internet and mobile network services",
        price: 400,
        premiumPrice: 600,
        premiumPlusPrice: 1000,
        active: true
      }
    ];

    console.log(`\n🔄 Creating ${missingCategories.length} missing categories...`);

    const createdCategories = [];

    for (let categoryData of missingCategories) {
      try {
        // Check if category already exists
        const existingCategory = await Category.findOne({ 
          name: { $regex: new RegExp(`^${categoryData.name}$`, 'i') }
        });

        if (existingCategory) {
          console.log(`⚠️  Category "${categoryData.name}" already exists with ID: ${existingCategory._id}`);
          createdCategories.push({
            name: categoryData.name,
            _id: existingCategory._id,
            status: 'existing'
          });
        } else {
          const newCategory = await Category.create(categoryData);
          console.log(`✅ Created category "${categoryData.name}" with ID: ${newCategory._id}`);
          createdCategories.push({
            name: categoryData.name,
            _id: newCategory._id,
            status: 'created'
          });
        }
      } catch (error) {
        console.error(`❌ Error creating category "${categoryData.name}":`, error.message);
      }
    }

    console.log('\n📋 Category Creation Summary:');
    console.log('='.repeat(60));
    
    createdCategories.forEach((cat, index) => {
      const status = cat.status === 'created' ? '🆕 CREATED' : '📋 EXISTS';
      console.log(`${index + 1}. ${cat.name}`);
      console.log(`   ID: ${cat._id} ${status}`);
      console.log('');
    });

    console.log(`\n🎉 Process completed! ${createdCategories.filter(c => c.status === 'created').length} new categories created.`);
    
    process.exit(0);

  } catch (error) {
    console.error('💥 Category creation failed:', error);
    process.exit(1);
  }
};

createMissingCategories();
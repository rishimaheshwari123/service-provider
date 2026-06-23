/**
 * Migration Script: Setup Reward System
 * 
 * This script initializes the reward system with default settings
 * and generates referral codes for existing users
 * 
 * Run: node server/migrations/setupRewardSystem.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const RewardSettings = require('../models/rewardSettingsModel');
const RewardPoints = require('../models/rewardPointsModel');
const Auth = require('../models/authModel');
const { generateReferralCode } = require('../utils/rewardHelper');

async function setupRewardSystem() {
  try {
    console.log('🚀 Starting Reward System Setup...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Create default reward settings
    console.log('📝 Step 1: Creating default reward settings...');
    let rewardSettings = await RewardSettings.findOne();
    
    if (!rewardSettings) {
      rewardSettings = await RewardSettings.create({
        referralPoints: 100,
        referralDiscountType: 'flat',
        downloadPoints: 50,
        downloadDiscountType: 'flat',
        isActive: true,
      });
      console.log('✅ Default reward settings created');
      console.log('   - Referral Points: 100 (flat)');
      console.log('   - Download Points: 50 (flat)');
    } else {
      console.log('ℹ️  Reward settings already exist');
    }

    // Step 2: Generate referral codes for existing users
    console.log('\n📝 Step 2: Generating referral codes for existing users...');
    const usersWithoutReferralCode = await Auth.find({
      role: 'user',
      $or: [
        { referralCode: { $exists: false } },
        { referralCode: null },
        { referralCode: '' }
      ]
    });

    console.log(`   Found ${usersWithoutReferralCode.length} users without referral codes`);

    let generatedCount = 0;
    for (const user of usersWithoutReferralCode) {
      try {
        const referralCode = await generateReferralCode(user._id);
        user.referralCode = referralCode;
        await user.save();
        generatedCount++;
        console.log(`   ✅ Generated code ${referralCode} for user: ${user.name || user.email}`);
      } catch (error) {
        console.log(`   ❌ Failed to generate code for user ${user._id}:`, error.message);
      }
    }

    console.log(`\n✅ Generated ${generatedCount} referral codes`);

    // Step 3: Initialize reward points for existing users
    console.log('\n📝 Step 3: Initializing reward points for existing users...');
    const allUsers = await Auth.find({ role: 'user' });
    
    let initializedCount = 0;
    for (const user of allUsers) {
      const existingPoints = await RewardPoints.findOne({ userId: user._id });
      
      if (!existingPoints) {
        await RewardPoints.create({
          userId: user._id,
          totalPoints: 0,
          availablePoints: 0,
          usedPoints: 0,
          referralCount: 0,
          referredUsers: [],
        });
        initializedCount++;
      }
    }

    console.log(`✅ Initialized reward points for ${initializedCount} users`);

    // Step 4: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Setup Summary:');
    console.log('='.repeat(60));
    console.log(`Total Users: ${allUsers.length}`);
    console.log(`Referral Codes Generated: ${generatedCount}`);
    console.log(`Reward Points Initialized: ${initializedCount}`);
    console.log(`Reward System Status: ${rewardSettings.isActive ? 'Active' : 'Inactive'}`);
    console.log('='.repeat(60));

    console.log('\n✅ Reward System Setup Complete!\n');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupRewardSystem();

/**
 * Test Script for Reward Points System
 * 
 * This script helps test all reward system endpoints
 * Make sure your server is running before executing this
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api/v1';

// Store tokens and data
let adminToken = '';
let userToken = '';
let vendorToken = '';
let userId = '';
let vendorId = '';
let redeemCode = '';

// Test data
const testAdmin = {
  phone: '9999999999',
  password: 'admin123'
};

const testUser1 = {
  name: 'Test User 1',
  email: 'testuser1@example.com',
  phone: '8888888881',
  password: 'user123',
  role: 'user'
};

const testUser2 = {
  name: 'Test User 2',
  email: 'testuser2@example.com',
  phone: '8888888882',
  password: 'user123',
  role: 'user'
};

const testVendor = {
  phone: '7777777777',
  password: 'vendor123'
};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Test functions
async function test1_AdminLogin() {
  console.log('\n📝 Test 1: Admin Login');
  const result = await apiCall('POST', '/auth/login', testAdmin);
  
  if (result.success) {
    adminToken = result.data.token;
    console.log('✅ Admin logged in successfully');
    console.log('Token:', adminToken.substring(0, 20) + '...');
  } else {
    console.log('❌ Admin login failed:', result.error);
  }
}

async function test2_SetupRewardSettings() {
  console.log('\n📝 Test 2: Setup Reward Settings');
  const settings = {
    referralPoints: 100,
    referralDiscountType: 'flat',
    downloadPoints: 50,
    downloadDiscountType: 'flat',
    isActive: true
  };

  const result = await apiCall('PUT', '/reward/admin/settings', settings, adminToken);
  
  if (result.success) {
    console.log('✅ Reward settings configured');
    console.log('Settings:', result.data.data);
  } else {
    console.log('❌ Failed to setup reward settings:', result.error);
  }
}

async function test3_RegisterUser1() {
  console.log('\n📝 Test 3: Register User 1 (No Referral)');
  const result = await apiCall('POST', '/auth/register', testUser1);
  
  if (result.success) {
    userToken = result.data.token;
    userId = result.data.user._id;
    console.log('✅ User 1 registered successfully');
    console.log('User ID:', userId);
    console.log('Referral Code:', result.data.user.referralCode);
    testUser1.referralCode = result.data.user.referralCode;
  } else {
    console.log('❌ User 1 registration failed:', result.error);
  }
}

async function test4_RegisterUser2WithReferral() {
  console.log('\n📝 Test 4: Register User 2 (With Referral from User 1)');
  const userData = {
    ...testUser2,
    referralCode: testUser1.referralCode
  };

  const result = await apiCall('POST', '/auth/register', userData);
  
  if (result.success) {
    console.log('✅ User 2 registered with referral');
    console.log('User ID:', result.data.user._id);
    console.log('Referred By Code:', result.data.user.referredByCode);
  } else {
    console.log('❌ User 2 registration failed:', result.error);
  }
}

async function test5_CheckUser1Points() {
  console.log('\n📝 Test 5: Check User 1 Reward Points (Should have referral reward)');
  const result = await apiCall('GET', '/reward/user/points', null, userToken);
  
  if (result.success) {
    console.log('✅ User 1 points fetched');
    console.log('Total Points:', result.data.data.totalPoints);
    console.log('Available Points:', result.data.data.availablePoints);
    console.log('Referral Count:', result.data.data.referralCount);
    console.log('Referred Users:', result.data.data.referredUsers.length);
  } else {
    console.log('❌ Failed to fetch points:', result.error);
  }
}

async function test6_AppDownloadReward() {
  console.log('\n📝 Test 6: App Download Reward for User 1');
  const result = await apiCall('POST', '/reward/user/download-reward', {
    email: testUser1.email
  });
  
  if (result.success) {
    console.log('✅ Download reward credited');
    console.log('Points Earned:', result.data.data.pointsEarned);
    console.log('Total Points:', result.data.data.totalPoints);
  } else {
    console.log('❌ Download reward failed:', result.error);
  }
}

async function test7_CheckRewardHistory() {
  console.log('\n📝 Test 7: Check User 1 Reward History');
  const result = await apiCall('GET', '/reward/user/history', null, userToken);
  
  if (result.success) {
    console.log('✅ Reward history fetched');
    console.log('Total Transactions:', result.data.total);
    result.data.data.forEach((item, index) => {
      console.log(`\nTransaction ${index + 1}:`);
      console.log('  Type:', item.type);
      console.log('  Source:', item.source);
      console.log('  Points:', item.points);
      console.log('  Description:', item.description);
    });
  } else {
    console.log('❌ Failed to fetch history:', result.error);
  }
}

async function test8_GenerateRedeemCode() {
  console.log('\n📝 Test 8: Generate Redeem Code');
  const result = await apiCall('POST', '/reward/user/generate-code', {
    points: 50
  }, userToken);
  
  if (result.success) {
    redeemCode = result.data.data.code;
    console.log('✅ Redeem code generated');
    console.log('Code:', result.data.data.code);
    console.log('Points:', result.data.data.points);
    console.log('Discount Amount:', result.data.data.discountAmount);
    console.log('Expires At:', result.data.data.expiresAt);
  } else {
    console.log('❌ Failed to generate code:', result.error);
  }
}

async function test9_VendorLogin() {
  console.log('\n📝 Test 9: Vendor Login');
  const result = await apiCall('POST', '/vendor/login', testVendor);
  
  if (result.success) {
    vendorToken = result.data.token;
    vendorId = result.data.vendor._id;
    console.log('✅ Vendor logged in successfully');
    console.log('Vendor ID:', vendorId);
  } else {
    console.log('❌ Vendor login failed:', result.error);
  }
}

async function test10_EnableVendorRewards() {
  console.log('\n📝 Test 10: Enable Vendor Reward Acceptance');
  const settings = {
    acceptsRewardPoints: true,
    discountType: 'flat',
    maxDiscountAmount: 500,
    minOrderValue: 0,
    isActive: true
  };

  const result = await apiCall('PUT', `/reward/admin/vendor-settings/${vendorId}`, settings, adminToken);
  
  if (result.success) {
    console.log('✅ Vendor reward settings updated');
    console.log('Accepts Rewards:', result.data.data.acceptsRewardPoints);
    console.log('Discount Type:', result.data.data.discountType);
  } else {
    console.log('❌ Failed to update vendor settings:', result.error);
  }
}

async function test11_VendorApplyCode() {
  console.log('\n📝 Test 11: Vendor Apply Redeem Code');
  const result = await apiCall('POST', '/reward/vendor/apply-code', {
    code: redeemCode
  }, vendorToken);
  
  if (result.success) {
    console.log('✅ Redeem code applied successfully');
    console.log('Code:', result.data.data.code);
    console.log('Discount Amount:', result.data.data.discountAmount);
    console.log('Discount Type:', result.data.data.discountType);
    console.log('User:', result.data.data.user.name);
  } else {
    console.log('❌ Failed to apply code:', result.error);
  }
}

async function test12_CheckPointsAfterRedemption() {
  console.log('\n📝 Test 12: Check User 1 Points After Redemption');
  const result = await apiCall('GET', '/reward/user/points', null, userToken);
  
  if (result.success) {
    console.log('✅ Points after redemption');
    console.log('Total Points:', result.data.data.totalPoints);
    console.log('Available Points:', result.data.data.availablePoints);
    console.log('Used Points:', result.data.data.usedPoints);
  } else {
    console.log('❌ Failed to fetch points:', result.error);
  }
}

async function test13_AdminStatistics() {
  console.log('\n📝 Test 13: Admin Reward Statistics');
  const result = await apiCall('GET', '/reward/admin/statistics', null, adminToken);
  
  if (result.success) {
    console.log('✅ Statistics fetched');
    console.log('Total Users:', result.data.data.totalUsers);
    console.log('Users With Points:', result.data.data.usersWithPoints);
    console.log('Total Points Issued:', result.data.data.totalPointsIssued);
    console.log('Total Points Redeemed:', result.data.data.totalPointsRedeemed);
    console.log('Total Referrals:', result.data.data.totalReferrals);
    console.log('Total Redemptions:', result.data.data.totalRedemptions);
  } else {
    console.log('❌ Failed to fetch statistics:', result.error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Reward System Tests...\n');
  console.log('=' .repeat(60));

  await test1_AdminLogin();
  await test2_SetupRewardSettings();
  await test3_RegisterUser1();
  await test4_RegisterUser2WithReferral();
  await test5_CheckUser1Points();
  await test6_AppDownloadReward();
  await test7_CheckRewardHistory();
  await test8_GenerateRedeemCode();
  await test9_VendorLogin();
  await test10_EnableVendorRewards();
  await test11_VendorApplyCode();
  await test12_CheckPointsAfterRedemption();
  await test13_AdminStatistics();

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!\n');
}

// Execute tests
runAllTests().catch(error => {
  console.error('❌ Test execution failed:', error);
});

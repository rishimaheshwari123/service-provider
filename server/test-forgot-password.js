const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000'; // Adjust port as needed
const TEST_PHONE = '9876543210'; // Use a test phone number

// Test User Forgot Password Flow
async function testUserForgotPassword() {
    console.log('\n=== Testing User Forgot Password Flow ===');
    
    try {
        // Step 1: Request OTP for password reset
        console.log('1. Requesting password reset OTP...');
        const otpResponse = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
            phone: TEST_PHONE,
            otpMethod: 'sms' // or 'whatsapp'
        });
        
        console.log('✅ OTP Request Response:', otpResponse.data);
        
        // Step 2: Verify OTP (you'll need to enter the actual OTP received)
        const testOTP = '123456'; // Replace with actual OTP from SMS/WhatsApp
        console.log('2. Verifying OTP...');
        
        const verifyResponse = await axios.post(`${BASE_URL}/api/auth/verify-reset-otp`, {
            phone: TEST_PHONE,
            otp: testOTP
        });
        
        console.log('✅ OTP Verification Response:', verifyResponse.data);
        
        // Step 3: Reset password using the token
        if (verifyResponse.data.success && verifyResponse.data.resetToken) {
            console.log('3. Resetting password...');
            
            const resetResponse = await axios.post(`${BASE_URL}/api/auth/reset-password`, {
                resetToken: verifyResponse.data.resetToken,
                newPassword: 'newPassword123'
            });
            
            console.log('✅ Password Reset Response:', resetResponse.data);
        }
        
    } catch (error) {
        console.error('❌ User Test Error:', error.response?.data || error.message);
    }
}

// Test Vendor Forgot Password Flow
async function testVendorForgotPassword() {
    console.log('\n=== Testing Vendor Forgot Password Flow ===');
    
    try {
        // Step 1: Request OTP for password reset
        console.log('1. Requesting vendor password reset OTP...');
        const otpResponse = await axios.post(`${BASE_URL}/api/vendor/forgot-password`, {
            phone: TEST_PHONE,
            otpMethod: 'whatsapp' // or 'sms'
        });
        
        console.log('✅ Vendor OTP Request Response:', otpResponse.data);
        
        // Step 2: Verify OTP
        const testOTP = '123456'; // Replace with actual OTP
        console.log('2. Verifying vendor OTP...');
        
        const verifyResponse = await axios.post(`${BASE_URL}/api/vendor/verify-reset-otp`, {
            phone: TEST_PHONE,
            otp: testOTP
        });
        
        console.log('✅ Vendor OTP Verification Response:', verifyResponse.data);
        
        // Step 3: Reset vendor password
        if (verifyResponse.data.success && verifyResponse.data.resetToken) {
            console.log('3. Resetting vendor password...');
            
            const resetResponse = await axios.post(`${BASE_URL}/api/vendor/reset-password`, {
                resetToken: verifyResponse.data.resetToken,
                newPassword: 'newVendorPassword123'
            });
            
            console.log('✅ Vendor Password Reset Response:', resetResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Vendor Test Error:', error.response?.data || error.message);
    }
}

// Run tests
async function runTests() {
    console.log('🚀 Starting Forgot Password Tests...');
    console.log('📱 Test Phone Number:', TEST_PHONE);
    console.log('⚠️  Make sure to replace TEST_PHONE with a real number and update OTP values');
    
    await testUserForgotPassword();
    await testVendorForgotPassword();
    
    console.log('\n✅ Tests completed!');
}

// Uncomment to run tests
// runTests();

module.exports = {
    testUserForgotPassword,
    testVendorForgotPassword,
    runTests
};
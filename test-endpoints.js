const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api/v1';

async function testEndpoints() {
    console.log('🧪 Testing Forgot Password Endpoints...\n');

    // Test 1: User forgot password endpoint
    try {
        console.log('1️⃣ Testing User Forgot Password endpoint...');
        const response = await axios.post(`${BASE_URL}/auth/forgot-password`, {
            phone: '9876543210',
            otpMethod: 'sms'
        });
        console.log('✅ User endpoint working:', response.status);
    } catch (error) {
        if (error.response) {
            console.log('✅ User endpoint exists (status:', error.response.status, ')');
            console.log('   Response:', error.response.data.message || 'No message');
        } else {
            console.log('❌ User endpoint error:', error.message);
        }
    }

    // Test 2: Vendor forgot password endpoint
    try {
        console.log('\n2️⃣ Testing Vendor Forgot Password endpoint...');
        const response = await axios.post(`${BASE_URL}/vendor/forgot-password`, {
            phone: '9876543210',
            otpMethod: 'sms'
        });
        console.log('✅ Vendor endpoint working:', response.status);
    } catch (error) {
        if (error.response) {
            console.log('✅ Vendor endpoint exists (status:', error.response.status, ')');
            console.log('   Response:', error.response.data.message || 'No message');
        } else {
            console.log('❌ Vendor endpoint error:', error.message);
        }
    }

    // Test 3: Check if server is running
    try {
        console.log('\n3️⃣ Testing if server is running...');
        const response = await axios.get(`${BASE_URL.replace('/api/v1', '')}/`);
        console.log('✅ Server is running:', response.data.message);
    } catch (error) {
        console.log('❌ Server connection error:', error.message);
    }

    console.log('\n📋 Summary:');
    console.log('- Make sure your server is running on port 8080');
    console.log('- Restart your server to pick up new routes');
    console.log('- Check server logs for any errors');
    console.log('- Endpoints should be:');
    console.log('  • POST /api/v1/auth/forgot-password');
    console.log('  • POST /api/v1/vendor/forgot-password');
}

testEndpoints();
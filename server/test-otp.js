const axios = require('axios');

// Test OTP functionality
const testOTP = async () => {
    const baseURL = 'http://localhost:5000/api/vendor';
    
    console.log('🧪 Testing OTP Functionality...\n');
    
    try {
        // Test 1: Send SMS OTP
        console.log('📱 Test 1: Sending SMS OTP...');
        const smsResponse = await axios.post(`${baseURL}/send-otp`, {
            phone: '9876543210',
            preferredMethod: 'sms'
        });
        
        console.log('✅ SMS OTP Response:', smsResponse.data);
        console.log('');
        
        // Test 2: Send WhatsApp OTP
        console.log('💬 Test 2: Sending WhatsApp OTP...');
        const whatsappResponse = await axios.post(`${baseURL}/send-otp`, {
            phone: '9876543210',
            whatsappNumber: '9876543210',
            preferredMethod: 'whatsapp'
        });
        
        console.log('✅ WhatsApp OTP Response:', whatsappResponse.data);
        console.log('');
        
        // Test 3: Verify OTP (will fail without actual OTP)
        console.log('🔐 Test 3: Verifying OTP (with dummy OTP)...');
        try {
            const verifyResponse = await axios.post(`${baseURL}/verify-otp`, {
                phone: '9876543210',
                otp: '123456'
            });
            console.log('✅ Verify OTP Response:', verifyResponse.data);
        } catch (error) {
            console.log('❌ Expected error for dummy OTP:', error.response?.data?.message || error.message);
        }
        
        console.log('\n🎉 OTP API tests completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
};

// Run tests if server is running
testOTP();
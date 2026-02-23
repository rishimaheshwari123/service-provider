// Test script for admin reset vendor password
const axios = require('axios');

const testAdminResetPassword = async () => {
  try {
    console.log('🧪 Testing Admin Reset Vendor Password API...\n');

    // Replace with actual vendor ID from your database
    const vendorId = '6766e0e0e0e0e0e0e0e0e0e0'; // UPDATE THIS WITH REAL VENDOR ID
    const newPassword = 'test123456';
    const confirmPassword = 'test123456';

    console.log('📤 Sending request to: http://localhost:8080/api/v1/vendor/admin-reset-password');
    console.log('📦 Request body:', {
      vendorId,
      newPassword: '********',
      confirmPassword: '********'
    });

    const response = await axios.post(
      'http://localhost:8080/api/v1/vendor/admin-reset-password',
      {
        vendorId,
        newPassword,
        confirmPassword
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Success!');
    console.log('📥 Response:', response.data);
    console.log('Status:', response.status);

  } catch (error) {
    console.error('\n❌ Error occurred:');
    
    if (error.response) {
      // Server responded with error
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('No response received from server');
      console.error('Is the server running on http://localhost:8080?');
    } else {
      // Error setting up request
      console.error('Error:', error.message);
    }
  }
};

// Run the test
testAdminResetPassword();

require('dotenv').config();
const mailSender = require('./utils/mailSender');
const { generalContactTemplate } = require('./utils/emailTemplates');

// Test email functionality
const testEmail = async () => {
    try {
        const testData = {
            name: "Test User",
            email: "test@example.com",
            subject: "Test Contact Form",
            message: "This is a test message from the contact form"
        };

        const emailBody = generalContactTemplate(testData);
        const emailTitle = `📧 Test Email - Contact Form: ${testData.subject}`;
        
        console.log('Sending test email...');
        await mailSender(process.env.ADMIN_EMAIL, emailTitle, emailBody);
        console.log('Test email sent successfully!');
        
    } catch (error) {
        console.error('Test email failed:', error);
    }
};

// Uncomment the line below to test email functionality
// testEmail();
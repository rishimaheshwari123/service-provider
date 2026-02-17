const axios = require('axios');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send SMS OTP
const sendSMSOTP = async (phoneNumber, otp) => {
    try {
        const smsText = `MeraGharSansaar: Your OTP for mobile number verification is ${otp}. This code is valid for 10 minutes. Please do not share with anyone. Regards Niyati Solutions`;
        
        const smsUrl = `http://182.18.162.128/api/mt/SendSMS?user=niyatisolutions&password=123456&senderid=NSOLN&channel=trans&DCS=0&flashsms=0&number=91${phoneNumber}&text=${encodeURIComponent(smsText)}&route=29`;
        
        const response = await axios.get(smsUrl);
        
        console.log('SMS OTP sent successfully:', response.data);
        return {
            success: true,
            message: 'SMS OTP sent successfully',
            data: response.data
        };
    } catch (error) {
        console.error('Error sending SMS OTP:', error);
        return {
            success: false,
            message: 'Failed to send SMS OTP',
            error: error.message
        };
    }
};

// Send Welcome SMS - Registration Confirmation
const sendWelcomeSMS1 = async (phoneNumber, vendorName) => {
    try {
        const smsText = `Welcome to MeraGharSansaar! Dear ${vendorName} We're glad to have you on our Platform as our service partner. Start receiving customer requests and grow your business with us. Team NiyatiSolutions`;
        
        const smsUrl = `http://182.18.162.128/api/mt/SendSMS?user=niyatisolutions&password=123456&senderid=NSOLN&channel=trans&DCS=0&flashsms=0&number=91${phoneNumber}&text=${encodeURIComponent(smsText)}&route=29`;
        
        const response = await axios.get(smsUrl);
        
        console.log('Welcome SMS 1 sent successfully:', response.data);
        return {
            success: true,
            message: 'Welcome SMS sent successfully',
            data: response.data
        };
    } catch (error) {
        console.error('Error sending Welcome SMS 1:', error);
        return {
            success: false,
            message: 'Failed to send Welcome SMS',
            error: error.message
        };
    }
};

// Send Welcome SMS - Account Registered
const sendWelcomeSMS2 = async (phoneNumber, vendorName, supportContact = '+91 78798 84363') => {
    try {
        const smsText = `Welcome to MeraGharSansaar! Dear ${vendorName} Your service provider account is successfully registered. You can now start receiving service requests. For support, contact ${supportContact}. Regards: NiyatiSolutions`;
        
        const smsUrl = `http://182.18.162.128/api/mt/SendSMS?user=niyatisolutions&password=123456&senderid=NSOLN&channel=trans&DCS=0&flashsms=0&number=91${phoneNumber}&text=${encodeURIComponent(smsText)}&route=29`;
        
        const response = await axios.get(smsUrl);
        
        console.log('Welcome SMS 2 sent successfully:', response.data);
        return {
            success: true,
            message: 'Registration confirmation SMS sent successfully',
            data: response.data
        };
    } catch (error) {
        console.error('Error sending Welcome SMS 2:', error);
        return {
            success: false,
            message: 'Failed to send registration confirmation SMS',
            error: error.message
        };
    }
};

// Send SMS approval message (Hindi)
const sendApprovalSMS = async (phoneNumber) => {
    try {
        const smsText = `मेराघरसंसार में आपका सेवा प्रदाता पंजीकरण सफल हो गया है। अब आप सेवा अनुरोध प्राप्त कर सकते हैं। NIYATI SOLUTIONS`;
        
        const smsUrl = `http://182.18.162.128/api/mt/SendSMS?user=niyatisolutions&password=123456&senderid=NSOLN&channel=trans&DCS=8&flashsms=0&number=91${phoneNumber}&text=${encodeURIComponent(smsText)}&route=29`;
        
        const response = await axios.get(smsUrl);
        
        console.log('✅ Approval SMS sent successfully:', response.data);
        return {
            success: true,
            message: 'Approval SMS sent successfully',
            data: response.data
        };
    } catch (error) {
        console.error('❌ Error sending approval SMS:', error);
        return {
            success: false,
            message: 'Failed to send approval SMS',
            error: error.message
        };
    }
};

// Send WhatsApp approval message (Hindi)
const sendApprovalWhatsApp = async (whatsappNumber) => {
    try {
        const whatsappPayload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: `91${whatsappNumber}`,
            type: "template",
            template: {
                name: "welcomesmshindi",
                language: {
                    code: "en"
                },
                components: [
                    {
                        type: "body",
                        parameters: []
                    }
                ]
            },
            biz_opaque_callback_data: "vendor_approval_message"
        };

        console.log('🔄 Sending WhatsApp approval message to:', whatsappNumber);

        const response = await axios.post(
            'http://rcsmeta.msg24.in/v23.0/1057223397455805/messages',
            whatsappPayload,
            {
                headers: {
                    'authorization': 'Bearer 600938a3-d522-4334-884d-ffe875e8986b',
                    'content-type': 'application/json'
                },
                timeout: 10000
            }
        );

        console.log('✅ WhatsApp approval message sent successfully:', response.data);
        
        if (response.data && response.data.messages && response.data.messages[0]) {
            const messageStatus = response.data.messages[0].message_status;
            if (messageStatus === 'accepted') {
                return {
                    success: true,
                    message: 'WhatsApp approval message sent successfully',
                    data: response.data
                };
            }
        }

        throw new Error('WhatsApp approval message not accepted');

    } catch (error) {
        console.error('❌ WhatsApp approval message failed:', error.response?.status, error.message);
        return {
            success: false,
            message: 'Failed to send WhatsApp approval message',
            error: error.response?.data || error.message
        };
    }
};

// Send WhatsApp welcome message
const sendWhatsAppWelcome = async (whatsappNumber, vendorName, supportContact = '+91 78798 84363') => {
    try {
        const whatsappPayload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: `91${whatsappNumber}`,
            type: "template",
            template: {
                name: "welcomesmsnew",
                language: {
                    code: "en"
                },
                components: [
                    {
                        type: "body",
                        parameters: [
                            {
                                type: "text",
                                text: vendorName
                            },
                            {
                                type: "text",
                                text: supportContact
                            }
                        ]
                    }
                ]
            },
            biz_opaque_callback_data: "vendor_welcome_message"
        };

        console.log('🔄 Sending WhatsApp welcome message to:', whatsappNumber);

        const response = await axios.post(
            'http://rcsmeta.msg24.in/v23.0/1057223397455805/messages',
            whatsappPayload,
            {
                headers: {
                    'authorization': 'Bearer 600938a3-d522-4334-884d-ffe875e8986b',
                    'content-type': 'application/json'
                },
                timeout: 10000
            }
        );

        console.log('✅ WhatsApp welcome message sent successfully:', response.data);
        
        if (response.data && response.data.messages && response.data.messages[0]) {
            const messageStatus = response.data.messages[0].message_status;
            if (messageStatus === 'accepted') {
                return {
                    success: true,
                    message: 'WhatsApp welcome message sent successfully',
                    data: response.data
                };
            }
        }

        throw new Error('WhatsApp welcome message not accepted');

    } catch (error) {
        console.error('❌ WhatsApp welcome message failed:', error.response?.status, error.message);
        return {
            success: false,
            message: 'Failed to send WhatsApp welcome message',
            error: error.response?.data || error.message
        };
    }
};

// Send WhatsApp OTP
const sendWhatsAppOTP = async (whatsappNumber, otp) => {
    try {
        // Correct WhatsApp API configuration based on your working curl
        const whatsappPayload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: `91${whatsappNumber}`, // Format: 91xxxxxxxxxx
            type: "template",
            template: {
                name: "loginotp1",
                language: {
                    code: "en"
                },
                components: [
                    {
                        type: "body",
                        parameters: [
                            {
                                type: "text",
                                text: otp // Direct OTP value
                            }
                        ]
                    },
                    {
                        type: "button",
                        parameters: [
                            {
                                type: "text",
                                text: "Visit" // Shorter text within 15 char limit
                            }
                        ],
                        sub_type: "url",
                        index: "0"
                    }
                ]
            },
            biz_opaque_callback_data: "vendor_registration_otp"
        };

        console.log('🔄 Sending WhatsApp OTP to:', whatsappNumber);
        console.log('📱 Using correct API endpoint...');

        // Use the correct API endpoint from your working curl
        const response = await axios.post(
            'http://rcsmeta.msg24.in/v23.0/1057223397455805/messages',
            whatsappPayload,
            {
                headers: {
                    'authorization': 'Bearer 600938a3-d522-4334-884d-ffe875e8986b',
                    'content-type': 'application/json'
                },
                timeout: 10000
            }
        );

        console.log('✅ WhatsApp OTP sent successfully:', response.data);
        
        // Check if the response indicates success
        if (response.data && response.data.messages && response.data.messages[0]) {
            const messageStatus = response.data.messages[0].message_status;
            if (messageStatus === 'accepted') {
                return {
                    success: true,
                    message: 'WhatsApp OTP sent successfully',
                    data: response.data,
                    method: 'whatsapp'
                };
            }
        }

        // If response doesn't indicate success, treat as failure
        throw new Error('WhatsApp message not accepted');

    } catch (error) {
        console.error('❌ WhatsApp API failed:', error.response?.status, error.message);
        console.error('📄 Error details:', error.response?.data);
        
        // WhatsApp API failed, use SMS as fallback
        console.log('🔄 WhatsApp failed, using SMS fallback for WhatsApp number...');
        
        try {
            const smsResult = await sendSMSOTP(whatsappNumber, otp);
            
            if (smsResult.success) {
                return {
                    success: true,
                    message: 'OTP sent via SMS to your WhatsApp number (WhatsApp API temporarily unavailable)',
                    data: smsResult.data,
                    method: 'sms_fallback',
                    originalMethod: 'whatsapp'
                };
            }
        } catch (smsError) {
            console.error('❌ SMS fallback also failed:', smsError);
        }
        
        return {
            success: false,
            message: 'Failed to send OTP via WhatsApp or SMS',
            error: error.response?.data || error.message
        };
    }
};

module.exports = {
    generateOTP,
    sendSMSOTP,
    sendWhatsAppOTP,
    sendWelcomeSMS1,
    sendWelcomeSMS2,
    sendWhatsAppWelcome,
    sendApprovalSMS,
    sendApprovalWhatsApp
};
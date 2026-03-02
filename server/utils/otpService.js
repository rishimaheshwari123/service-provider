const axios = require('axios');
const { logSMS, logWhatsApp } = require('./communicationLogger');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send SMS OTP
const sendSMSOTP = async (phoneNumber, otp, vendorId = null, userId = null, vendorName = null) => {
    const smsText = `MeraGharSansaar: Your OTP for mobile number verification is ${otp}. This code is valid for 10 minutes. Please do not share with anyone. Regards Niyati Solutions`;
    
    try {
        const smsUrl = `http://182.18.162.128/api/mt/SendSMS?user=niyatisolutions&password=123456&senderid=NSOLN&channel=trans&DCS=0&flashsms=0&number=91${phoneNumber}&text=${encodeURIComponent(smsText)}&route=29`;
        
        const response = await axios.get(smsUrl);
        
        console.log('SMS OTP response:', response.data);
        
        // Check for insufficient credits error
        if (response.data && response.data.ErrorCode === '21') {
            console.error('❌ SMS insufficient credits:', response.data.ErrorMessage);
            
            // Log failed SMS
            await logSMS({
                phone: phoneNumber,
                name: vendorName,
                message: smsText,
                purpose: "OTP",
                status: "Failed",
                response: response.data,
                errorMessage: "Insufficient SMS credits",
                vendorId,
                userId,
            });
            
            return {
                success: false,
                message: 'SMS service temporarily unavailable. Please contact support.',
                error: 'Insufficient SMS credits',
                errorCode: '21'
            };
        }
        
        // Check for success - ErrorCode can be '0', '00', '000', or ErrorMessage 'Done'
        if (response.data && (
            response.data.ErrorCode === '0' || 
            response.data.ErrorCode === '00' || 
            response.data.ErrorCode === '000' ||
            response.data.ErrorMessage === 'Done'
        )) {
            console.log('✅ SMS OTP sent successfully');
            
            // Log successful SMS
            await logSMS({
                phone: phoneNumber,
                name: vendorName,
                message: smsText,
                purpose: "OTP",
                status: "Success",
                response: response.data,
                vendorId,
                userId,
            });
            
            return {
                success: true,
                message: 'SMS OTP sent successfully',
                data: response.data
            };
        }
        
        // Check for other error codes
        if (response.data && response.data.ErrorCode) {
            console.error('❌ SMS error:', response.data);
            
            // Log failed SMS
            await logSMS({
                phone: phoneNumber,
                name: vendorName,
                message: smsText,
                purpose: "OTP",
                status: "Failed",
                response: response.data,
                errorMessage: response.data.ErrorMessage || 'SMS service error',
                vendorId,
                userId,
            });
            
            return {
                success: false,
                message: 'Failed to send SMS OTP',
                error: response.data.ErrorMessage || 'SMS service error',
                errorCode: response.data.ErrorCode
            };
        }
        
        // Default success if we got here
        console.log('✅ SMS OTP sent successfully (default)');
        
        // Log successful SMS
        await logSMS({
            phone: phoneNumber,
            name: vendorName,
            message: smsText,
            purpose: "OTP",
            status: "Success",
            response: response.data,
            vendorId,
            userId,
        });
        
        return {
            success: true,
            message: 'SMS OTP sent successfully',
            data: response.data
        };
    } catch (error) {
        console.error('❌ Error sending SMS OTP:', error);
        
        // Log failed SMS
        await logSMS({
            phone: phoneNumber,
            name: vendorName,
            message: smsText,
            purpose: "OTP",
            status: "Failed",
            errorMessage: error.message,
            vendorId,
            userId,
        });
        
        return {
            success: false,
            message: 'Failed to send SMS OTP',
            error: error.message
        };
    }
};

// Send Welcome SMS - Registration Confirmation
const sendWelcomeSMS1 = async (phoneNumber, vendorName, vendorId = null) => {
    const smsText = `Welcome to MeraGharSansaar! Dear ${vendorName} We're glad to have you on our Platform as our service partner. Start receiving customer requests and grow your business with us. Team NiyatiSolutions`;
    
    try {
        const smsUrl = `http://182.18.162.128/api/mt/SendSMS?user=niyatisolutions&password=123456&senderid=NSOLN&channel=trans&DCS=0&flashsms=0&number=91${phoneNumber}&text=${encodeURIComponent(smsText)}&route=29`;
        
        const response = await axios.get(smsUrl);
        
        console.log('Welcome SMS 1 sent successfully:', response.data);
        
        // Log successful SMS
        await logSMS({
            phone: phoneNumber,
            name: vendorName,
            message: smsText,
            purpose: "Welcome",
            status: "Success",
            response: response.data,
            vendorId,
            userId: null,
        });
        
        return {
            success: true,
            message: 'Welcome SMS sent successfully',
            data: response.data
        };
    } catch (error) {
        console.error('Error sending Welcome SMS 1:', error);
        
        // Log failed SMS
        await logSMS({
            phone: phoneNumber,
            name: vendorName,
            message: smsText,
            purpose: "Welcome",
            status: "Failed",
            errorMessage: error.message,
            vendorId,
            userId: null,
        });
        
        return {
            success: false,
            message: 'Failed to send Welcome SMS',
            error: error.message
        };
    }
};

// Send Welcome SMS - Account Registered
const sendWelcomeSMS2 = async (phoneNumber, vendorName, supportContact = '+91 78798 84363', vendorId = null) => {
    const smsText = `Welcome to MeraGharSansaar! Dear ${vendorName} Your service provider account is successfully registered. You can now start receiving service requests. For support, contact ${supportContact}. Regards: NiyatiSolutions`;
    
    try {
        const smsUrl = `http://182.18.162.128/api/mt/SendSMS?user=niyatisolutions&password=123456&senderid=NSOLN&channel=trans&DCS=0&flashsms=0&number=91${phoneNumber}&text=${encodeURIComponent(smsText)}&route=29`;
        
        const response = await axios.get(smsUrl);
        
        console.log('Welcome SMS 2 sent successfully:', response.data);
        
        // Log successful SMS
        await logSMS({
            phone: phoneNumber,
            name: vendorName,
            message: smsText,
            purpose: "Welcome",
            status: "Success",
            response: response.data,
            vendorId,
            userId: null,
        });
        
        return {
            success: true,
            message: 'Registration confirmation SMS sent successfully',
            data: response.data
        };
    } catch (error) {
        console.error('Error sending Welcome SMS 2:', error);
        
        // Log failed SMS
        await logSMS({
            phone: phoneNumber,
            name: vendorName,
            message: smsText,
            purpose: "Welcome",
            status: "Failed",
            errorMessage: error.message,
            vendorId,
            userId: null,
        });
        
        return {
            success: false,
            message: 'Failed to send registration confirmation SMS',
            error: error.message
        };
    }
};

// Send SMS approval message (Hindi)
const sendApprovalSMS = async (phoneNumber, vendorName = null, vendorId = null) => {
    const smsText = `मेराघरसंसार में आपका सेवा प्रदाता पंजीकरण सफल हो गया है। अब आप सेवा अनुरोध प्राप्त कर सकते हैं। NIYATI SOLUTIONS`;
    
    try {
        const smsUrl = `http://182.18.162.128/api/mt/SendSMS?user=niyatisolutions&password=123456&senderid=NSOLN&channel=trans&DCS=8&flashsms=0&number=91${phoneNumber}&text=${encodeURIComponent(smsText)}&route=29`;
        
        const response = await axios.get(smsUrl);
        
        console.log('✅ Approval SMS sent successfully:', response.data);
        
        // Log successful SMS
        await logSMS({
            phone: phoneNumber,
            name: vendorName,
            message: smsText,
            purpose: "Approval",
            status: "Success",
            response: response.data,
            vendorId,
            userId: null,
        });
        
        return {
            success: true,
            message: 'Approval SMS sent successfully',
            data: response.data
        };
    } catch (error) {
        console.error('❌ Error sending approval SMS:', error);
        
        // Log failed SMS
        await logSMS({
            phone: phoneNumber,
            name: vendorName,
            message: smsText,
            purpose: "Approval",
            status: "Failed",
            errorMessage: error.message,
            vendorId,
            userId: null,
        });
        
        return {
            success: false,
            message: 'Failed to send approval SMS',
            error: error.message
        };
    }
};

// Send WhatsApp approval message (Hindi)
const sendApprovalWhatsApp = async (whatsappNumber, vendorName = null, vendorId = null) => {
    const messageText = "मेराघरसंसार में आपका सेवा प्रदाता पंजीकरण सफल हो गया है। अब आप सेवा अनुरोध प्राप्त कर सकते हैं।";
    
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
                // Log successful WhatsApp
                await logWhatsApp({
                    phone: whatsappNumber,
                    name: vendorName,
                    message: messageText,
                    purpose: "Approval",
                    status: "Success",
                    response: response.data,
                    vendorId,
                    userId: null,
                });
                
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
        
        // Log failed WhatsApp
        await logWhatsApp({
            phone: whatsappNumber,
            name: vendorName,
            message: messageText,
            purpose: "Approval",
            status: "Failed",
            errorMessage: error.message,
            vendorId,
            userId: null,
        });
        
        return {
            success: false,
            message: 'Failed to send WhatsApp approval message',
            error: error.response?.data || error.message
        };
    }
};

// Send WhatsApp welcome message
const sendWhatsAppWelcome = async (whatsappNumber, vendorName, supportContact = '+91 78798 84363', vendorId = null) => {
    const messageText = `Welcome to MeraGharSansaar! Dear ${vendorName}, Your service provider account is successfully registered. For support, contact ${supportContact}.`;
    
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
                // Log successful WhatsApp
                await logWhatsApp({
                    phone: whatsappNumber,
                    name: vendorName,
                    message: messageText,
                    purpose: "Welcome",
                    status: "Success",
                    response: response.data,
                    vendorId,
                    userId: null,
                });
                
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
        
        // Log failed WhatsApp
        await logWhatsApp({
            phone: whatsappNumber,
            name: vendorName,
            message: messageText,
            purpose: "Welcome",
            status: "Failed",
            errorMessage: error.message,
            vendorId,
            userId: null,
        });
        
        return {
            success: false,
            message: 'Failed to send WhatsApp welcome message',
            error: error.response?.data || error.message
        };
    }
};

// Send WhatsApp OTP
const sendWhatsAppOTP = async (whatsappNumber, otp, vendorId = null, userId = null, vendorName = null) => {
    const messageText = `Your OTP for mobile number verification is ${otp}. This code is valid for 10 minutes.`;
    
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

        console.log('🔄 Attempting WhatsApp OTP to:', whatsappNumber);

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
                // Log successful WhatsApp
                await logWhatsApp({
                    phone: whatsappNumber,
                    name: vendorName,
                    message: messageText,
                    purpose: "OTP",
                    status: "Success",
                    response: response.data,
                    vendorId,
                    userId,
                });
                
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
        
        // Log failed WhatsApp
        await logWhatsApp({
            phone: whatsappNumber,
            name: vendorName,
            message: messageText,
            purpose: "OTP",
            status: "Failed",
            errorMessage: error.message,
            vendorId,
            userId,
        });
        
        // Check for insufficient credits error
        if (error.response?.data?.response?.[0]?.status?.includes('Insufficient credits')) {
            console.error('❌ WhatsApp insufficient credits');
            
            // Try SMS fallback
            console.log('🔄 WhatsApp failed due to insufficient credits, trying SMS fallback...');
            try {
                const smsResult = await sendSMSOTP(whatsappNumber, otp, vendorId, userId, vendorName);
                
                if (smsResult.success) {
                    return {
                        success: true,
                        message: 'OTP sent via SMS (WhatsApp credits insufficient)',
                        data: smsResult.data,
                        method: 'sms_fallback',
                        originalMethod: 'whatsapp'
                    };
                } else if (smsResult.errorCode === '21') {
                    // Both services have insufficient credits
                    return {
                        success: false,
                        message: 'OTP service temporarily unavailable. Please contact support or try again later.',
                        error: 'Both WhatsApp and SMS services have insufficient credits'
                    };
                }
            } catch (smsError) {
                console.error('❌ SMS fallback also failed:', smsError);
            }
        }
        
        // For other WhatsApp errors, try SMS fallback
        console.log('🔄 WhatsApp failed, trying SMS fallback...');
        try {
            const smsResult = await sendSMSOTP(whatsappNumber, otp, vendorId, userId, vendorName);
            
            if (smsResult.success) {
                return {
                    success: true,
                    message: 'OTP sent via SMS (WhatsApp temporarily unavailable)',
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
            message: 'Failed to send OTP. Please try again or contact support.',
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